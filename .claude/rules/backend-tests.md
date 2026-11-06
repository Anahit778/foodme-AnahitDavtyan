---
paths:
  - "apps/backend/src/test/**"
---

# Backend tests

- Write controller tests with `@SpringBootTest`, `@AutoConfigureMockMvc`,
  and `@ActiveProfiles("test")`, and call the API through `MockMvc`, as in
  `OrderControllerTest`.
- Create each test's own data, such as a customer with a unique email.
  Do not depend on data that another test creates.
- Check the status code and the relevant JSON fields with `jsonPath`.
  For a write, read the record back to confirm the change.
- Cover the rejection paths: invalid payload, missing token, wrong role,
  and missing record.
- Run a single class with `./gradlew test --tests <ClassName>`, and run
  the whole suite before you finish.
