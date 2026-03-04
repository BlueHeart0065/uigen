import { test, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MainContent } from "../main-content";

// Mock all complex dependencies
vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">File Tree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">Code Editor</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">Preview Frame</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">Header Actions</div>,
}));

vi.mock("@/components/ui/resizable", () => ({
  ResizablePanelGroup: ({ children, className }: any) => (
    <div className={className} data-testid="resizable-group">
      {children}
    </div>
  ),
  ResizablePanel: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  ResizableHandle: ({ className }: any) => (
    <div className={className} data-testid="resizable-handle" />
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

test("renders preview view by default", () => {
  render(<MainContent />);

  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
  expect(screen.queryByTestId("file-tree")).toBeNull();
});

test("renders Preview and Code toggle buttons", () => {
  render(<MainContent />);

  expect(screen.getByText("Preview")).toBeDefined();
  expect(screen.getByText("Code")).toBeDefined();
});

test("switches to code view when Code button is clicked", () => {
  render(<MainContent />);

  // Initially shows preview
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();

  // Click the Code tab
  fireEvent.click(screen.getByText("Code"));

  // Now shows code editor
  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.getByTestId("file-tree")).toBeDefined();
  expect(screen.queryByTestId("preview-frame")).toBeNull();
});

test("switches back to preview view when Preview button is clicked", () => {
  render(<MainContent />);

  // Switch to code first
  fireEvent.click(screen.getByText("Code"));
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Switch back to preview
  fireEvent.click(screen.getByText("Preview"));
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("can toggle between preview and code multiple times", () => {
  render(<MainContent />);

  // Start: preview
  expect(screen.getByTestId("preview-frame")).toBeDefined();

  // Toggle to code
  fireEvent.click(screen.getByText("Code"));
  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.queryByTestId("preview-frame")).toBeNull();

  // Toggle back to preview
  fireEvent.click(screen.getByText("Preview"));
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();

  // Toggle to code again
  fireEvent.click(screen.getByText("Code"));
  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.queryByTestId("preview-frame")).toBeNull();

  // Toggle back to preview again
  fireEvent.click(screen.getByText("Preview"));
  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("Preview tab trigger has active state when preview is selected", () => {
  render(<MainContent />);

  const previewTrigger = screen.getByText("Preview").closest("[data-slot='tabs-trigger']");
  expect(previewTrigger?.getAttribute("data-state")).toBe("active");

  const codeTrigger = screen.getByText("Code").closest("[data-slot='tabs-trigger']");
  expect(codeTrigger?.getAttribute("data-state")).toBe("inactive");
});

test("Code tab trigger has active state when code is selected", () => {
  render(<MainContent />);

  fireEvent.click(screen.getByText("Code"));

  const codeTrigger = screen.getByText("Code").closest("[data-slot='tabs-trigger']");
  expect(codeTrigger?.getAttribute("data-state")).toBe("active");

  const previewTrigger = screen.getByText("Preview").closest("[data-slot='tabs-trigger']");
  expect(previewTrigger?.getAttribute("data-state")).toBe("inactive");
});

test("renders chat interface", () => {
  render(<MainContent />);

  expect(screen.getByTestId("chat-interface")).toBeDefined();
});

test("renders header actions", () => {
  render(<MainContent />);

  expect(screen.getByTestId("header-actions")).toBeDefined();
});

test("renders with user prop", () => {
  const user = { id: "user-1", email: "test@example.com" };
  render(<MainContent user={user} />);

  expect(screen.getByTestId("preview-frame")).toBeDefined();
});

test("renders with project prop", () => {
  const project = {
    id: "project-1",
    name: "Test Project",
    messages: [],
    data: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  render(<MainContent project={project} />);

  expect(screen.getByTestId("preview-frame")).toBeDefined();
});
