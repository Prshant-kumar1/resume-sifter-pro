## Goal

Turn ResumeSift into a real product entry experience: a public **landing page** at `/`, a **login/signup flow** powered by Supabase, the existing recruiter app moved behind authentication at `/app`, a **glassmorphism** visual treatment across the whole app, and a working **light/dark mode** toggle.

---

## 1. Enable Lovable Cloud (Supabase)

Lovable Cloud is not yet enabled in this project (`src/integrations/` is empty). Enabling it provisions Supabase and generates the typed client at `src/integrations/supabase/`.

Auth methods:
- **Email + password** (default)
- **Google sign-in** (default for Lovable Cloud)

No `profiles` table is needed — we only need `auth.users` for now (display name lives in `user_metadata`). A separate `user_roles` table can be added later if role-based access is needed.

---

## 2. Routing restructure

New route layout:

```text
/                  → public Landing page (hero, features, CTA)
/login             → Login + Signup tabs (public)
/auth/callback     → OAuth return handler (public)
/app               → Authenticated layout (sidebar + topbar)
/app/              → Dashboard (was /)
/app/single        → Single Screening
/app/batch         → Batch Screening
/app/jobs          → Job Repository
/app/settings      → Settings
```

Implementation:
- Move existing `index.tsx`, `single.tsx`, `batch.tsx`, `jobs.tsx`, `settings.tsx` into `src/routes/app/` (e.g. `app.index.tsx`, `app.single.tsx`, …).
- New `src/routes/app.tsx` becomes the **`_authenticated` layout**: runs `beforeLoad` that checks the Supabase session and `redirect`s to `/login?redirect=…` if missing. Renders the existing `AppLayout` with `<Outlet />`.
- New `src/routes/index.tsx` = Landing page.
- New `src/routes/login.tsx` = auth page.
- New `src/routes/auth.callback.tsx` = handles the OAuth redirect, then sends user to `/app`.
- Update all `<Link to="/single">` etc. to `/app/single`.

---

## 3. Landing page (`/`)

A modern recruiter-focused marketing page, all using the glass aesthetic:

- **Top nav** (glass bar): Logo, links (Features, How it works, Pricing-stub), theme toggle, "Log in" + "Get started" buttons.
- **Hero**: Big headline "Screen 100s of resumes in seconds.", subcopy, CTA buttons (Start free → `/login`, See demo → scrolls), floating glass mock of a result card with score gauge.
- **Trust strip**: small logos/placeholders.
- **Features grid** (3–6 glass cards): AI scoring, batch screening, job repository, privacy/anonymization, CSV export, dashboard insights.
- **How it works**: 3 steps with icons (Paste JD → Upload resumes → Get ranked candidates).
- **Final CTA** + **footer** (glass).

Background uses soft teal/purple radial gradients and subtle grid so glass surfaces have something to refract.

---

## 4. Auth pages

`/login`:
- Centered glass card with **Login / Sign up** tabs.
- Fields: email, password (sign-up adds full name).
- "Continue with Google" button.
- Inline validation + error messages.
- On success: redirect to `?redirect` param or `/app`.
- Bottom links: "Forgot password?" → triggers `resetPasswordForEmail` with `redirectTo: window.location.origin + '/reset-password'`.

`/reset-password` (required for password reset to work properly):
- Public route, reads recovery token from URL, calls `supabase.auth.updateUser({ password })`.

`/auth/callback`:
- Lets Supabase finish the OAuth exchange, then `navigate({ to: '/app' })`.

Auth wiring:
- Create `src/lib/auth.tsx` with a small `AuthProvider` using `supabase.auth.onAuthStateChange` (set listener BEFORE `getSession()` per best practice) and a `useAuth()` hook exposing `user`, `session`, `loading`, `signIn`, `signUp`, `signInWithGoogle`, `signOut`.
- Wrap the app in `__root.tsx` with `AuthProvider`.
- The `/app` layout's `beforeLoad` checks session via the Supabase client; component-level fallback also redirects while session resolves.
- Sidebar profile block shows real user email/name and a **Sign out** button.

