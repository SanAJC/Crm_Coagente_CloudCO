# Mesa CRM — Next.js

Next.js (App Router) port of the original TanStack Start / Vite React app. Same UI,
same demo data, same client-side "CRM" state (kept in `localStorage`) — rebuilt on
Next.js conventions.

## Stack

- **Next.js 16** (App Router, React 19)
- **Tailwind CSS v4**
- **shadcn/ui** (Radix primitives) — components under `components/ui`
- **TanStack Query** for the client cache provider
- **ESLint (flat config) + Prettier**

## Structure

```
app/
  layout.tsx            root layout: fonts, metadata, <Providers>
  providers.tsx          "use client" — QueryClientProvider + CrmProvider + Toaster
  page.tsx                redirects "/" -> "/dashboard"
  not-found.tsx           404 page
  error.tsx               root error boundary
  login/
    page.tsx               metadata + renders LoginView
    login-view.tsx          "use client" login form
  (app)/
    layout.tsx              "use client" auth guard (redirects to /login when signed out)
    dashboard/…
    conversaciones/…
    pedidos/…
    tickets/…
    productos/…
    reservas/…
components/
  app-shell.tsx           shared shell: sidebar nav + header
  reservations-calendar.tsx
  ui/                     shadcn/ui primitives
lib/
  crm-store.tsx           "use client" React context: demo auth + CRUD state
  crm-data.ts             demo products/reservations/orders/support tickets + formatters
  chat-data.ts            demo conversations for the "Conversaciones" screen
  utils.ts                cn() helper
hooks/
  use-mobile.tsx
```

Each route follows the same pattern: `page.tsx` is a Server Component that only
exports `metadata` and renders a co-located `*-view.tsx` Client Component, which is
where the interactive UI (state, event handlers) lives. This keeps metadata
statically analyzable while everything stateful stays a client boundary.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. Any email/password on `/login` signs you in (no
backend — the session is written to `localStorage`).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint
- `npm run format` — Prettier write

## Notes on the migration

- TanStack Router's file-based routes (`src/routes/**`) became Next's App Router
  (`app/**`), including the `_authenticated` layout → `app/(app)/layout.tsx`
  route group.
- `@tanstack/react-router`'s `Link`/`useNavigate`/`useRouterState` were replaced
  with `next/link` and `next/navigation`'s `useRouter`/`usePathname`.
- Per-route `head()` metadata became each route's exported `metadata` object.
- The TanStack Start server entry (`src/server.ts`, `src/start.ts`), the Nitro/h3
  error-wrapping helpers, and the Lovable-editor-only error telemetry hook were
  dropped — Next.js has its own server runtime and its own `error.tsx` /
  `not-found.tsx` conventions, shown above.
- Tailwind v4 config is unchanged (same design tokens in `app/globals.css`), just
  pointed at the Next.js Google Fonts loader (`next/font/google`) instead of a
  `<link>` tag for Outfit.
