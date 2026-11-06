---
name: regression-tests
description: >-
  Run the FoodMe automated regression suites and report the results. Use
  when asked to run the tests, run regression, or confirm that a change,
  fix, or release candidate did not break existing behavior. Covers the
  backend JUnit suite and the storefront and admin Playwright suites.
---

# Running the automated regression suites

1. Check the toolchain before running anything.
   - **JDK 17.** The Gradle toolchain requires Java 17 and does not
     auto-download it. Run `java -version`. If it is not 17 or newer, find
     an installed JDK 17 and set `JAVA_HOME` and `PATH` for the command.
     If none is installed, download a portable Temurin 17 zip into the
     scratchpad from
     `https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse`
     and point `JAVA_HOME` at it. Do not change system-wide settings.
   - **Node deps.** If `apps/web/node_modules` or `apps/admin/node_modules`
     is missing, run `npm ci` in that app and then
     `npx playwright install chromium` once. The repo lives on OneDrive,
     so installs and the first Gradle run are slow. Run them in the
     background.

2. Run the backend suite. It uses H2 and needs no Postgres or server:
   ```bash
   cd apps/backend && ./gradlew test --console=plain
   ```
   Read the counts from `build/test-results/test/*.xml`
   (`tests`, `failures`, `errors`, `skipped`). The
   `HHH000478: Unsuccessful: drop schema foodme` error at shutdown is
   harmless H2 noise, not a failure.

3. Start the stack for the e2e suites. Both Playwright suites call the
   real API on `:8081`, which needs Postgres on `:5432`.
   - Check what is already listening:
     `netstat -an | grep -E ':(5432|8081) ' | grep LISTEN`. Reuse a running
     Postgres or backend. Do not stop processes you did not start.
   - Postgres, if missing and Docker is running:
     `docker run -d --name foodme-pg -p 5432:5432 -e POSTGRES_DB=foodme -e POSTGRES_USER=foodme -e POSTGRES_PASSWORD=foodme postgres:16`.
     If `docker info` fails, Docker Desktop is not running. Ask the user to
     start it, and mark both e2e suites **Blocked** until it is up.
   - Backend: `./gradlew bootRun` in `apps/backend`, in the background.
     Flyway creates the schema and seed data. Wait until
     `curl -s localhost:8081/actuator/health` returns `"UP"`.
   - Playwright starts Vite itself (web on `:5180`, admin on `:5174`).

4. Run the e2e suites one at a time and report each separately:
   ```bash
   cd apps/web   && npx playwright test --reporter=list
   cd apps/admin && npx playwright test --reporter=list
   ```
   Do not use `npm run test:e2e:all`. It skips the admin suite when any
   web spec fails. The admin suite runs serially and logs in as
   `admin` / `admin123`. For a targeted rerun, pass a spec path, such as
   `npx playwright test e2e/happy-path.spec.ts`.

5. Triage every failure before reporting it.
   - **Flaky by design:** `flake-*.spec.ts`. Rerun the failing spec up to
     two times. Report it as flaky only if it passes on a rerun.
   - **Known seeded bug:** the failure matches an `FM-BUG-NN` comment in
     the spec or in the code under test (for example FM-BUG-02 in
     `layout.spec.ts`). Report it as a known issue. Do not fix seeded bugs
     unless the task is about that bug.
   - **Environment:** connection refused, a port in use, or a timeout
     while starting Vite or the backend. Fix the setup and rerun. Do not
     count it as a regression.
   - **Regression:** everything else. Open the failing step in the
     Playwright output or `playwright-report/`, and find the cause in the
     code before reporting it.
   Random API latency (`SimulatedLatencyConfig`) and heartbeat errors in
   GlitchTip are intentional demo noise.

6. Clean up what you started: stop the `bootRun` and any Postgres
   container you created. Leave the test reports in place.


## Checklist before finishing

- [ ] JDK 17 was used for Gradle, without system-wide changes.
- [ ] The backend suite ran, and its counts were read from the XML results.
- [ ] Postgres and the backend were healthy before the e2e suites started, or the suites are marked Blocked with the reason.
- [ ] The web and admin suites ran separately.
- [ ] Each failure is classified as flaky, known FM-BUG, environment, or regression.
- [ ] Processes and containers started for the run were stopped.

## Report

Give a summary table with one row per suite: suite, command, passed,
failed, flaky, skipped, and status. Below it, list each regression with
the spec and test name, the error, and the suspected cause. Then list the
known FM-BUG failures and the flaky specs separately.

- **Pass:** Every test in the suite passed, possibly after a flake rerun.
- **Fail:** At least one test failed with a regression or a known FM-BUG.
- **Not Run:** The suite was not part of this run.
- **Blocked:** A prerequisite is missing, such as JDK 17, Docker, Postgres, or a healthy backend. State what is missing.