---

## 5. Glassmorphism visual system

Add reusable utilities in `src/styles.css`:

- `.glass` — `background: color-mix(in oklab, var(--surface) 55%, transparent); backdrop-filter: blur(18px) saturate(140%); border: 1px solid color-mix(in oklab, var(--foreground) 12%, transparent); box-shadow: 0 8px 32px -12px rgba(0,0,0,0.4);`
- `.glass-strong` (more opaque, for inputs/cards needing readability).
- `.glass-nav` (thinner blur, used for top bars).
- Background layer with soft teal + indigo radial gradients + subtle noise/grid overlay so blur has visual content to work with.

Apply across: landing nav/cards, login card, sidebar, topbar, dashboard stat cards, modals, and tables headers. Keep contrast accessible (text on glass uses `--foreground`, never sub-50% opacity).

---

## 6. Light & dark mode

- Define a full **light** palette in `:root` and keep dark variables under `.dark` (currently both are dark — needs to be split).
  - Light: `--background: oklch(0.985 0.005 240)`, `--surface: oklch(1 0 0)`, `--foreground: oklch(0.2 0.02 257)`, teal primary unchanged, glass tints adjusted (white-based instead of slate-based), softer borders.
- Add `src/lib/theme.tsx`: `ThemeProvider` storing `'light' | 'dark' | 'system'` in `localStorage` (`resumesift-theme`) and toggling the `.dark` class on `<html>`. SSR-safe (apply class via inline `<script>` in `__root.tsx` head before hydration to avoid flash).
- Add `ThemeToggle` button (sun/moon/system) used in landing nav, login page, and the app topbar.
- Update `__root.tsx` to no longer hardcode `className="dark"` on `<html>` — let the theme provider control it (default to system, falling back to dark).

---

## 7. State & store updates

- `useAppStore` already persists `displayName`, `email`, `role` — keep, but hydrate from Supabase user on login (best-effort, non-blocking).
- Add `theme` handled by `ThemeProvider` (separate from app store to allow pre-hydration script).

---

## Technical notes

- Packages: no new packages needed — `@supabase/supabase-js` will be installed by Lovable Cloud setup. Theme + auth use plain React context.
- Files created:
  - `src/routes/index.tsx` (rewritten as landing)
  - `src/routes/login.tsx`
  - `src/routes/reset-password.tsx`
  - `src/routes/auth.callback.tsx`
  - `src/routes/app.tsx` (authenticated layout)
  - `src/routes/app.index.tsx`, `app.single.tsx`, `app.batch.tsx`, `app.jobs.tsx`, `app.settings.tsx` (moved from current routes)
  - `src/lib/auth.tsx`, `src/lib/theme.tsx`
  - `src/components/ThemeToggle.tsx`, `src/components/GlassCard.tsx`, `src/components/landing/*` (Hero, Features, HowItWorks, Footer, LandingNav)
- Files edited:
  - `src/routes/__root.tsx` — wrap with `ThemeProvider` + `AuthProvider`, remove hardcoded `dark` class, add no-flash theme script.
  - `src/components/AppLayout.tsx` — update nav targets to `/app/*`, swap profile block to real user + sign-out, glass styling.
  - `src/styles.css` — split light/dark variables, add glass utilities and gradient background layer.
  - Delete the old top-level dashboard route files after copying their contents into `src/routes/app.*.tsx`.
- Auto-generated `src/routeTree.gen.ts` will refresh on save — not edited by hand.

---

## Out of scope (can do later)

- `profiles` table and editable account page (current Settings keeps local-only profile until requested).
- Role-based access (`user_roles` table) — not needed for a single-recruiter login.
- Email templates customization in Supabase dashboard.
- Real password-strength meter / 2FA.
