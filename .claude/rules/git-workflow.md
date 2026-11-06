# Git workflow

- Write commit messages as Conventional Commits:
  `type(scope): summary (TICKET)`, for example
  `fix(backend): restore gradle wrapper jar` or
  `feat(checkout): apply a promo code at checkout (KAN-27)`.
- Use the types `feat`, `fix`, `test`, `docs`, `perf`, `chore`, and
  `revert`. Use a scope such as `backend`, `web`, `admin`, `checkout`, or
  `monitoring`.
- Add the Jira key (`KAN-NN`) or seeded bug number (`FM-BUG-NN`) when the
  change belongs to a ticket.
- Work on a branch and open a pull request. Do not push directly to
  `main`.
- Do not commit build output, `node_modules`, Playwright reports,
  `.env` files, `.patch` files, or secrets. Keep credentials in Render
  environment variables.
