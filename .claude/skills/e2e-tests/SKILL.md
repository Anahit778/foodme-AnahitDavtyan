---
name: e2e-tests
description: Write manual end-to-end test cases for FoodMe. Use when a feature, change, or bug fix needs to be verified through a complete user journey, from the first action to a visible business outcome. Examples include placing an order through the storefront and processing that same order in the admin panel.
---

# Writing manual end-to-end tests

1. Read the requirements and define the user goal. Identify the starting
   point, the roles involved, and the final result that proves the journey
   succeeded. Flag unclear expectations before writing the case.

2. Give each case a name that describes the journey and its expected
   outcome. Specify the QA environment, test accounts, preconditions,
   and test data. Use separate browser profiles when the case requires
   both a customer and an admin session.

3. Write numbered steps through the normal UI. Add expected results at
   meaningful points, such as the cart subtotal, order confirmation, and
   updated order status. If the journey crosses interfaces, use the same
   order number to verify that both interfaces show the same order.

4. Cover the main successful journey and write separate cases for relevant
   interruptions. For example, verify that a missing required checkout
   field prevents submission and that the customer can correct it and
   continue with the same cart. Start each case from its own preconditions.


## Checklist before finishing

- [ ] Each case has a clear user goal, starting point, and visible final outcome.
- [ ] Roles, preconditions, test data, and numbered UI steps are documented.
- [ ] Expected results are observable at the key points in the journey.
- [ ] Cross-interface checks refer to the same order or record.
- [ ] The happy path and relevant interruptions are covered in independent cases.

## Report

Summarize the journeys covered and any gaps or defects found. For executed
cases, record the environment or build, actual result, and evidence such as
a QA order number or screenshot.

Use **Pass** or **Fail** after comparing actual and expected results.
Use **Not Run** for cases awaiting execution and **Blocked** when a
required account, environment, or test record is unavailable.