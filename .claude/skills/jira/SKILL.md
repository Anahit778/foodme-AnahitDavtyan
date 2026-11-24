---
name: jira
description: Use when creating, updating, triaging or reading Jira tickets for FoodMe (project KAN), including filing a bug found during QA or triage, commenting a triage result, linking duplicates, or re-prioritising an existing bug.
---

# Working with Jira (FoodMe)

## Site facts

| | |
|---|---|
| MCP server | `jira` in the repo-root `.mcp.json` (mcp-atlassian; credentials come from `agentsecrets`). Tools are `mcp__jira__jira_*`. |
| Project | `KAN` ("Ai in QA"). Board id `2` ("KAN board", type `simple`). Ignore `SAM1`, which is Atlassian sample data. |
| Issue types (the site is in Russian) | `Баг` = Bug (id 10010), `Задание` = Task (10008), `История` = Story (10009), `Подзадача` = Subtask (10007), `Эпик` = Epic (10006) |
| Priorities | `Highest`, `High`, `Medium`, `Low`, `Lowest` |

Tools: `jira_get_issue`, `jira_search` (JQL), `jira_create_issue`, `jira_update_issue`, `jira_add_comment`, `jira_get_link_types`, `jira_create_issue_link`, `jira_get_sprints_from_board`, `jira_add_issues_to_sprint`, `jira_get_transitions`, `jira_transition_issue`. If a call rejects an issue type or priority name, read the valid values with `jira_get_project_issue_types` / `jira_get_create_fields` instead of guessing.

## Ticket shapes

| Kind | Issue type | Summary | Labels | Template |
|---|---|---|---|---|
| Bug | `Баг` | `Bug: <what the user sees go wrong>` | `bug`, `agent-ready`, and area labels | `templates/bug-report.md` |
| Task (a slice of a feature) | `Подзадача` with `parent` = the feature | outcome in plain words, no prefix | `agent-ready`, and area labels | none |

Area labels: `web`, `admin`, `backend`, `cart`, `checkout`, `security`. Reuse these before inventing new ones. Triage adds `triaged`.

Write descriptions in Markdown, for a non-technical reader: say what the customer sees, not class names. Put technical detail (endpoints, request bodies, log lines) only where it is needed to reproduce or explain the problem.

## Rule: every new ticket goes into the active sprint

After `jira_create_issue`, find the active sprint with `jira_get_sprints_from_board` (`board_id: "2"`, `state: "active"`) and add the ticket with `jira_add_issues_to_sprint`.

If that fails (no active sprint, or the board doesn't support sprints), the ticket is still created. **Report the failure to the user** and name the ticket that isn't in a sprint. Don't create a sprint, turn sprints on, or pick a future sprint unless the user asks for it.

## Rule: for bugs, set priority from your own review

Don't copy the reporter's priority, and don't leave the `Medium` default. Base it on the evidence (the repro, the triage artifacts): how many users it hits and what it costs them.

| Priority | When | Examples |
|---|---|---|
| **Highest** | Money is wrong, data gets corrupted, or a security/validation hole can be exploited. No workaround. | negative quantities accepted; saved order total ≠ checkout total |
| **High** | A core flow (browse → basket → checkout → order) is broken or blocks revenue for some users. A workaround exists but is not obvious. | a disabled dish can be ordered; basket "−" removes the dish |
| **Medium** | Wrong behaviour at an edge or boundary, or wrong display with little cost. | delivery charged at exactly the threshold; order times in the wrong time zone |
| **Low** | Cosmetic, copy or layout problems, where nothing is lost. | |
| **Lowest** | Nice-to-have polish. | |

Move up one level if the bug hits every user or has no workaround. Move down one level if it needs tampering or a rare setup and causes no harm.

When you change the priority of an existing bug, add a comment with the old and new priority and a one-line reason. On a new bug, put the reason in your reply to the user.

## Workflow

1. Search for duplicates first: `jira_search` with `project = KAN AND summary ~ "<keywords>" ORDER BY created DESC`. If you find one, update it or comment on it instead of creating a new ticket. (In `/triage-pipeline`, this search waits until the root cause is approved.)
2. Fill in the matching template from `templates/`. Keep every heading. Write "None" rather than dropping a section.
3. For bugs, set the priority using the table above.
4. `jira_create_issue` with `project_key: "KAN"`, `issue_type`, `summary`, `description`, and `additional_fields` as a JSON string, e.g. `{"priority": {"name": "High"}, "labels": ["bug", "agent-ready", "checkout"]}`. For a subtask, add the `parent` key. Then the sprint rule above.
5. Tell the user the ticket key and link, the priority and its reason, and whether the sprint assignment worked.

## Things to leave alone

- Don't file the intentional demo behaviour from `CLAUDE.md` as bugs: simulated latency, the flaky heartbeat, `/api/debug/boom` and body logging.
- `FM-BUG-nn` references in tickets point to seeded course defects. Keep them as they are.
- Don't close, delete or transition tickets the user didn't mention.
- No customer PII in tickets. Order numbers and test data are fine.
