# Notebloom

An independent online bookstore — browse, sign up, add to cart, check out,
leave reviews, and manage inventory from an admin dashboard. Built as a real
full-stack app: Next.js (App Router) on the front and back end, with a SQLite
database and cookie-based auth, no third-party services required.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **Database:** Node's built-in [`node:sqlite`](https://nodejs.org/api/sqlite.html)
  module — no native binaries to install, no external DB to provision. The
  whole database is one file: `data/notebloom.db`, created automatically (and
  seeded with 15 books + a demo admin account) the first time the app runs.
- **Auth:** [Auth.js / NextAuth v5](https://authjs.dev) with a credentials
  (email + password) provider, passwords hashed with bcrypt, JWT sessions.
- **Styling:** Tailwind CSS v4 with a custom design system (see
  `src/app/globals.css`) and self-hosted fonts (Fraunces, Source Serif 4,
  Space Mono via `@fontsource`) — no calls to Google Fonts at build time.
- **Book covers** are generated as SVG on the fly (`src/components/BookCover.tsx`)
  rather than using real cover art, so there's nothing to license.

No Prisma, no ORM — `src/lib/db.ts` has plain SQL via `node:sqlite`'s
synchronous API, which is plenty fast for a store this size and keeps the
dependency list small.

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. The database and seed data are created
automatically on first run.

**Demo admin login:** `admin@notebloom.shop` / `notebloom123`
(shown on the login page too). Log in with this account and an **ADMIN**
link appears in the header, linking to `/admin` for inventory and order
management.

Anyone can sign up for a regular account from `/signup`.

### Environment variables

`.env.local` is already populated with a generated `AUTH_SECRET` for local
development. If you deploy this anywhere, **generate a new one**:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

and set `AUTH_SECRET` (and `NEXTAUTH_URL` to your real domain) in your
hosting provider's environment settings.

### Useful scripts

```bash
npm run dev        # local dev server
npm run build      # production build
npm run start       # run the production build
npm run lint        # eslint
npm run db:check    # exercises the database layer end-to-end (signup, cart,
                    # checkout, stock decrement, reviews, admin CRUD) against
                    # a throwaway copy of the schema — good smoke test after
                    # changes to src/lib/db.ts
```

## How it's organized

```
src/
  app/
    page.tsx                  Home
    shop/page.tsx              Browse/search/filter
    shop/[id]/page.tsx         Book detail, reviews
    cart/page.tsx              Cart + checkout
    account/page.tsx           Order history
    account/orders/[id]/       Order confirmation
    login/, signup/            Auth pages
    admin/                     Inventory CRUD (admin only)
    admin/orders/               All orders (admin only)
    actions/                   Server Actions (cart, auth, reviews, admin)
  components/                  UI building blocks
  lib/
    db.ts                      Schema, seed data, all queries
    auth.ts                    NextAuth config
    constants.ts, types.ts     Genre list / Book type shared with client
                                components (kept separate from db.ts so the
                                database driver never gets bundled client-side)
```

## Deploying this somewhere public

This chat environment can't host a live URL, so here's what to know before
you put it on the internet:

**The important caveat:** the database is a single file on local disk. That
works perfectly on any host with a persistent filesystem — a small VPS,
Railway, Render, Fly.io, etc. Just run `npm run build && npm run start`
(or let the platform do it) and make sure the `data/` directory persists
across deploys (e.g. mount it as a volume).

**It will *not* reliably persist data on Vercel or other serverless
platforms** — their filesystem is ephemeral per invocation, so a SQLite
file written at runtime can disappear or fall out of sync between requests.
If you want to deploy there, swap `src/lib/db.ts` for a hosted database
(Vercel Postgres, Neon, Turso, etc.) — the rest of the app (pages, Server
Actions, auth) doesn't need to change, since they all go through the
functions exported from that one file.

Either way: set a fresh `AUTH_SECRET` and `NEXTAUTH_URL` in production, and
consider rotating or removing the demo admin account once you've created
your own.

## Notes on the data

The 15 books are original/fictional — invented titles and authors, not real
books — and covers are procedurally generated SVGs, specifically so there's
nothing here that needs licensing. Swap in real inventory by either using
the `/admin` dashboard or editing the seed list in `src/lib/db.ts`
(`seedIfEmpty`) before the first run.
