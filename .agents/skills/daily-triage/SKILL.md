---
name: daily-triage
description: Use in CI (daily schedule) or when asked to "run the daily triage" - finds new GlitchTip issues in the backend, web and admin projects, skips the ones already triaged, runs triage-pipeline on each new one in unattended mode, opens a Jira bug per issue and writes triage-summary.md for the Telegram step.
---

# Daily triage (unattended)

This skill runs **without a human**. Never use AskUserQuestion. Where triage-pipeline
would ask the human, follow the "Unattended rules" below instead.

## Inputs

- GlitchTip organization: `<org-slug>`, projects: `<backend-slug>`, `<web-slug>`, `<admin-slug>`.
- Window: issues whose **first seen** is in the last 24 hours (or `$TRIAGE_SINCE` if set).
- Limit: at most `$MAX_ISSUES` issues per run (default 5). Pick the ones with the most events first.

## Steps

1. **Collect.** With the GlitchTip MCP, list unresolved issues in the three projects
   first seen inside the window. Save them to `agentic-workflows/triage/daily/<date>/candidates.json`
   (`id`, `project`, `title`, `culprit`, `count`, `firstSeen`, `permalink`).
2. **Filter out noise.** Skip, with a reason in `candidates.json`:
   - known demo behaviour from CLAUDE.md: `FlakyHeartbeatJob`, `flakyHeartbeat`, `/api/debug/boom`;
   - issues that already have a Jira ticket: search Jira with
     `labels = ai-triage AND text ~ "<GlitchTip issue id>"`.
3. **Triage.** For each remaining issue, load the `triage-pipeline` skill with the issue id
   and **unattended: true**, and follow it to the end. Run issues one after another, not in parallel.
4. **Summarise.** Write `triage-summary.md` in the repo root (format below). The workflow
   sends this file to Telegram, so keep it under 3500 characters and plain text.

## Unattended rules (replace every human review in triage-pipeline)

| triage-pipeline step | Human in the loop | In this skill |
|---|---|---|
| Confirm the problem | human confirms | confirm it yourself from GlitchTip events + Loki; if you can't, record `unconfirmed` and still report it |
| Workers & hypotheses | — | same as triage-pipeline |
| triage-judge (phase 2) | — | same; the judge's JSON verdict is saved word for word |
| Show candidates, human picks | human approves | **don't pick**: put every candidate with its confidence and artifacts into the Jira bug |
| Write to Jira | after approval | create the bug with label `ai-triage` and `needs-human-review`, status To Do; a human approves in Jira |

Never close, resolve or assign issues in GlitchTip. Never change code. If the judge verdict
is `fail` or `blocked`, still open the bug, but add `judge-failed` and say why in the description.

## Jira bug

- Project `KAN`, type Bug, labels `ai-triage`, `needs-human-review`, `glitchtip-<project>`.
- Summary: `[AI triage] <GlitchTip title>`.
- Description: GlitchTip link and id, first/last seen, event count, the root-cause candidates
  ranked by confidence (each with its evidence: log line, metric, trace, screenshot path),
  the judge verdict, and steps to reproduce if a worker reproduced it.

## triage-summary.md

```
🔎 Daily triage <date> — <N> new issues, <M> triaged, <K> skipped

1. [backend] <title>
   Root cause (high): <one line>
   Jira: KAN-123 · GlitchTip: <link>
2. ...

Skipped: <id> demo flaky heartbeat · <id> already KAN-98
```

If nothing is new, write `✅ Daily triage <date> — no new issues` so the bot still reports.

## When something fails

- GlitchTip, Jira or Grafana MCP not reachable: write the error to `triage-summary.md`
  as `⛔ <what failed>` and stop. Don't guess results.
- One issue fails mid-triage: note it in the summary and continue with the next one.

STATUS: DONE | BLOCKED: <reason>