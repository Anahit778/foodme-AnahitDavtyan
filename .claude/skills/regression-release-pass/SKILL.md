---
name: regression-release-pass
description: >-
  Plan and run a full regression pass for a FoodMe release candidate. Use
  before a deploy to Render or at the end of a sprint, when the whole
  storefront, admin panel, and API need confirmation that existing
  behavior still works.
---

# Running a release regression pass

1. Define the release. Record the build or commit, the environment, the
   tickets included, and the test accounts. Confirm that the environment
   is healthy at `/actuator/health` before you start.

2. Run the smoke journey first. Explore chefs, open a chef, add two
   dishes, and check the cart total. At checkout, register a new customer
   or log in with a test customer, because placing an order requires a
   customer account. Check out with delivery and note the order number.
   Log in to the admin panel at `/backoffice`, find the same order, and
   change its status. If the smoke journey fails, stop and report the
   release as blocked.

3. Cover every area at least once:
   - **Storefront:** home, explore, chef page, dish modal, cart, delivery
     and takeaway checkout, payment methods, success and failed pages,
     tracking, register, login, order history, mobile view.
   - **Admin:** login and bad password, orders list and show, status
     change, chefs and dishes lists and edit, sidebar navigation.
   - **API:** Swagger at `/swagger-ui.html`, a 401 without a token, images
     at `/api/images/**`.

   Use the regression cases from the release tickets for deeper coverage
   of the changed areas.

4. Run the automated suites and report each one separately:
   `./gradlew test` in `apps/backend`, then `npm run test:e2e` in
   `apps/web` and `npm run test:e2e` in `apps/admin`, with the backend and
   Postgres on `:8081`. Do not use `npm run test:e2e:all`, because it
   skips the admin suite when any web spec fails. Rerun a failing
   `flake-*.spec.ts` spec before reporting it.
   Heartbeat errors in GlitchTip are intentional demo noise. Record
   failures from seeded `FM-BUG-NN` defects as known issues, separate
   from new regressions.


## Checklist before finishing

- [ ] The build, environment, tickets, and accounts are documented.
- [ ] The smoke journey ran first with a customer account, and the same order was checked in both interfaces.
- [ ] Every storefront, admin, and API area was covered at least once.
- [ ] The backend, web, and admin suites ran separately, and flaky failures were rerun before reporting.
- [ ] Known seeded bugs are separated from new regressions.

## Report

Give a release verdict: **Go**, **Go with known issues**, or **No go**.
Summarize the build, environment, areas covered, and commands run with
their results. List each new regression with its repro steps, expected
and actual results, and evidence, followed by the known FM-BUG issues.

- **Pass:** The observed result matches the expected result.
- **Fail:** The observed result differs from the expected result. State whether it is a new regression or a known FM-BUG.
- **Not Run:** The case is planned and execution is pending.
- **Blocked:** A required environment, account, or test record is unavailable. State what is missing.
