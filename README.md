# Clubhouse Office — CamSur Uptown Golf Admin

This is where you see every tee time reserved through `/golf/book`, every
Villa Del Rey house booking, callback request, newsletter subscription, and
member sign-up. It requires a login — no page or API opens without one. It
runs on this computer and online (Vercel).

Next.js 16 (App Router) + TypeScript.

## Running it

```bash
npm install      # first time only
npm run dev
```

Then open <http://localhost:4000>. The first time you open it, you'll create
the first admin account.

Or in VS Code: **Run and Debug → "Admin dashboard"**.

## Structure

```
src/
  app/
    login/               ← sign in / first-time setup
    (dashboard)/         ← every page for signed-in admins
      page.tsx           ← Overview
      tee-times/ bookings/ callbacks/ newsletter/ members/
    api/                 ← login, setup, logout, data, [kind]/[id] (status)
  components/            ← Sidebar, Overview, ListView, Drawer, …
  lib/
    db.ts                ← Turso, or the local SQLite files
    site-db.ts           ← reads the site's data
    auth.ts              ← admin accounts and sessions
  proxy.ts               ← login required; blocks cross-site POST/PATCH
scripts/reset-password.ts
```

## Where the data comes from

**With `TURSO_DATABASE_URL` set (in `.env.local`, or on Vercel):** one shared
Turso database for the website, mobile app, and admin. Copy `.env.example` to
`.env.local` and fill in the URL and token (the same ones the website uses).

**Without it:** it reads the site's SQLite files from the sibling folder:

```
Documents/
  camsuruptowngolf/        ← the website (data/*.sqlite)
  admin-camsuruptowngolf/  ← this repo
```

If the site lives somewhere else:

```bash
SITE_DATA_DIR=/path/to/camsuruptowngolf/data npm run dev
```

Admin accounts live in the `admins` table — in Turso, or in this folder's own
`data/admin.sqlite` when running locally.
**Forgot your password?** Run `npm run reset-password` and type a new one. It
also shows your username. (It reads `.env.local`, so when Turso is set there,
the Turso account is the one that changes.)

## On Vercel

Under Project → Settings → Environment Variables, add `TURSO_DATABASE_URL`
and `TURSO_AUTH_TOKEN`. The session cookie is secure over HTTPS. On first
open, if Turso has no admin yet, you'll see "Create the first admin" — do this
right after deploying (or locally first, with `.env.local` pointed at Turso).

Requires Node.js 22.18 or later.
