---
paths:
  - "apps/web/src/**"
---

# Storefront (React + TypeScript)

- Use TypeScript types, not `any`. Put shared API types in `src/types`.
- Call the backend only through `src/api/foodme.ts` and fetch data with
  TanStack Query. Do not hardcode an API host. The client uses a relative
  base in production and `VITE_API_BASE_URL` to override it.
- Build forms with react-hook-form and a zod schema in `src/schemas`.
- Put user-facing text in `src/locales/en/translation.json` and read it
  with i18next. The UI is English only.
- Reuse the primitives in `src/components/ui` and style with Tailwind.
  Import from `src` with the `@/` alias.
- Keep cart state in the Dexie store through `useCart`. Do not add a
  second cart store.
- Keep elements reachable by role and label (buttons, tabs, forms with
  accessible names). The Playwright specs select elements that way.
- Run `npm run lint` and `npm run build` before you finish.
