#!/usr/bin/env node
// PreToolUse hook (Write|Edit|MultiEdit): blocks test changes that break the
// rules in .claude/rules/e2e-tests.md and .claude/rules/backend-tests.md.
// Only NEW violations are blocked: pre-existing ones in a file don't count.
const fs = require("fs");

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }
  const ti = input.tool_input || {};
  const file = String(ti.file_path || "").replace(/\\/g, "/");

  const isE2e = /\/e2e\/[^/]+\.(spec|test)\.[cm]?[jt]sx?$/.test(file);
  const isJavaTest = /apps\/backend\/src\/test\/.+Test\.java$/.test(file);
  if (!isE2e && !isJavaTest) process.exit(0);

  const isFlake = /\/flake-[^/]+$/.test(file); // intentionally flaky demo specs

  const e2eRules = [
    [/\b(test|describe|it)\.only\(/g, "`.only(` left in — it silently skips every other test"],
    [/\b(test|describe|it)\.skip\(/g, "`.skip(` — don't add skipped tests"],
    [/\bwaitForTimeout\(/g, "fixed `waitForTimeout` — wait with `expect(...)` instead", !isFlake],
    [/\bsetTimeout\(/g, "`setTimeout` sleep — wait with `expect(...)` instead", !isFlake],
    [/\bgetByTestId\(/g, "`getByTestId` — select by role/label/text"],
    [/\.locator\(\s*["'`][.#\[a-z]/gi, "CSS selector in `locator(...)` — use getByRole/getByLabel/getByText"],
  ];
  const javaRules = [
    [/@Disabled\b/g, "`@Disabled` — don't add disabled tests"],
    [/\bThread\.sleep\(/g, "`Thread.sleep` in a test"],
    [/\bSystem\.(out|err)\.print/g, "`System.out/err` printing instead of assertions"],
  ];
  const rules = (isE2e ? e2eRules : javaRules).filter((r) => r[2] !== false);
  const count = (s, re) => ((s || "").match(re) || []).length;

  // Pairs of [removed text, added text] for this tool call.
  let pairs = [];
  let fullAfter = null; // only known for Write
  if (input.tool_name === "Write") {
    let before = "";
    try {
      before = fs.readFileSync(ti.file_path, "utf8");
    } catch {}
    pairs = [[before, ti.content || ""]];
    fullAfter = ti.content || "";
  } else if (input.tool_name === "Edit") {
    pairs = [[ti.old_string, ti.new_string]];
  } else if (input.tool_name === "MultiEdit") {
    pairs = (ti.edits || []).map((e) => [e.old_string, e.new_string]);
  } else {
    process.exit(0);
  }

  const problems = [];
  for (const [re, msg] of rules) {
    const delta = pairs.reduce((d, [o, n]) => d + count(n, re) - count(o, re), 0);
    if (delta > 0) problems.push(msg);
  }

  // Whole-file checks when the full new content is known.
  if (fullAfter !== null) {
    if (isE2e) {
      const tests = count(fullAfter, /\btest\(\s*["'`]/g);
      if (tests > 0 && count(fullAfter, /\bexpect\(/g) === 0)
        problems.push("spec has tests but no `expect(...)` assertions");
    } else {
      const tests = count(fullAfter, /@Test\b/g);
      if (tests > 0 && count(fullAfter, /andExpect\(|assert\w*\(|assertThat\(/g) === 0)
        problems.push("test class has `@Test` methods but no assertions");
      if (/@SpringBootTest/.test(fullAfter) && !/@ActiveProfiles\(\s*"test"\s*\)/.test(fullAfter))
        problems.push('`@SpringBootTest` without `@ActiveProfiles("test")` — it would hit the real DB');
    }
  }

  if (problems.length === 0) process.exit(0);
  require("./log-blocked")("block-bad-tests", input, problems);

  const reason =
    `Blocked bad test change in ${file}:\n- ` +
    problems.join("\n- ") +
    `\nSee .claude/rules/${isE2e ? "e2e-tests" : "backend-tests"}.md. Fix the test and retry.`;
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
});
