# Seeded bugs and demo behavior

FoodMe is a QA course project. Some defects and noisy behavior are
deliberate and must stay in place.

- Code marked with an `FM-BUG-NN` comment is a seeded bug tracked in Jira.
  Fix it only when the task names that FM-BUG number. Never fix it as a
  side effect of a refactor, lint cleanup, or another bug fix.
- When you fix a seeded bug, change only the code for that bug and keep
  its `FM-BUG-NN` reference in the commit message.
- Keep these demo behaviors unless the task is about them:
  `SimulatedLatencyConfig` (random API latency), `FlakyHeartbeatJob`,
  the frontend `flakyHeartbeat` modules that send fake errors to
  GlitchTip, and the `flake-*.spec.ts` Playwright specs.
- If a seeded bug or demo behavior causes a test failure, report it as a
  known issue with its FM-BUG number. Do not change the test to hide it.
