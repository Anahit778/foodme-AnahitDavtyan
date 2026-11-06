---
name: jira
description: Work with FoodMe issues in Jira. Use when asked to read or review a ticket, extract acceptance criteria, prepare manual QA cases, draft a test result comment, or apply a requested issue update.
---

# Working with Jira issues

1. Read the Jira issue through the connected Atlassian MCP server. Verify
   the Jira site and issue key. Read the description, acceptance criteria,
   and relevant comments. If several issues match, ask which one to use.

2. Summarize the issue in terms a tester can use. For a bug, separate
   the reported behavior, expected behavior, and reproduction steps.
   For a feature, list the acceptance criteria. Flag missing or conflicting
   requirements before using them as expected results.

3. 3. When asked to prepare manual test cases from a Jira issue, choose the
   FoodMe skill that matches the requested coverage:

   - `unit-tests` for an isolated calculation or validation rule.
   - `integration-tests` for data exchange or persistence across components.
   - `e2e-tests` for a complete user journey.
   - `regression-bug-retest` to verify the original defect scenario.
   - `regression-impact-analysis` to identify existing behavior affected by a change.
   - `regression-release-pass` for release-wide regression.
   - `regression-tests` for general regression planning and reporting.

   Link each case to the Jira issue or the acceptance criterion it covers.
   Keep the fix retest separate from related regression checks.
   Mark drafted cases as Not Run.

4. When asked to draft a Jira comment, include the environment or build,
   checks performed, actual results, and any blockers or defect references.
   Use results supplied by the tester or observed during execution.

5. When explicitly asked to update Jira, verify the issue key and the
   requested change. For a status update, check the available transitions.
   After making the update, read the issue again to verify the result.

## FoodMe example

Read the Jira issue for FM-BUG-07 using its actual Jira issue key.
Summarize the cart quantity problem and the expected behavior from the ticket.
Prepare one manual fix retest and three related regression checks.
Mark the cases as Not Run and return the draft for review.

## Checklist before finishing

- [ ] The Jira site and issue key are correct.
- [ ] Reported behavior, expected behavior, and open questions are separate.
- [ ] Each test case traces back to the ticket or an acceptance criterion.
- [ ] Test statuses reflect what was actually executed.
- [ ] Any requested Jira update was verified after applying it.

## Report

Include the issue key and link, a short summary, and the requested output.
List any open requirements or blockers. If Jira was updated, report the
exact change and its verified result.