# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

FoodMe is a food-ordering demo app used for a QA / DevOps course. Three apps live under `apps/`, and they ship as **one Docker image on one origin**:

- `apps/backend` — Spring Boot 3.3 (Java 17, Gradle, Postgres, Flyway). Port 8081 locally (`PORT` env var overrides it on Render).
- `apps/web` — customer storefront: React 19, TypeScript, Vite, Tailwind 4, shadcn-style UI in `src/components/ui`, TanStack Query, Dexie (IndexedDB cart), i18next, zod and react-hook-form.
- `apps/admin` — back office: react-admin 5, MUI, axios, React 18, plain JS/JSX.
- `infra/monitoring` — a separate Render service that bundles Prometheus, Loki, Grafana and Grafana MCP behind nginx (see `infra/monitoring/README.md`).

Bug fixes are tracked by Jira keys (`KAN-n`) and seeded-bug IDs (`FM-BUG-nn`). Commit messages and test comments reference both, for example `fix(web): ... (KAN-4, FM-BUG-07)`. The `*.patch` file at the repo root is a seeded-bug exercise artifact, not source code.

## Commands

Backend (run from `apps/backend`; use `gradlew.bat` on Windows):
```
./gradlew bootRun                                   # needs Postgres on localhost:5432, db/user/pass = foodme
./gradlew test                                      # H2 in-memory, profile "test"
./gradlew test --tests ChefControllerTest           # one class
./gradlew test --tests 'ChefControllerTest.getActiveChefs_returnsEveryCountedChef'
./gradlew bootJar
```

Web (run from `apps/web`):
```
npm run dev            # Vite; calls the backend at http://localhost:8081 in dev
npm run build          # tsc -b && vite build
npm run lint           # oxlint
npm run test:e2e       # Playwright; starts dev server on :5180 (PLAYWRIGHT_BASE_URL overrides)
npx playwright test e2e/happy-path.spec.ts -g "cart total"
npm run test:e2e:all   # web, then admin e2e
```

Admin (run from `apps/admin`):
```
npm run dev | build | lint (eslint) | test:e2e   # Playwright dev server on :5174 (ADMIN_BASE_URL overrides)
```

Both Playwright suites need a running backend with seeded data. The e2e specs call the API directly via `VITE_API_BASE_URL`, which defaults to `http://localhost:8081`.

Full image (build context is the repo root): `docker build -f apps/backend/Dockerfile .`

`.env.example` mentions `infra/docker-compose.yml`, Jenkins and GlitchTip profiles. None of these exist in the repo now, so don't rely on them.

## Architecture

**Single-origin deploy.** `apps/backend/Dockerfile` builds both SPAs and copies them into `src/main/resources/static/` (storefront at `/`, admin at `/backoffice/`). `config/SpaWebConfig.java` serves them: a path with a file extension is a static asset, and any other path falls back to the matching `index.html`. Paths starting with `api/`, `admin/`, `actuator/`, `swagger-ui` and `v3/` never fall back. The admin app's Vite `base` is `/backoffice/` only in production mode. Both frontends default the API base URL to `""` (relative) in production and to `http://localhost:8081` in dev. `VITE_API_BASE_URL` overrides that default.

**Two API surfaces** (see `security/SecurityConfig.java`). Authentication is stateless JWT (`JwtService` with auth0 java-jwt, plus `JwtAuthenticationFilter`):
- `/api/**` (`controller/api`): the public storefront API. `/api/auth/**` handles customer login and register. `/api/customer/**` and `POST /api/order` require `ROLE_CUSTOMER`.
- `/admin/**` (`controller/admin`): the admin REST API, which requires authentication. Exceptions: `/admin/auth/login`, and `GET /admin/dish/**` is public. The admin UI is mounted at `/backoffice` so it doesn't collide with this API.
- Admin `dataProvider.js` maps react-admin's plural resources (`orders`, `chefs`, `dishes`) to singular backend paths (`/order`, ...). It also converts the backend's `{ list, count }` response shape to `{ data, total }`.

**Layering:** controller → service → Spring Data repository → JPA model, with request/response DTOs in `dto/`. `DishSearchRepositoryImpl` is a custom query implementation. `exceptionHandler/GlobalExceptionHandler` maps `BadRequestException` and `NotFoundException` to `ErrorResponseDto`.

**Database.** All tables live in the Postgres schema `foodme`. The schema is owned by Flyway (`db/migration/V*.sql`), and Hibernate runs with `ddl-auto=validate`, so every entity change needs a new migration. Images are stored in the DB table `foodme.image` and served from `/api/images/**`. On first start, `ImageSeedRunner` loads them from `resources/img-seed/`. `DatabaseUrlEnvironmentPostProcessor` (registered in `META-INF/spring.factories`) turns a `postgresql://` value in `DATABASE_URL` into a JDBC URL.

**Tests.** Backend tests are `@SpringBootTest` + MockMvc with `@ActiveProfiles("test")` (`application-test.properties`). They use H2 in PostgreSQL mode with `create-drop`, Flyway is disabled, and the data comes from `src/test/resources/data.sql`. Assertions depend on that fixture data (for example, the exact count of active chefs), so update `data.sql` when a test needs new data.

**Storefront state.** The cart lives in IndexedDB through Dexie (`lib/db.ts`, `hooks/useCart.ts`) and is keyed by `uid`. Customer auth is stored by `lib/auth-storage.ts`. `api/client.ts` clears it when an `/api/customer` call returns 401. Routes are defined in `src/router.tsx`. The `@/` import alias points to `src/`.

## Deliberate demo behaviors (not bugs)

- `SimulatedLatencyConfig` adds a random 200–1500 ms delay to `/api/**` and `/admin/**`, except `/api/images/**`. The test profile sets the delay to 0.
- `observability/FlakyHeartbeatJob` (backend, disabled in the `test` profile) and `lib/flakyHeartbeat.*` (web and admin) deliberately report occasional fake errors to GlitchTip/Sentry.
- `HttpLoggingFilter` logs request and response bodies for `/api` and `/admin`. Toggle it with `HTTP_LOGGING_ENABLED`.
- Observability: Actuator exposes `/actuator/prometheus`, logs are JSON (`logback-spring.xml`), the Loki appender is active only when `LOKI_PUSH_URL` is set, and Sentry is active only when `SENTRY_DSN` is set. The frontend DSNs are baked in at build time (`VITE_SENTRY_DSN`).

## Deployment

Render Blueprint `render.yaml` deploys the app and Postgres. `render-monitoring.yaml` deploys the monitoring stack. The free tier has 512 MB of RAM, so the JVM flags in the Dockerfile and `server.tomcat.threads.max=32` are intentional. Pushing to the tracked branch auto-deploys. The root `README.md` is a non-technical, student-facing deploy guide.
