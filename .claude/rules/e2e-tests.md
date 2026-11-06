---
paths:
  - "apps/web/e2e/**"
  - "apps/admin/e2e/**"
  - "apps/*/playwright.config.ts"
---

# Playwright end-to-end tests

- Select elements by role, label, or visible text (`getByRole`,
  `getByLabel`, `getByText`). Do not use CSS selectors or test IDs.
- Create each test's own data with unique values, such as
  `e2e-${Date.now()}@example.com`. Reuse the helpers in
  `apps/web/e2e/auth.ts`, such as `registerCustomerViaApi`.
- Wait with `expect(...)` assertions, not fixed timeouts.
- Web specs run in parallel and must not depend on each other. Admin
  specs run serially.
- Keep the `flake-*.spec.ts` files flaky on purpose. Do not stabilize or
  delete them unless the task asks for it.
- Both suites need the backend and Postgres on `:8081`. Run one spec with
  `npx playwright test e2e/<file>.spec.ts`.
