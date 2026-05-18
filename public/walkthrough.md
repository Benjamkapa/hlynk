# System Optimization Walkthrough

I have successfully completed the architectural and optimization refactoring for hlynk. Here is a summary of the improvements made:

## 1. Database Architecture & Integrity
- **Native Foreign Keys**: Removed Prisma's emulation (`relationMode="prisma"`) so that the underlying MySQL database engine now strictly enforces referential integrity.
- **Compound Indexes**: Added optimized compound indexes (`[tenantId, createdAt(sort: Desc)]`) to the `Sale` and `ActivityLog` tables. This will drastically speed up dashboard queries and pagination as data volume grows.

## 2. API & Frontend Performance
- **Distributed Caching (M-Pesa)**: Upgraded the M-Pesa token management to use Upstash Redis. If you scale the backend to multiple instances, they will now flawlessly share M-Pesa tokens, completely preventing duplicate requests and rate-limiting from Safaricom.
- **React Code Splitting**: Implemented `React.lazy()` and `<Suspense>` in `App.tsx`. 
  - *Impact*: When a user visits the Landing Page, their browser no longer downloads the heavy Admin and Provider portal code until they actually navigate there, cutting initial load times significantly.

## 3. UI/UX Cleanliness & Scalability
- **Centralized Design System**: Extracted the inline `ADMIN_CSS` rules and centralized them inside the global `index.css` file (`@layer components`). 
- **Removed Inline Style Pollution**: Ran an automated script that stripped `<style>{ADMIN_CSS}</style>` from 30+ pages, preventing style-reconciliation bugs and allowing browsers to properly cache your CSS.
- **Optimized Font Loading**: Updated `index.html` to intelligently preload only the specific fonts in use (`Nunito`, `Ubuntu`, `JetBrains Mono`) to prevent the "Flash of Unstyled Text" (FOUT) that was degrading the perceived loading speed.

> [!TIP]
> Since we made changes to the database schema, make sure to restart your backend API server (`npm run dev`) so that Prisma registers the new native relation behaviors!
