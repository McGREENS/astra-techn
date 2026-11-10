# Astra Technologies — Auth Demo (Front End Only)

Account creation and login flows for the Astra landing page. **This is a UI/demo
build: there is no database, backend, or real authentication.** All data lives in
the browser via `localStorage`, and every action simulates ~800 ms of network
latency so loading states are realistic.

## Demo logins

| Role   | Email             | Password    | Lands on            |
| ------ | ----------------- | ----------- | ------------------- |
| Admin  | admin@astra.com   | admin1234   | `/admin`            |
| Seller | (any you create)  | (you set)   | `/dashboard`        |
| Rider  | (any you create)  | (you set)   | `/rider/pending`    |

The admin account is built into the mock helper (`DEMO_ADMIN`) and has no signup
flow. A few seeded demo riders (e.g. `jon@example.com` / `password`) appear in the
admin table on first run.

## Flows

- **Seller:** `/get-started` → `/signup/seller` → `/onboarding/seller` → `/dashboard`
- **Rider:** `/get-started` → `/signup/rider` → `/onboarding/rider` → `/rider/pending`
- **Login:** one form for all roles, redirects by role.
- **Forgot password:** `/forgot-password` shows a confirmation screen (no real reset).

The seller onboarding step generates a slug from the business name and shows a live
`astra.com/s/<slug>` preview, with collision handling (`store-name`, `store-name-2`, …).

## Navigation guards (client-side, demo only)

- Logged-out users hitting `/dashboard`, `/rider`, or `/admin` are sent to `/login`.
- Logged-in users hitting the signup/login/get-started pages are sent to their home.
- `/admin` requires the `admin` role.
- These are **not** security — they only hide pages. Real auth must happen server-side.

## Where a real backend plugs in

Everything mock-related is in **one file**: [`lib/mock-auth.ts`](./lib/mock-auth.ts).

To go real, keep the function signatures and replace the bodies with API calls:

- `signup`, `login`, `logout`, `requestPasswordReset` → your auth API (e.g. Supabase
  Auth, your own session/cookie endpoint).
- `completeSellerOnboarding`, `completeRiderOnboarding` → write profile data to your DB.
- `emailExists`, `slugExists`, `generateUniqueSlug` → server-side uniqueness checks
  (do not trust client checks for security).
- `getRiders`, `setRiderStatus` → admin endpoints with authorization on the server.
- Remove the `localStorage` storage and the simulated `delay()`.

The React layer (`components/auth/`) — `AuthProvider`, guards, the split layout,
forms with react-hook-form + zod, step indicator, password toggle — stays the same.
Only the data layer in `lib/mock-auth.ts` changes.

## Tech

- Next.js App Router + TypeScript + Tailwind v4
- react-hook-form + zod for validation
- Brand colors: navy `#0A1F44`, light blue `#7DC4FF`, tints `#E8F3FF` / `#CFE6FF`
- Fonts: Outfit (headings) + Lexend (body), loaded via `next/font/google`

## Develop

```bash
pnpm dev   # start the dev server
pnpm build # production build
```
