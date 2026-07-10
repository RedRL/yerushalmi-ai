# YERUSHALMI.AI

Official production website for **YERUSHALMI.AI** — personalized songs, personalized music videos and AI-generated music videos, built from customer photos, stories and existing footage.

This repository is being built **gradually in milestones**. This document reflects **Milestone 1**: the foundation of the platform (design system, landing page, portfolio, services, process, an initial project configurator, and a backend API with validation, trusted pricing and mock email/storage).

- Production domain (future): `https://yerushalmi.ai`
- Future API domain: `https://api.yerushalmi.ai`
- Payment collection, authentication, customer accounts and a database are **not** part of this milestone.

---

## 1. Technology stack

### Frontend (`client/`)

- Angular 21 (standalone components, no `NgModule`s)
- Angular Signals + Angular modern control flow (`@if`, `@for`, `@switch`)
- Strict TypeScript
- SCSS with a hand-built design token system (no Angular Material, no Bootstrap, no Tailwind)
- Angular Router (lazy-loaded feature route)
- Reactive Forms (typed)
- Angular `HttpClient` with a functional error interceptor
- Angular Animations
- Mobile-first, fully RTL, Hebrew UI

### Backend (`server/`)

- Node.js + Express + TypeScript
- Zod for schema validation (including conditional/business-rule validation)
- Centralized structured logging + centralized error handling
- `express-rate-limit` on the inquiry and upload endpoints
- Resend for outbound email (safe no-op fallback when not configured)
- A storage abstraction (`StorageService`) with a `MockStorageService` implementation, ready to be swapped for Cloudflare R2 / Amazon S3 / Cloudinary
- Vitest for unit tests (pricing engine)

---

## 2. Folder structure

```
yerushalmi-ai/
├── client/                        Angular application
│   └── src/app/
│       ├── core/                  Singleton config/services/interceptors
│       │   ├── config/            pricing.config.ts, site.config.ts
│       │   ├── services/          pricing calculator, inquiry API, upload API
│       │   └── interceptors/      HTTP error normalization
│       ├── shared/                Reusable, feature-agnostic building blocks
│       │   ├── components/        header, footer, floating WhatsApp button,
│       │   │                      file upload, price summary, section heading
│       │   ├── models/            typed domain models
│       │   └── utils/             scroll, file size, id helpers
│       └── features/
│           ├── home/              Hero, services, process + the home page shell
│           ├── portfolio/         Portfolio section, video card, video modal
│           ├── configurator/      The multi-step project configurator + store
│           └── contact/           Contact / WhatsApp section
├── server/                        Express + TypeScript API
│   └── src/
│       ├── config/                Environment loading & validation
│       ├── controllers/           Request handlers
│       ├── middleware/            Validation, rate limiting, error handling
│       ├── pricing/                Centralized, trusted pricing engine
│       ├── routes/                Express routers
│       ├── schemas/               Zod schemas
│       ├── services/               Email + inquiry orchestration
│       ├── storage/                Storage abstraction + mock implementation
│       ├── types/                 Shared error types
│       ├── utils/                 Logger, async handler, HTML escaping
│       ├── app.ts                 Express app wiring
│       └── index.ts                Entry point
└── README.md
```

---

## 3. Prerequisites

- Node.js 20+ (Node 22 LTS recommended)
- npm 10+

---

## 4. Local development

### Backend

```bash
cd server
npm install
copy .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

The API starts on `http://localhost:3000` (see `PORT` in `.env`). Health check: `GET http://localhost:3000/api/health`.

### Frontend

```bash
cd client
npm install
npm start
```

The Angular dev server starts on `http://localhost:4200` and talks to the API at `http://localhost:3000/api` (see `client/src/environments/environment.development.ts`).

Run both at the same time (two terminals) for full local development.

---

## 5. Available scripts

### `client/`

| Command | Description |
| --- | --- |
| `npm start` | Runs `ng serve` (dev server, hot reload) |
| `npm run build` | Production build to `client/dist/client` |
| `npm test` | Runs unit tests (Vitest, via the Angular CLI) |
| `npm run watch` | Development build in watch mode |

### `server/`

| Command | Description |
| --- | --- |
| `npm run dev` | Runs the API with `tsx watch` (hot reload) |
| `npm run build` | Compiles TypeScript to `server/dist` |
| `npm start` | Runs the compiled API (`node dist/index.js`) |
| `npm run typecheck` | Type-checks without emitting output |
| `npm test` | Runs the Vitest suite (pricing engine tests) |

---

