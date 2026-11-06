---
name: integration-tests
description: >-
  Write manual integration test cases for FoodMe. Use when a feature,
  change, or bug fix affects how two parts of the system exchange data
  or share state. Apply this skill to storefront-to-API requests,
  backend persistence, and order data shared between the customer
  and admin interfaces.
---

# Writing manual integration tests

1. Read the requirements and identify the integration to check. Name the
   components involved, the action that starts the exchange, and the data
   expected to cross the boundary. Check the API contract in Swagger or in
   the relevant controller and DTO. Flag unclear expectations before
   writing the cases.

2. Give each case a name that describes the interaction and expected result.
   Specify the environment, user role, preconditions, exact test data,
   and numbered steps. Use DevTools to inspect a request sent by the UI.

3. For a successful exchange, check the request data, response status,
   and relevant response fields. When the action changes state, verify
   the result with a separate read. Use the same record ID or order number
   to confirm that both checks refer to the same record.

4. Cover failure scenarios relevant to the integration, such as an invalid
   payload, missing authentication, insufficient permissions, or a missing
   record. Verify the expected error and, for rejected writes, check that
   no unintended record or state change was created.


## Checklist before finishing

- [ ] Each case identifies the components and the interaction being checked.
- [ ] The role, test data, request, and expected response are documented.
- [ ] Successful exchanges and relevant rejection paths are covered.
- [ ] State changes are verified with a follow-up read where applicable.
- [ ] The cases can be executed independently with their own test data.
- [ ] Unclear expectations and unavailable checks are documented.

## Report

Summarize the integrations covered, the build or environment tested,
and any gaps or defects found. For executed cases, record the actual
result and relevant evidence, such as a redacted request and response.

Use **Pass** or **Fail** after comparing the actual and expected results.
Use **Not Run** for cases awaiting execution and **Blocked** when a
required environment, account, or test record is unavailable.