import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getToolLabel } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeTool(
  toolName: string,
  args: Record<string, string>,
  state: "call" | "result" = "result"
): ToolInvocation {
  return {
    toolCallId: "test-id",
    toolName,
    args,
    state,
    ...(state === "result" ? { result: "ok" } : {}),
  } as ToolInvocation;
}

// getToolLabel unit tests

test("str_replace_editor create command", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "src/App.jsx" })).toBe("Creating App.jsx");
});

test("str_replace_editor str_replace command", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "src/components/Card.jsx" })).toBe("Editing Card.jsx");
});

test("str_replace_editor insert command", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "src/components/Card.jsx" })).toBe("Editing Card.jsx");
});

test("str_replace_editor view command", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "src/index.ts" })).toBe("Reading index.ts");
});

test("str_replace_editor undo_edit command", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "src/App.jsx" })).toBe("Undoing edit to App.jsx");
});

test("file_manager delete command", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "src/utils.ts" })).toBe("Deleting utils.ts");
});

test("file_manager rename command", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "src/old.jsx", new_path: "src/new.jsx" })).toBe("Renaming old.jsx → new.jsx");
});

test("unknown tool falls back to raw tool name", () => {
  expect(getToolLabel("some_unknown_tool", {})).toBe("some_unknown_tool");
});

test("deep path extracts basename only", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "a/b/c/App.jsx" })).toBe("Creating App.jsx");
});

// Component rendering tests

test("shows green dot when state is result", () => {
  const tool = makeTool("str_replace_editor", { command: "create", path: "App.jsx" }, "result");
  const { container } = render(<ToolInvocationBadge tool={tool} />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("shows spinner when state is not result", () => {
  const tool = makeTool("str_replace_editor", { command: "str_replace", path: "Card.jsx" }, "call");
  const { container } = render(<ToolInvocationBadge tool={tool} />);
  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});
