#!/usr/bin/env node
// PostToolUse hook (Write|Edit|MultiEdit): formats the file Claude just changed
// with Prettier. Never blocks: formatting errors are ignored.
const { spawnSync } = require("child_process");
const path = require("path");

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  const file = (input.tool_input && input.tool_input.file_path) || "";
  if (!/\.(ts|tsx|js|jsx|mjs|cjs|json|css|md)$/i.test(file)) process.exit(0);
  if (/[\\/](node_modules|dist|build)[\\/]/.test(file) || /package-lock\.json$/.test(file)) process.exit(0);

  const root = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "..", "..");
  spawnSync("npx", ["--yes", "prettier@3.3.3", "--write", "--log-level", "warn", `"${file}"`], {
    cwd: root,
    shell: process.platform === "win32",
    stdio: "ignore",
    timeout: 60000,
  });
  process.exit(0);
});