## 6. Environment variables (`server/.env`)

See `server/.env.example` for the full list:

```
PORT=3000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:4200
RESEND_API_KEY=
CONTACT_EMAIL=
EMAIL_FROM=
STORAGE_PROVIDER=mock
```

- `CLIENT_ORIGIN` — restricts CORS. Supports a comma-separated list for multiple environments.
- `RESEND_API_KEY` / `CONTACT_EMAIL` / `EMAIL_FROM` — **optional in local development.** If any is missing, the API logs the inquiry and the generated HTML email to the console instead of sending it, and still returns a successful response. Nothing crashes without a Resend account.
- `STORAGE_PROVIDER` — `mock` is the only implementation wired up in Milestone 1. The value is validated but `r2` / `s3` / `cloudinary` currently fall back to the mock service with a warning log (see `server/src/storage/storage.factory.ts`).

The Angular app never receives or stores any API keys — all secrets stay server-side.

---

## 7. Pricing — temporary placeholders (⚠️ read before adjusting prices)

**No real prices have been supplied yet.** Every amount in the pricing configuration is a clearly marked, temporary placeholder:

- `server/src/pricing/pricing.config.ts` — **source of truth**, used for the trusted, final calculation.
- `client/src/app/core/config/pricing.config.ts` — mirrors the same identifiers for an instant client-side estimate (UX only).

Every placeholder is tagged with `// TODO(pricing): placeholder`. To update prices for production, edit the numbers in **both** files (keep the option identifiers — e.g. `song_only`, `ai_only`, `up_to_2_min` — perfectly in sync between client and server; only the numbers should change).

**Pricing security model:** the Angular app calculates a live estimate purely for UX. When an inquiry is submitted, only *option identifiers* are sent to the API — never a price. `server/src/pricing/pricing.service.ts` recalculates the full breakdown from scratch and that trusted result is what gets stored/emailed/returned. Any manipulated `clientPricePreview.total` sent by a browser is ignored entirely.

---

## 8. Mock storage (uploads)

Photo/video/audio uploads are **never** written to the Express filesystem and **never** attached to emails. Milestone 1 ships a `StorageService` abstraction (`server/src/storage/storage.types.ts`) with a single implementation, `MockStorageService`, which simulates the initiate/complete upload flow and returns plausible `mock://` references so the full inquiry flow (validation → pricing → email) can be exercised end to end.

When a real provider is selected, add `R2StorageService` / `S3StorageService` / `CloudinaryStorageService` behind the same interface and switch `STORAGE_PROVIDER` — no controller/route changes should be required. Direct-to-provider signed uploads are the intended long-term flow (file bytes should never pass through the Express server).

---

## 9. Email

Resend integration lives in `server/src/services/email.service.ts` with an RTL-friendly, escaped HTML template in `server/src/services/email-template.ts`. Until `RESEND_API_KEY`, `CONTACT_EMAIL` and `EMAIL_FROM` are all set, the API logs the inquiry and full generated email HTML to the console (structured JSON logs) rather than sending anything — this is intentional and safe for local development and CI.

---

## 10. Build

```bash
# Frontend production build
cd client && npm run build

# Backend production build
cd server && npm run build
```

---

## 11. Deployment notes (future)

Nothing below is configured yet — this section documents the intended target so the codebase stays deploy-ready.

- **Frontend** → Vercel or Netlify, custom domain `yerushalmi.ai`. Build command `npm run build`, output directory `client/dist/client`.
- **Backend** → Render, Railway or Fly.io, custom domain `api.yerushalmi.ai`. Build command `npm run build`, start command `npm start`. Set the environment variables from section 6 in the hosting provider's dashboard — never commit real secrets.
- **Storage** → Cloudflare R2, Amazon S3 or Cloudinary — to be selected. Update `STORAGE_PROVIDER` and implement the matching `StorageService`.
- **CORS** → update `CLIENT_ORIGIN` on the deployed backend to the production frontend origin.

---

## 12. Testing

- Backend: `cd server && npm test` — unit tests for the pricing engine (`server/src/pricing/pricing.service.test.ts`) covering each main product, video source/length/format/subtitle surcharges, addon deduplication, and the VAT/discount-free Milestone 1 behavior.
- Frontend: `cd client && npm test` — lightweight component smoke tests (Vitest via the Angular CLI).

---

## 13. What's intentionally out of scope for Milestone 1

- Payment collection
- Authentication / customer accounts
- A database (inquiries are validated, priced and emailed/logged, not persisted)
- Permanent file storage (mock storage only)
- Final production prices
