---
name: daily-triage
description: Use in CI (daily schedule) or when asked to "run the daily triage" - finds new GlitchTip issues in the backend, web and admin projects, skips the ones already triaged, runs triage-pipeline on each new one in unattended mode, opens a Jira bug per issue and writes triage-summary.md for the Telegram step.
---

# Daily triage (unattended)

This skill runs **without a human** (GitHub Actions: `.github/workflows/daily-triage.yml`,
MCP servers from `.github/mcp-ci.json`). Never use AskUserQuestion and never wait for an answer.
Where triage-pipeline would ask the human, it follows its own **Unattended mode** section.

## Inputs

- GlitchTip organization `foodme` (fixed in the MCP config). It holds three projects: the
  backend, the storefront (web) and the back office (admin). Map each issue to `backend`, `web`
  or `admin` from its `project.slug` / `project.name` (backend/api/spring/java → `backend`;
  web/storefront/react → `web`; admin/backoffice → `admin`). Record the mapping you used in
  `candidates.json`. An issue from any other project is skipped with reason `other project`.
- Window: issues whose `firstSeen` is in the last 24 hours, or since `TRIAGE_SINCE` if the prompt
  gives a non-empty value.
- Limit: at most `MAX_ISSUES` issues per run (default 5). Pick the ones with the highest `count` first.
  Issues over the limit are skipped with reason `over limit` (the next run picks them up only if
  the window still covers them, so say so in the summary).

## Steps

1. **Collect.** Call `mcp__glitchtip__glitchtip_issues` once. It takes no arguments and returns
   **all unresolved issues of the org**; filter them yourself by project and `firstSeen`.
   Save the in-window issues to `agentic-workflows/triage/daily/<yyyy-mm-dd>/candidates.json`:
   `id`, `shortId`, `project` (slug), `area` (backend/web/admin), `title`, `culprit`, `count`,
   `firstSeen`, `lastSeen`, `permalink` (copy it from the tool output, never build one),
   `decision` (`triage` | `skip`) and `reason`.
2. **Filter out noise.** Mark as `skip`, with the reason:
   - intended demo behaviour from `CLAUDE.md`: titles or culprits from `FlakyHeartbeatJob`,
     `flakyHeartbeat` (web/admin), `/api/debug/boom`, and simulated-latency timeouts;
   - issues already in Jira: `mcp__jira__jira_search` with
     `project = KAN AND labels = "gt-<GlitchTip issue id>"`. A hit → skip with `already <KAN-n>`.
3. **Triage.** For each issue left (most events first), load the `triage-pipeline` skill with the
   GlitchTip issue id as the problem and **`unattended: true`**, and follow it to the end
   (T1–T7). Run id: `TRI-<yyyymmdd>-gt<id>`. One issue after another, never in parallel.
   triage-pipeline's T6 creates the Jira bug described below; don't create a second one here.
4. **Summarise.** Write `triage-summary.md` in the repo root (format below).

## Jira bug (created by triage-pipeline T6 in unattended mode)

Load the `jira` skill and follow it, with these overrides:

- Project `KAN`, issue type `Баг` (Bug, id 10010).
- Summary: `Bug: [AI triage] <GlitchTip title>` (≤ 120 chars).
- Labels: `bug`, `ai-triage`, `needs-human-review`, `gt-<GlitchTip issue id>`, and the area label
  (`backend`, `web` or `admin`). **Not** `agent-ready`: a human reviews it first.
- Priority: from the jira skill's rubric, based on the top candidate's evidence. If nothing is
  better than Possible, use `Medium` and say "priority provisional: root cause unconfirmed".
- Description: the jira skill's bug template, plus:
  - GlitchTip link and id, project, first/last seen, event count;
  - **every** root-cause candidate in rank order with its rating, mechanism and key artifacts
    (log line, Explore link, GlitchTip event, screenshot path) — don't pick one;
  - the judge verdict (and `judge-failed: <why>` if it was `fail` or `blocked`);
  - steps to reproduce if a worker reproduced it, otherwise "not reproduced in CI: <why>";
  - proposed Grafana annotation windows (not applied);
  - the line `Run artifacts: GitHub Actions run, artifact triage-<run id>, folder agentic-workflows/triage/runs/<run id>/`.
- Status stays To Do. **Don't** add it to a sprint, assign it, or transition it.
- If the judge failed, also add the label `judge-failed`.

Never close, resolve or assign issues in GlitchTip. Never change code.

## triage-summary.md

Plain text, under 3500 characters (the workflow sends it to Telegram):

```
🔎 Daily triage <yyyy-mm-dd> — <N> new issues, <M> triaged, <K> skipped

1. [backend] <title>
   Root cause (<rating>): <one line>
   Jira: KAN-123 · GlitchTip: <permalink>
2. ...

Skipped: <id> demo flaky heartbeat · <id> already KAN-98 · <id> over limit
```

If nothing is new: `✅ Daily triage <yyyy-mm-dd> — no new issues`.

## When something fails

- GlitchTip or Jira MCP not connected or returning an error at step 1–2: write
  `⛔ Daily triage <date>: <what failed>` to `triage-summary.md` and stop. Don't guess results.
- Grafana or Playwright MCP not connected: triage-pipeline stops with BLOCKED for that issue;
  note it in the summary as `⛔ <id>: <server> MCP not connected` and stop the run (every
  other issue would fail the same way).
- One issue fails mid-triage for another reason: note `⚠️ <id>: <reason>` in the summary and
  continue with the next one.

End with `STATUS: DONE` or `STATUS: BLOCKED: <reason>`.
