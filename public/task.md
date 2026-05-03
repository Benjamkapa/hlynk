# System Optimization Task Tracker

- `[x]` **Phase 1: Database Architecture**
  - `[x]` Remove `relationMode = "prisma"` to enable native foreign keys
  - `[x]` Add compound indexes to `ActivityLog` and `Sale` models
  - `[x]` Generate new Prisma migration and client
- `[ ]` **Phase 2: Performance**
  - `[x]` Implement Redis caching for M-Pesa tokens in `mpesa.ts`
  - `[x]` Implement React `lazy()` and `<Suspense>` in frontend router
- `[ ]` **Phase 3: Look & Feel**
  - `[ ]` Centralize `ADMIN_CSS` into `index.css`
  - `[ ]` Preload premium fonts in `index.html`
  - `[ ]` Remove inline style injections from Admin/Provider pages
