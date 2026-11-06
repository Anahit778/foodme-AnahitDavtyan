---
name: regression-impact-analysis
description: >-
  Select the regression cases to rerun after a FoodMe change. Use when a
  feature, refactor, migration, or dependency update is ready and QA
  needs to decide which existing behavior could break and which cases
  and automated tests to run.
---

# Selecting regression cases from a change

1. Read the change. Use the diff, the Jira ticket, or the pull request to
   list the changed files and the behavior they affect. Flag unclear
   scope before selecting cases.

2. Follow the change to every place that uses it. Use this map as a
   starting point:

   | Changed area | Also check |
   |---|---|
   | Order, dish, or chef entity, DTO, or service | Checkout, tracking, admin order show, `/api` and `/admin` responses |
   | Flyway migration | A new order saved to Postgres, admin lists, `src/test/resources/data.sql` |
   | Cart (`useCart`, Dexie) | Add, quantity, remove, reload, switching chef, checkout total |
   | Checkout form or zod schema | Delivery and takeaway fields, payment methods, required-field errors |
   | Security or JWT | Customer login, register, order history, admin login, 401 redirect |
   | Admin resources | Orders, chefs, and dishes lists, edit pages, status change |
   | Layout or UI text | Home, explore, chef page, mobile view |
   | Images or `ImageUrlResponseAdvice` | Dish and chef images in the storefront and admin panel |
   | `SpaWebConfig` or the Dockerfile | Reload on a storefront route and a `/backoffice` route; `/api`, `/admin`, `/actuator`, and `/swagger-ui` still return API responses, not an app page |

   Mark each area as **directly changed**, **dependent**, or
   **unaffected**, and give a short reason.

3. Select cases for the directly changed and dependent areas. Reuse
   existing manual cases and the Playwright specs in `apps/web/e2e/` and
   `apps/admin/e2e/` first. Write a new case only for a gap, using the
   `unit-tests`, `integration-tests`, or `e2e-tests` skill for the format.

4. Order the selection by risk. Put the directly changed areas and money
   or order data first, and cosmetic areas last. Note the automated suites
   to run: `./gradlew test` runs alone on H2, while both Playwright suites
   need the backend and Postgres on `:8081`. Backend tests do not run
   Flyway, so check a migration manually against Postgres.


## Checklist before finishing

- [ ] The changed files and affected behavior are listed.
- [ ] Each impacted area is marked directly changed, dependent, or unaffected, with a reason.
- [ ] Existing cases and Playwright specs are reused before new cases are written.
- [ ] The selection is ordered by risk.
- [ ] The automated suites to run and any manual migration checks are named.

## Report

Present the impact map and the selected cases in a table with the case
name, area, priority, source (existing case, Playwright spec, or new),
and status. List the areas left out and why.

- **Pass:** The observed result matches the expected result.
- **Fail:** The observed result differs from the expected result.
- **Not Run:** The case is selected and execution is pending.
- **Blocked:** A required environment, account, or test record is unavailable. State what is missing.
