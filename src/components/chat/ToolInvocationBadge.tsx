"use client";

import { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

export function getToolLabel(toolName: string, args: Record<string, string>): string {
  const basename = (p: string) => p?.split("/").pop() ?? p;

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return `Creating ${basename(args.path)}`;
      case "str_replace":
      case "insert":
        return `Editing ${basename(args.path)}`;
      case "view":
        return `Reading ${basename(args.path)}`;
      case "undo_edit":
        return `Undoing edit to ${basename(args.path)}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "delete":
        return `Deleting ${basename(args.path)}`;
      case "rename":
        return `Renaming ${basename(args.path)} → ${basename(args.new_path)}`;
    }
  }

  return toolName;
}

interface ToolInvocationBadgeProps {
  tool: ToolInvocation;
}

export function ToolInvocationBadge({ tool }: ToolInvocationBadgeProps) {
  const label = getToolLabel(tool.toolName, tool.args as Record<string, string>);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {tool.state === "result" && tool.result ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
