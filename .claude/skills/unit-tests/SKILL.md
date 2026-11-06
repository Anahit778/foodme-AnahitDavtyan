---
name: unit-tests
description: Design manual unit-level test cases for FoodMe. Use when a change, bug fix, or QA request calls for checking the behavior of one function, calculation, or validation rule in isolation.
---

# Writing manual unit-level checks

1. Read the code under test, the relevant requirements, and nearby tests. Identify the rule to check, its inputs, its expected outputs, and any dependencies. Find an existing way to exercise the rule in isolation and observe its result manually.

2. Give each test case a name that describes the scenario and expected outcome. Specify the preconditions, exact test data, numbered steps, expected result, and how to observe it. The expected result can be a value, a state change, or a validation error. Check the exact error message when its wording is part of the requirement. If the expected behavior is unclear, flag it for clarification before using the current implementation as the expected result.

3. Cover the happy path, relevant invalid inputs, and applicable error paths. Choose edge cases that make sense for the rule, such as empty input, zero, null, undefined, or a large value. For a character-count boundary, check one value below the limit, one at the limit, and one above it. Keep unrelated inputs valid and unchanged.

4. If the rule cannot be exercised in isolation through an existing manual entry point, document the inputs and expected outputs in a table and mark isolated execution as **Blocked**. Record any browser-based check separately as a component-level check.


## Checklist before finishing

- [ ] Each case targets one rule and has a name that describes the scenario and expected outcome.
- [ ] Relevant happy paths, invalid inputs, boundary values, and error paths are covered.
- [ ] Each case has concrete data, reproducible steps, and an observable expected result.
- [ ] Each case starts from its own preconditions and can be checked independently.
- [ ] Unclear expectations and checks that cannot be performed in isolation are identified.
- [ ] Execution statuses reflect what was actually checked.

## Report

Summarize the behaviors covered and list any gaps, unclear requirements, or bugs found. For executed cases, record the build or environment, actual result, and evidence where available. If a case could not be run, explain why.

- **Pass** — The observed result matches the expected result.
- **Fail** — The observed result differs from the expected result.
- **Not Run** — The case was written and execution is pending.
- **Blocked** — A required precondition or manual entry point is unavailable. State what is missing.