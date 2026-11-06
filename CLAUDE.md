# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

FoodMe is a food-ordering app used as a **QA / observability course project**. It has three apps under `apps/` that ship as **one Docker image / one origin** on Render (`render.yaml`), plus a separate monitoring stack (`infra/monitoring/`, `render-monitoring.yaml`).

**Seeded bugs:** the code deliberately contains bugs marked with `FM-BUG-NN` comments (e.g. `OrderService.java`, `ChefService.java`, `CreateOrderDishDto.java`, `OrderDto.java`, `apps/web/src/hooks/useCart.ts`, `apps/admin/src/pages/orders/OrderShow.jsx`). They are tracked in Jira as reproduce/fix exercises. Do not "fix" them incidentally while doing other work — only when the task is about that bug. Some e2e tests reference them (e.g. `apps/web/e2e/layout.spec.ts` mentions FM-BUG-02). Other demo-only behaviors are intentional too: random API latency (`SimulatedLatencyConfig`), a backend `FlakyHeartbeatJob`, frontend `flakyHeartbeat` modules that send fake errors to GlitchTip, and `flake-*.spec.ts` e2e tests.

## Commands

### Backend (`apps/backend`, Spring Boot 3.3, Java 17, Gradle)
```bash
./gradlew bootRun                     # needs Postgres on localhost:5432, db/user/pass = foodme (see application.properties)
./gradlew test                        # H2 in-memory, profile "test"
./gradlew test --tests OrderControllerTest
./gradlew test --tests 'OrderControllerTest.someMethod'
./gradlew bootJar
```
Swagger UI at `/swagger-ui.html`, OpenAPI at `/v3/api-docs`, metrics at `/actuator/prometheus`.

### Storefront (`apps/web`, React 19 + TS + Vite + Tailwind v4)
```bash
npm run dev          # Vite; talks to backend at http://localhost:8081 in dev
npm run build        # tsc -b && vite build
npm run lint         # oxlint
npm run test:e2e     # Playwright; auto-starts vite on :5180 (PLAYWRIGHT_BASE_URL overrides)
npx playwright test e2e/happy-path.spec.ts
npm run test:e2e:all # web + admin e2e
```

### Admin back office (`apps/admin`, React 18 + react-admin + MUI, plain JS/JSX)
```bash
npm run dev          # served at / in dev, /backoffice/ in production build
npm run lint         # eslint
npm run test:e2e     # Playwright; auto-starts vite on :5174 (ADMIN_BASE_URL overrides), serial
```
E2E tests for both frontends hit the real backend API, so the backend (with Postgres) must be running on :8081.

### Full image
`docker build -f apps/backend/Dockerfile .` — build context **must be the repo root**.

## Architecture

### One origin, three apps
`apps/backend/Dockerfile` builds web and admin with Vite, copies `web/dist` into `src/main/resources/static/` and `admin/dist` into `static/backoffice/`, then builds the Spring Boot jar. `config/SpaWebConfig.java` serves:
- storefront at `/`, admin SPA at `/backoffice` (with index.html fallback for client-side routes)
- never an SPA shell for `api/`, `admin/`, `actuator/`, `swagger-ui`, `v3/` paths

The admin SPA lives at `/backoffice` because **`/admin/**` is the admin REST API**. Both frontends' API clients (`apps/web/src/api/client.ts`, `apps/admin/src/api/base-api.js`) default to a relative base in production and `http://localhost:8081` in dev; `VITE_API_BASE_URL` overrides. Vite env vars (incl. `VITE_SENTRY_DSN`) are baked in at **build time**.

### Backend layout (`am.foodme.backend`)
- `controller/api/*` — public/customer API under `/api/**`; `controller/admin/*` — admin API under `/admin/**`.
- `security/SecurityConfig.java` — stateless JWT (`JwtService`, `JwtAuthenticationFilter`, auth0 java-jwt). Two roles: customers (`/api/customer/**` and `POST /api/order` require `ROLE_CUSTOMER`) and admins (`/admin/**` authenticated, except `/admin/auth/login` and `GET /admin/dish/**`). Everything else under `/api/**` is public. CORS from `foodme.cors.allowed-origins` (`*` default).
- Layered controller → service → repository (Spring Data JPA) with DTOs in `dto/`; errors via `exceptionHandler/GlobalExceptionHandler`. Lombok is used.
- **Schema is owned by Flyway** (`src/main/resources/db/migration/V*.sql`, schema `foodme`); Hibernate runs with `ddl-auto=validate`, so entity changes need a new migration. Multilingual fields are stored as `*_en/_am/_ru` columns.
- **Images are stored in Postgres** (`foodme.image`), served at `/api/images/**`; `ImageSeedRunner` loads `resources/img-seed/` on first start. `ImageUrlResponseAdvice` rewrites image URLs in responses.
- `DatabaseUrlEnvironmentPostProcessor` converts a Render/Neon-style `DATABASE_URL` (`postgresql://...`) into JDBC settings; otherwise `SPRING_DATASOURCE_URL` or `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD`.
- Observability: Micrometer Prometheus, JSON logs (logstash encoder), optional Loki push when `LOKI_PUSH_URL` is set (`logback-spring.xml`), Sentry/GlitchTip via `SENTRY_DSN`, `observability/HttpLoggingFilter` logs `/api` and `/admin` requests with secrets redacted.

### Tests
Backend tests are `@SpringBootTest` + MockMvc with `@ActiveProfiles("test")`: H2 in PostgreSQL mode, Flyway **disabled**, schema from Hibernate `create-drop`, data from `src/test/resources/data.sql`, latency and flaky jobs disabled. A migration change is therefore not exercised by tests — keep `data.sql` in sync with entity changes.

### Storefront specifics
- Routes in `src/router.tsx`; data fetching with TanStack Query over `src/api/foodme.ts`.
- Cart is persisted client-side in IndexedDB via Dexie (`src/lib/db.ts`, `src/hooks/useCart.ts`).
- Forms use react-hook-form + zod (`src/schemas/`); i18n via i18next (`src/locales/`); shadcn-style UI primitives in `src/components/ui`; `@/` aliases `src/`.

### Admin specifics
react-admin with a custom `providers/dataProvider.js` and `providers/authProvider.js` over the axios clients in `src/api/`. JWT kept in `localStorage.token`; a 401 clears it and redirects to login.

### Deployment / monitoring
- `render.yaml`: one Docker web service + free Postgres; `healthCheckPath: /actuator/health`. JVM flags in the Dockerfile are tuned for Render's 512 MB / 0.1 CPU free tier.
- `infra/monitoring/stack`: Prometheus + Loki + Grafana + Grafana MCP in a single Render service behind nginx (`/`, `/prom/`, `/loki/`, `/mcp`). Wired via `BACKEND_HOST` (monitoring) and `LOKI_PUSH_URL` (app). See `infra/monitoring/README.md`.
- Note: the root `.env.example` refers to `infra/docker-compose.yml`, Jenkins, and `docs/deployment.md`, which do not exist in this repo.


@AGENTS.md