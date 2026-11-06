---
paths:
  - "apps/backend/src/main/resources/db/migration/**"
  - "apps/backend/src/main/java/am/foodme/backend/model/**"
  - "apps/backend/src/test/resources/data.sql"
---

# Database schema and migrations

- Flyway owns the schema, and Hibernate runs with `ddl-auto=validate`.
  Every entity change needs a new migration.
- Add a new file named `V<next number>__<description>.sql` in
  `db/migration`, in schema `foodme`. Never edit a migration that has
  already been applied. Add a new one instead.
- Store multilingual text as three columns: `*_en`, `*_am`, and `*_ru`.
- Backend tests run on H2 with Flyway disabled and the schema built by
  Hibernate. After an entity change, update
  `src/test/resources/data.sql` so the tests still load.
- Tests do not run the migration. Verify each new migration against
  Postgres with `./gradlew bootRun` before you report it as done.
