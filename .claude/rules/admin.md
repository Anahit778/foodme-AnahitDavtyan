---
paths:
  - "apps/admin/src/**"
---

# Admin back office (react-admin)

- The admin app is plain JavaScript and JSX. Do not add TypeScript files.
- Load and save data through `providers/dataProvider.js` and the axios
  clients in `src/api`. Do not call `fetch` directly from pages.
- Keep authentication in `providers/authProvider.js`. The JWT stays in
  `localStorage.token`, and a 401 clears it and redirects to login.
- Add pages for a resource under `src/pages/<resource>` and register the
  resource in `App.jsx`.
- Use MUI and react-admin components, in the same way as the existing
  pages.
- The production build is served at `/backoffice/`. Keep links and
  assets relative so they work under that base path.
- Run `npm run lint` and `npm run build` before you finish.
