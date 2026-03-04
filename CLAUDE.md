# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Initial setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development server with Turbopack hot reload
npm run dev

# Background development server (logs to logs.txt)
npm run dev:daemon

# Production build and start
npm run build && npm run start

# Lint
npm run lint

# Run all tests
npm run test

# Run a single test file
npx vitest run src/lib/__tests__/file-system.test.ts

# Database reset (destructive)
npm run db:reset

# Regenerate Prisma client after schema changes
npx prisma generate

# Apply new migrations
npx prisma migrate dev
```

## Environment

Set `ANTHROPIC_API_KEY` in `.env`. Without it, the app uses a `MockLanguageModel` fallback (capped at 4 agentic steps).

## Architecture

### Overview

Three-panel UI: chat (left) → Claude generates/edits code → live preview + Monaco editor (right). All generated files live in a **virtual in-memory filesystem**—nothing is written to disk at runtime.

### Key Data Flow

1. User sends a message in `ChatInterface` → POST to `/api/chat`
2. `/api/chat/route.ts` streams a response using Vercel AI SDK (`streamText`) with two tools available to Claude:
   - `str_replace_editor` ([src/lib/tools/str-replace.ts](src/lib/tools/str-replace.ts)) — edits file content
   - `file_manager` ([src/lib/tools/file-manager.ts](src/lib/tools/file-manager.ts)) — creates/deletes files and directories
3. Tool calls mutate the `VirtualFileSystem` instance on the server
4. On finish, the updated filesystem and messages are serialized as JSON and persisted to the `Project` row in SQLite (only for authenticated users)
5. The frontend receives streamed deltas; `FileSystemContext` updates trigger re-renders of the preview and code editor

### State Management

- [src/lib/contexts/chat-context.tsx](src/lib/contexts/chat-context.tsx) — message history, loading state
- [src/lib/contexts/file-system-context.tsx](src/lib/contexts/file-system-context.tsx) — virtual filesystem nodes and selected file

Both contexts are provided in [src/app/main-content.tsx](src/app/main-content.tsx).

### Virtual File System

[src/lib/file-system.ts](src/lib/file-system.ts) implements an in-memory tree (`VirtualFileSystem`). Key methods: `createFile`, `readFile`, `updateFile`, `deleteFile`, `serialize` / `deserializeFromNodes`. The serialized form is stored as a JSON string in `Project.data`.

### Authentication

JWT sessions via `jose` + `bcrypt` hashing. Session cookie has 7-day expiry. [src/lib/auth.ts](src/lib/auth.ts) (server-only) handles session creation/verification. [src/middleware.ts](src/middleware.ts) protects `/api/projects` and `/api/filesystem` — `/api/chat` is intentionally unprotected. Server actions in [src/actions/index.ts](src/actions/index.ts) handle sign-up and sign-in.

Anonymous users' work is tracked in `sessionStorage` via [src/lib/anon-work-tracker.ts](src/lib/anon-work-tracker.ts), enabling work-preservation prompts on sign-up.

### Database

Prisma + SQLite (`prisma/dev.db`). Two models:
- `User` — email/password, owns projects
- `Project` — stores serialized `messages` and `data` (filesystem state) as JSON strings; `userId` is optional (anonymous projects exist but are not persisted to the DB)

Prisma client is generated to `src/generated/prisma/` (gitignored; regenerate with `npx prisma generate`).

### JSX Preview

[src/lib/transform/jsx-transformer.ts](src/lib/transform/jsx-transformer.ts) transforms JSX to `React.createElement` calls via `@babel/standalone` so components can be evaluated in the browser preview iframe ([src/components/preview/PreviewFrame.tsx](src/components/preview/PreviewFrame.tsx)).

### AI Prompt

System prompt is defined in [src/lib/prompts/generation.tsx](src/lib/prompts/generation.tsx) and injected as the first message with Anthropic prompt caching (`cacheControl: { type: "ephemeral" }`). Max steps: 40 (real) / 4 (mock). The real model is `claude-haiku-4-5` (set in [src/lib/provider.ts](src/lib/provider.ts)).

### Node Compatibility

`node-compat.cjs` is required via `NODE_OPTIONS` in all server scripts. It removes the `localStorage`/`sessionStorage` globals that Node 25+ exposes by default, preventing SSR errors where server-side code detects these globals and assumes a browser environment.

### Path Aliases

`@/*` maps to `src/*` (configured in `tsconfig.json`).