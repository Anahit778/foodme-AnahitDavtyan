---
name: regression-bug-retest
description: >-
  Write manual retest and regression cases for a fixed FoodMe bug. Use
  when a fix for an FM-BUG or another reported defect is ready and needs
  confirmation that the bug is gone and that the code around the fix
  still works.
---

# Retesting a fixed bug

1. Read the bug ticket and the fix. Record the FM-BUG number, the original
   reproduction steps, the expected result, and the files the fix changed.
   If the ticket does not state the expected result clearly, flag it for
   clarification before using the fixed behavior as the expected result.

2. Write the retest case first. Use the original reproduction steps and
   test data exactly as written. Run it once on a build without the fix
   and confirm that it fails, so you know the case detects the bug. Then
   run it on the build with the fix. Note both builds so the results can
   be traced. If the case does not fail without the fix, correct the
   steps or data before you continue.

3. Write cases around the fix. Cover neighboring inputs and paths that go
   through the same code. For example, after a cart total fix, check other
   quantities, dish additions, removing an item, and a page reload. After
   an order DTO fix, check the same order in checkout, tracking, and the
   admin order show page. Use the `unit-tests`, `integration-tests`, or
   `e2e-tests` skill for the case format at the right level.

4. Check whether an automated test covers the bug. Search
   `apps/backend/src/test`, `apps/web/e2e`, and `apps/admin/e2e` for the
   FM-BUG number and the affected behavior. Run the matching test, or
   propose a new automated case when none exists. Do not fix other
   seeded `FM-BUG-NN` defects found along the way. Record them as known
   issues.


## Checklist before finishing

- [ ] The FM-BUG number, original repro, expected result, and fixed build are documented.
- [ ] The retest uses the original steps and test data unchanged.
- [ ] The retest fails on a build without the fix and passes on the fixed build.
- [ ] Cases around the fix cover neighboring inputs and every screen that uses the changed code.
- [ ] Matching automated tests are run, or a new automated case is proposed.
- [ ] Other seeded bugs are recorded as known issues, not fixed.

## Report

State whether the bug is fixed, the build tested, and the cases run. For
a failed retest or a new regression, include the repro steps, expected
and actual results, and evidence such as a QA order number or screenshot.

- **Pass:** The observed result matches the expected result.
- **Fail:** The observed result differs from the expected result. State whether the original bug is still present or a new regression appeared.
- **Not Run:** The case is written and execution is pending.
- **Blocked:** A required build, environment, or test record is unavailable. State what is missing.
