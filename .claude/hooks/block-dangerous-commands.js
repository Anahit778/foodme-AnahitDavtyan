#!/usr/bin/env node
// PreToolUse hook (Bash|PowerShell): refuses destructive shell commands.
// Recursive force-deletes are only allowed for build/cache folders.
let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  const cmd = String((input.tool_input && input.tool_input.command) || "");
  if (!cmd) process.exit(0);

  // Folders that are safe to wipe with rm -rf / Remove-Item -Recurse -Force.
  const SAFE_TARGET =
    /^["']?(\.\/)?(apps\/(web|admin|backend)\/)?(node_modules|dist|build|\.gradle|playwright-report|test-results|blob-report|coverage|\.vite|out)\/?["']?$/i;

  const problems = [];

  // Split on shell separators so each sub-command is checked on its own.
  for (const part of cmd.split(/&&|\|\||;|\n|\|/)) {
    const p = part.trim();

    // rm with both recursive and force flags (any order: -rf, -fr, -r -f, --recursive --force)
    const rm = p.match(/^(sudo\s+)?rm\s+(.*)$/);
    if (rm) {
      const args = rm[2].split(/\s+/).filter(Boolean);
      const flags = args.filter((a) => a.startsWith("-")).join(" ");
      const recursive = /(^|\s)-[a-z]*r|--recursive/i.test(flags);
      const force = /(^|\s)-[a-z]*f|--force/.test(flags);
      const targets = args.filter((a) => !a.startsWith("-"));
      if (recursive && force && (targets.length === 0 || targets.some((t) => !SAFE_TARGET.test(t))))
        problems.push(`\`rm -rf\` on ${targets.join(" ") || "(no target)"} — only build/cache folders may be force-deleted`);
    }

    // PowerShell recursive delete
    const ps = p.match(/^(Remove-Item|rm|ri|del|rd|rmdir)\s+(.*)$/i);
    if (ps && /-Recurse/i.test(ps[2])) {
      const targets = ps[2]
        .split(/\s+/)
        .filter((a) => a && !a.startsWith("-"));
      if (targets.length === 0 || targets.some((t) => !SAFE_TARGET.test(t)))
        problems.push(`recursive \`Remove-Item\` on ${targets.join(" ") || "(no target)"}`);
    }
  }

  const rules = [
    [/\brmdir\s+\/s\b|\bdel\s+\/[sfq]/i, "cmd.exe recursive delete"],
    [/\bgit\s+push\b[^\n]*(\s--force\b|\s-f\b|--force-with-lease)/, "`git push --force` — rewrites shared history"],
    [/\bgit\s+push\b[^\n]*\b(origin\s+)?(main|master)\b/, "pushing to `main` — work on a branch and open a PR"],
    [/\bgit\s+reset\s+--hard\b/, "`git reset --hard` — discards uncommitted work"],
    [/\bgit\s+clean\s+-[a-z]*f/, "`git clean -f` — deletes untracked files"],
    [/\bgit\s+checkout\s+(--\s+)?\.(\s|$)|\bgit\s+restore\s+\.(\s|$)/, "discarding all local changes"],
    [/\bgit\s+branch\s+-D\b/, "`git branch -D` — force-deletes a branch"],
    [/\b(DROP\s+(DATABASE|SCHEMA|TABLE)|TRUNCATE\s+TABLE)\b/i, "dropping/truncating database objects"],
    [/\bflyway\b[^\n]*\bclean\b|flywayClean/i, "`flyway clean` — wipes the schema"],
    [/\bdocker\s+(system\s+prune|volume\s+(rm|prune))\b/, "deleting Docker volumes/data"],
    [/\b(mkfs|fdisk|diskpart|format\s+[a-z]:)/i, "disk formatting"],
    [/\bdd\s+[^\n]*\bof=\/dev\//, "`dd` onto a device"],
    [/\bchmod\s+(-R\s+)?777\b/, "`chmod 777`"],
    [/\b(curl|wget|iwr|Invoke-WebRequest)\b[^\n]*\|\s*(ba|z)?sh\b|\biex\s*\(|Invoke-Expression/i, "piping downloaded code into a shell"],
    [/:\(\)\s*\{\s*:\|:&\s*\}\s*;:/, "fork bomb"],
    [/\b(shutdown|reboot|Stop-Computer|Restart-Computer)\b/i, "shutting down/rebooting the machine"],
    [/>\s*\/dev\/sd[a-z]/, "overwriting a disk device"],
  ];
  for (const [re, msg] of rules) if (re.test(cmd)) problems.push(msg);

  if (problems.length === 0) process.exit(0);
  require("./log-blocked")("block-dangerous-commands", input, problems);
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          "Blocked dangerous command:\n- " +
          problems.join("\n- ") +
          "\nIf this is really needed, ask the user to run it themselves.",
      },
    }),
  );
  process.exit(0);
});
