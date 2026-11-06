// Shared helper: appends one JSON line per blocked action to the file named by
// the BLOCK_LOG env var (set in .claude/settings.json).
//   BLOCK_LOG unset -> .claude/logs/blocked-actions.jsonl
//   BLOCK_LOG ""    -> logging off
//   relative paths are resolved from the project root.
// Never throws — logging must not break a hook.
const fs = require("fs");
const path = require("path");

module.exports = function logBlocked(hook, input, reasons) {
  try {
    const setting = process.env.BLOCK_LOG;
    if (setting !== undefined && setting.trim() === "") return;
    const root = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "..", "..");
    const file = path.resolve(root, setting || ".claude/logs/blocked-actions.jsonl");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const ti = input.tool_input || {};
    const entry = {
      time: new Date().toISOString(),
      hook,
      session: input.session_id,
      tool: input.tool_name,
      target: ti.command || ti.file_path || "",
      reasons,
    };
    fs.appendFileSync(file, JSON.stringify(entry) + "\n");
  } catch {}
};
