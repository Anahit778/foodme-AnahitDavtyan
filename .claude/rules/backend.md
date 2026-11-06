---
paths:
  - "apps/backend/src/main/**"
---

# Backend (Spring Boot)

- Keep the layers: controller → service → repository. Controllers stay
  thin and call services. Business rules live in services.
- Public and customer endpoints go in `controller/api` under `/api/**`.
  Admin endpoints go in `controller/admin` under `/admin/**`. Do not add
  storefront pages or SPA routes under `/admin`, because the admin SPA
  is served at `/backoffice`.
- Accept and return DTOs from `dto/`, never JPA entities. Validate
  request bodies with `@Valid` and Bean Validation annotations.
- Throw `NotFoundException` or `BadRequestException` and let
  `GlobalExceptionHandler` build the `ErrorResponseDto`. Do not build
  error responses in controllers.
- When you add an endpoint, update `security/SecurityConfig.java` so it
  has the intended access: public, `ROLE_CUSTOMER`, or admin.
- Use Lombok for boilerplate, in the same way as the existing classes.
- Do not log passwords, JWTs, or full request bodies with personal data.
  `HttpLoggingFilter` already redacts secrets for `/api` and `/admin`.
- Keep the memory footprint small. The app runs on Render's 512 MB free
  tier.
