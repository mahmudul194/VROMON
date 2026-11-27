# VROMON — Project Roadmap & Multi-Agent Collaboration Guide

> **Last Updated:** 2026-11-28  
> **Active Branch:** `rifat` -> `main`  
> **Project:** Bangladesh Smart Trip Feasibility & Risk-Aware Travel Recommender (SE331 Capstone — Group 6)

---

## Mandatory Rules for Collaborators & AI Agents

> **READ THIS FIRST before starting any task or running any coding agent.**

1. **Always Check & Update This File (`roadmap.md`):**
   - Before writing code, check which Phase/Screen is `[ ]` (Pending) or `[~]` (In Progress) to avoid duplicate work or merge conflicts.
   - Before ending your session or pushing code, you **MUST** update `roadmap.md`:
     - Mark finished items `[x]` with the short commit hash/date.
     - Add an entry to the **Collaboration Activity Log** at the bottom of this file.
     - Add any newly discovered follow-up tasks under the relevant Phase as `[ ]`.
2. **Branch & Git Workflow:**
   - **Feature / Owner Branches:** Rifat + Agent work on **`rifat`** branch (`git checkout rifat`), push to `origin/rifat`, and merge cleanly into **`main`** after verification (`git checkout main && git merge rifat && git push origin main`). Collaborators should work on their own named branch (e.g. `wasif`) and merge into `main` after `npm` verification checks pass.
   - Pull latest `main` before starting new work: `git pull origin main`
   - Never push raw `.env` files, personal API keys, raw unoptimized root `/images/` dumps, or `node_modules`. Document new env keys as placeholders in `.env.example`.
3. **Package Manager & Commands (`npm` Workspaces Only):**
   - Always use **`npm`** (do **not** introduce `pnpm-lock.yaml` or `yarn.lock`).
   - Run verification gates before marking any task `[x]`:
     - `npm run test:shared`
     - `npm run test:api`
     - `npm run test:e2e`
     - `npm run lint --workspace=apps/web`
     - `npm run build:web`
4. **Locked Architecture & Design Contracts (Do Not Break):**
   - **Shared Math Rule (`@vromon/shared`):** All cost, transport, time, crowd, weather, and weighted feasibility math MUST live in `packages/shared/src/calculators/index.ts`. Never ask the LLM to compute prices or math scores.
   - **API Prefix & Auth:** `apps/api` serves on port `4000` with global prefix `/api` (Google OAuth callback: `http://localhost:4000/api/auth/google/callback`, frontend origin: `http://localhost:3000`).
   - **UI Design Rules (`apps/web`):**
     - **Theme:** Google Stitch *Bengal Verve* palette (`#E5F0E0`, `#F0FDEC`, `#F6FAF3`, `#D5E6CF`, `#2F6B2F`, `#145219`, `#5D9253`, `#557945`, `#FFCB3D`, `#1F2A1F`).
     - **Font Rule:** **Inter ONLY** across all pages (self-hosted via `next/font/google`). Zero `font-mono` or `font-serif`.
     - **Type Scale:** Desktop Hero Display `112px` (`800`, `lh 1.0`, `ls -4%`) / Mobile `48px`; Section H1 `64px` / Mobile `36px`; H2 `40px` (`700`); H3 `24px` (`600`); Body `18px`/`16px` (`>=16px`); Small UI minimum `14px`; Label `13px` (`600` uppercase, `ls +6%`). Navbar links `15px` medium; Admin dashboard title `40px` bold, KPI numbers `44px` bold, min text `14px`.
     - **Brand Logo & Copy:** Use `public/vromon_logo.png` as a full horizontal standalone logo (no circle crop, no duplicate `"VROMON"` text beside it). Use **zero emojis** anywhere in the UI. Keep plain English UI labels (`Trip Plan`, `Day Plan`, `Day-by-Day Plan`) while preserving `/itinerary` route path.

---

## Phase Progress Overview

| Phase | Scope | Status | Progress |
|---|---|---|---|
| **Phase 0** | Monorepo Setup, Tooling & Environment | Complete | `100%` |
| **Phase 1** | PostgreSQL Schema, 64-District Seeding & Embeddings | Complete | `100%` |
| **Phase 2** | Shared Pure Math Engine & Zod Schemas (`@vromon/shared`) | Complete | `100%` |
| **Phase 3** | Backend API (`apps/api` — NestJS 10, Auth, Multi-Model AI, Admin) | Complete | `100%` |
| **Phase 4** | Stitch Primary Pages (Desktop Core Flows & Typography) | Complete | `100%` |
| **Phase 4.5** | Remaining Stitch Utility, State & Mobile Sheet Screens (Exact Stitch SVGs) | Complete | `100%` |
| **Phase 5** | Live End-to-End QA & OAuth Guard Readiness | Complete | `100%` |
| **Phase 6** | Security Hardening, 64-District Wikimedia Photos & Mobile Polish | Complete | `100%` |
| **Phase 7** | Production Cloud Deployment *(Deferred by Request — E2E & README Ready)* | Ready for Deploy | `50%` |

---

## Complete Stitch Screen-by-Screen Coverage (`projects/3572637668389846387`)

> Total entries in Google Stitch: **62** (`36` desktop screens/states, `23` mobile responsive counterparts, `3` raw image assets) — **100% Implemented & Verified (`18/18` Next.js routes)**.

### A. Core Application Pages & Implemented States (`[x]` Built)

| # | Stitch Screen(s) & ID | Next.js Route / File | Status | Notes |
|---|---|---|---|---|
| 01 | VROMON Full Landing Page (`8c3a3c37...`) + Mobile (`9cd26170...`) | `/` (`apps/web/src/app/page.tsx`) | `[x]` | Empty hero input, 112px/48px Display scale, local Wikimedia photo arc, 8 Stitch sections |
| 02–05 | Login Default, Error, Loading & Success (`e21e4d8c...`, `1ac93b53...`, `b25372a4...`, `199a4a6f...`) + Mobile (`2fb2c2d2...`) | `/login` (`apps/web/src/app/login/page.tsx`) | `[x]` | 50/50 mosaic split + graceful Google OAuth unconfigured notice |
| 06–09 | Register Step 1 Account, Step 2 Preferences, Step 3 Celebration & Validation Error (`862142cd...`, `152e992c...`, `84179f91...`, `9768a367...`) + Mobile (`f6e266e9...`, `779b2645...`, `6f96b046...`) | `/register` (`apps/web/src/app/register/page.tsx`) | `[x]` | Connected 3-step track + OTP verification + 7-col mosaic |
| 10–13 | Forgot Password A–D (`9bb1c0bc...`, `0438ac06...`, `8fda80ab...`, `f205770f...`) + Mobile (`22e918c4...`, `18eebd1c...`, `7d3c7a99...`, `4fdf6e5e...`) | `/forgot-password` (`apps/web/src/app/forgot-password/page.tsx`) | `[x]` | Centered floating-badge card + 6 OTP cells + 4-dot tracker |
| 14 | Plan Your Trip (`5cdbb9ba...`) + Mobile (`3602a203...`) | `/plan` (`apps/web/src/app/plan/page.tsx`) | `[x]` | Empty input + live extracted pills + sliders + presets + 64-district catalog |
| 15, 28, 31, 33 | Recommendation Results, No Destinations Match, Skeleton Loader, AI Thinking (`6f24d7d4...`, `16ceb7cc...`, `a53735b1...`, `95fbf8b5...`) + Mobile (`f7a2eab3...`, `df476bfd...`) | `/results` (`apps/web/src/app/results/page.tsx`) | `[x]` | 4-step AI Thinking glass card + Skeleton preview + 2-col cards + Magnifier empty state + Compare dock |
| 17 | Destination Detail (`f4e8d60a...`) + Mobile (`e9511d6e...`) | `/destinations/[id]` (`apps/web/src/app/destinations/[id]/page.tsx`) | `[x]` | Hero score, Wikimedia photographer attribution link, `CostChart`, 12-month `ClimateChart`, Leaflet map |
| 18, 29 | AI Trip Plan + Curating Expedition Loader (`0a8fcd5c...`, `e28b5fcf...`) + Mobile (`b28642bb...`) | `/itinerary` (`apps/web/src/app/itinerary/page.tsx`) | `[x]` | Conic orbital Curating Loader, KPI bar, timeline, sticky map, PDF + 30-day share |
| 19 | Compare Destinations (`1db090dd...`) + Mobile (`da267429...`) | `/compare` (`apps/web/src/app/compare/page.tsx`) | `[x]` | Dynamic slider, 3-col matrix, Recharts `RadarChart` |
| 20 | My Trips Dashboard (`1432698f...`) + Mobile (`6bafdf4a...`) | `/trips` (`apps/web/src/app/trips/page.tsx`) | `[x]` | Zero emoji header, 3 KPI cards, filter tabs, offline `localStorage` fallback |
| 21 | Shared Trip Plan (`dbe0ccef...`) | `/plan/[shareId]` (`apps/web/src/app/plan/[shareId]/page.tsx`) | `[x]` | Read-only 30-day public expedition view |
| 22 | Profile & Settings (`795f3f1d...`) + Mobile (`82a41a6a...`) | `/profile` (`apps/web/src/app/profile/page.tsx`) | `[x]` | 2-col settings nav + preferences + shared Logout confirmation modal/sheet |
| 23–24 | Admin Dashboard, Destinations Management & Standalone Admin Portal (`acba8657...`, `6e0c7912...`) | `/admin` (`apps/web/src/app/admin/page.tsx`) + `/admin/login` (`apps/web/src/app/admin/login/page.tsx`) | `[x]` | Standalone portal (no consumer Navbar/Footer), isolated `vromon_admin_token`, pre-provisioned `admin@vromon.bd`, 40px title, 44px KPIs, Recharts, slide-over editor, bulk JSON import |
| 25, 61 | 404 Page Not Found (`3bdde069...`, `c2e1ef3d...`) | `not-found.tsx` (`apps/web/src/app/not-found.tsx`) | `[x]` | Giant `4 [Interactive Amber Compass SVG] 4` + Suggested Detours strip |

### B. Remaining Stitch States, Dedicated Utility Pages, Modals & Mobile Sheets (`[x]` Built)

| # | Stitch Screen(s) & ID | Target File / Route | Status |
|---|---|---|---|
| 26 | 500 Server Error (`dd18f1ff...`) | `apps/web/src/app/error.tsx` (Server stack + amber spark SVG, live `/api/health` check & Telemetry Diagnostics drawer) | `[x]` |
| 27, 60, 62 | You're Offline (`16225506...`, `ea2e89a3...`, `054ce692...`) | `/offline` (`apps/web/src/app/offline/page.tsx`) + `OfflineBanner.tsx` (Wi-Fi Off amber slash SVG, Retry & Cached Dossiers) | `[x]` |
| 30, 59 | Full-Screen Page Loader (`00750958...`, `fc2f1fb0...`) | `apps/web/src/app/loading.tsx` (208px gradient orbital halo + Tea-Leaf Compass emblem) | `[x]` |
| 32 | Button & Inline Loaders Board (`73f0a623...`) | Inline `Loader2` states across auth, planner, share, save & admin buttons | `[x]` |
| 34 | Logged Out Success (`178f8a5c...`) | `/logged-out` (`apps/web/src/app/logged-out/page.tsx`) dedicated Stitch farewell screen with overlapping destination thumbnails | `[x]` |
| 35 | Session Expired (`18fff3b5...`) | `/session-expired` (`apps/web/src/app/session-expired/page.tsx`) + `AuthStatusBanners.tsx` (cached identity pod + inline password re-auth) | `[x]` |
| 36, 58 | Logout Confirmation Modal & Mobile Bottom Sheet (`35e22141...`, `a0ffaaee...`) | `Navbar.tsx` + `AuthContext.tsx` (`Log out of VROMON?`, `#FFCB3D` arrow coin -> `/logged-out`, `Stay logged in`) | `[x]` |
| 38 | Mobile Navigation Menu Open (`0cd71a6f...`) | `Navbar.tsx` bottom-up rounded-`[32px]` editorial sheet (`01`..`04` numbered links + Sreemangal preview card + `Get started` coin CTA) | `[x]` |
| 52 | Mobile Filters Bottom Sheet (`be171fb2...`) | `/results` bottom sheet + sidebar (`Budget Tier`, `Crowd`, interactive `1–5` star `Weather Rating`, `Transport`, `Division`, `Reset`) | `[x]` |

---

## Detailed Engineering Checklist (Phases 0 – 7)

### Phase 0: Monorepo Setup, Tooling & Environment
- [x] Configure `npm workspaces` monorepo (`packages/shared`, `apps/api`, `apps/web`) (`package.json`, `tsconfig.base.json`)
- [x] Configure `.gitignore` to protect `.env`, `node_modules`, `.next`, `dist`, raw `/images/`
- [x] Provide complete `.env.example` covering Neon DB, JWT secrets, Google OAuth, Gmail SMTP, Gemini keys (`d8f7839`)

### Phase 1: Database Schema, 64-District Seeding & Embeddings
- [x] Author Prisma schema for Divisions, Destinations, Attractions, TransportOptions, MonthlyConditions, Users, SavedTrips, SharedPlans, QueryLogs, ImportLogs
- [x] Run Excel seed script ingesting `VROMON_64_Districts_Dataset.xlsx` into Neon PostgreSQL (**70** destinations, **266** attractions, **359** transport routes, **840** monthly conditions) (`d8f7839`)
- [x] Generate & store 768-dim travel embeddings (`gemini-embedding-001`) (`d8f7839`)

### Phase 2: Shared Pure Math Engine & Zod Schemas (`packages/shared`)
- [x] Zod trip query & parsed intent schemas (`packages/shared/src/schemas/index.ts`)
- [x] Pure calculators (`calculateAvailableTime`, `selectOptimalTransport`, `calculateBudgetFeasibility`, `calculateCrowdEvaluation`, `calculateWeatherScore`, `calculateInterestScore`, `calculateMultiFactorScore`, `recalculateForBudgetSlider`, `cosineSimilarity`)
- [x] Jest unit tests passing (`npm run test:shared` — 9/9) (`d8f7839`)

### Phase 3: Backend API (`apps/api` — NestJS 10)
- [x] Auth module: Email/Password sign-up, bcrypt, 6-digit registration & recovery OTP, JWT (`apps/api/src/auth/`) (`d8f7839`)
- [x] Google OAuth 2.0 Passport strategy, callback & graceful unconfigured-client redirect guard (`apps/api/src/auth/guards/google-auth.guard.ts`)
- [x] Nodemailer SMTP service (`apps/api/src/mail/mail.service.ts`) (`d8f7839`)
- [x] Fast Gemini AI service (`gemini-3-flash-preview` -> `gemini-3.8-flash` -> `gemini-3.5-flash-lite` multi-model failover + 429 cooldown + deterministic fallback) (`apps/api/src/ai/ai.service.ts`)
- [x] Recommendations engine verified on golden Khulna benchmark (`npm run test:api` — 1/1 passing) (`d8f7839`)
- [x] Destinations, Day-by-Day Plan generator, 30-day Shared Plans, Saved Trips, and Admin CRUD endpoints (`d8f7839`)

### Phase 4 & Phase 4.5: Complete 62-Screen Stitch Frontend (`apps/web`)
- [x] All 18 routes (`/`, `/login`, `/register`, `/forgot-password`, `/auth/callback`, `/plan`, `/results`, `/destinations/[id]`, `/itinerary`, `/compare`, `/trips`, `/plan/[shareId]`, `/profile`, `/admin`, `/logged-out`, `/session-expired`, `/offline`, `not-found.tsx`, `error.tsx`, `loading.tsx`) built faithfully to Stitch
- [x] Inter-only self-hosted typography + exact Prompt 0 scale + standalone horizontal `vromon_logo.png` + plain English UI copy (`Trip Plan`, `Day Plan`)
- [x] ESLint `0` errors & production build verified (`18/18` routes)

### Phase 5: Live End-to-End QA & OAuth Readiness
- [x] **Google OAuth Guard & Callback Ready:** `GoogleAuthGuard` gracefully redirects to `/login?error=google_not_configured` until real Google Cloud Console `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (`http://localhost:3000` origin + `http://localhost:4000/api/auth/google/callback`) are added to `.env`
- [x] **Auth Live QA Verified:** Login, `/auth/me`, `PATCH /auth/profile`, inline `/session-expired` password re-auth, `/logged-out` flow, and 302 Google OAuth redirect verified (`npm run test:e2e`)
- [x] **Planner & Results Live QA Verified:** English (`Khulna 10k 2-person` -> `Fits`, `BDT 8,250`) & Banglish (`Sylhet 18k 3-person 3-day`) prompts, What-If slider, weather/crowd/status/division filters, and Saved Trips CRUD verified (`npm run test:e2e`)
- [x] **Day Plan, Compare & Shared Link QA Verified:** `/itinerary` Day-by-Day Plan generation + `POST /api/shared-plans` 30-day public link + logged-out `GET /api/shared-plans/:shareId` verified (`npm run test:e2e`)
- [x] **Admin Live QA Verified:** Admin login, `/api/admin/stats`, live destination hotel rate edit + DB persistence, and `POST /api/admin/destinations/bulk` JSON import verified (`npm run test:e2e`)

### Phase 6: Security Hardening, Media Integration & Responsive Polish
- [x] Optimized & wired all **64** Wikimedia Commons district photos (`15.70 MB` progressive JPEG in `apps/web/public/images/destinations/`) into `seed.ts`, synced all **70/70** Neon PostgreSQL `destination.image_url` rows, and added `photo-credits.ts` photographer + license attribution on `/destinations/[id]` & `Footer.tsx`
- [x] Completed mobile `375px` & sheet sweep matching Stitch `#37`–`#62` (editorial numbered mobile menu `#38`, mobile filters sheet with weather stars `#52`, mobile logout sheet `#58`, mobile AI thinking `#48`, mobile offline `#60/#62`, mobile 404 `#61`)
- [x] Added `@nestjs/throttler` rate limiting on OTP/auth/AI endpoints (verified HTTP `429` on burst spam) + HTTP security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) in `main.ts`

### Phase 7: Production Deployment & Capstone Demo Readiness *(Deployment Deferred per User Instruction)*
- [ ] Prepare production cloud deployment on Render/Railway/Fly (Backend) and Vercel (Frontend) + update `WEB_ORIGIN` and `NEXT_PUBLIC_API_URL` *(Deferred — everything else complete)*
- [ ] Register production Google OAuth callback URL (`https://<api-domain>/api/auth/google/callback`) *(Deferred with cloud deployment)*
- [x] Add automated E2E smoke test script (`scripts/e2e-smoke.cjs` -> `npm run test:e2e`) covering all 7 core capstone grading flows (`2026-11-27`, `rifat`)
- [x] Update root `README.md` with clear local setup, test commands, architecture overview, and team credits (`a0ce489`, `rifat`)

---

## Active Collaboration Board

| Task / Area | Owner | Branch | Status | Notes |
|---|---|---|---|---|
| Phases 0 – 4 (Core Monorepo, API, Seed, 14 Stitch Pages) | Rifat + Agent | `rifat` -> `main` | `[x]` Done | Pushed to `rifat` and merged cleanly into `main` |
| Phase 4.5 (Stitch Error/Offline/Skeleton/Modal Screens) | Wasif + Rifat + Agents | `wasif` / `rifat` -> `main` | `[x]` Done | Upgraded to 100% exact Stitch SVGs & dedicated routes (`18/18` routes) |
| Phase 5 (Live E2E QA & OAuth Guard Readiness) | Rifat + Agent | `rifat` -> `main` | `[x]` Done | `7/7` automated live E2E smoke suites passing (`npm run test:e2e`) |
| Phase 6 (64 Wikimedia Photos, `@nestjs/throttler`, Mobile Polish) | Rifat + Agent | `rifat` -> `main` | `[x]` Done | `70/70` DB rows synced to local `/images/destinations/*.jpg` + credits |
| Phase 7 (Cloud Deployment Only Remaining) | Unassigned | — | `[ ]` Deferred | Ready whenever team decides to deploy live |

---

## Collaboration Activity Log

| Date | Commit / Ref | Author / Agent | Summary of Changes |
|---|---|---|---|
| 2026-11-28 | `rifat` -> `main` | Rifat + Agent | Removed `Admin` link/badge from public `Navbar`, hid consumer `Navbar`/`Footer`/`AuthStatusBanners` on `/admin*`, built dedicated `/admin/login` + `POST /api/auth/admin/login` with isolated `vromon_admin_token` session, and provisioned pre-created `admin@vromon.bd` (`VromonAdmin2026!`) account in Neon DB & `seed.ts` (`19/19` Next.js routes, `7/7` E2E suites) |
| 2026-11-27 | `b7660fe` (`rifat` -> `main`) | Rifat + Agent | Audited all 10 end-to-end user-perspective workflows (`WORKFLOW_VERIFICATION.md`), polished 5 UX transitions (profile hub/budget auto-sync on `/` & `/plan`, slider-only `/plan` submit + clean vibe chips, `?next=` login return flow on Save Trip, live landing Trip Plan Builder link, iconic `/compare` defaults), and verified all 18 Next.js routes + live SMTP/OAuth/AI/DB journeys |
| 2026-11-27 | `d6bf22e` (`rifat` -> `main`) | Rifat + Agent | Completed Stitch 62-screen exact audit & rebuild (`/logged-out`, `/session-expired`, `/offline`, Stitch `404` compass, `500` server spark + live health drawer, `#28` magnifier empty state, `#29` curating loader, `#33` 4-step AI thinking card, `#38` numbered mobile nav, `#52` weather-star mobile filter sheet), wired all 64 optimized Wikimedia district photos + photographer credits (`Phase 6`), added `@nestjs/throttler` + HTTP security headers + multi-model Gemini failover (`gemini-3-flash-preview` / `gemini-3.8-flash` / `gemini-3.5-flash-lite`), and added 7-suite live E2E smoke test (`npm run test:e2e`) (`Phase 5` & `Phase 7` pre-deploy) |
| 2026-11-27 | `ce816d0` (`rifat` -> `main`) | Rifat + Agent | Optimized `AiService` (`thinkingBudget: 0` fast Gemini 3 Flash JSON mode for `<3.5s` intent, Top-4 batch grounded reasons & day plans) + honored explicit prompt budget/travelers/days across `/` and `/plan` |
| 2026-11-26 | `a0ce489` (`rifat` -> `main`) | Rifat + Agent | Wrote comprehensive professional UTF-8 `README.md` (architecture diagram, 6-factor math formulas, setup guide, API table, DIU Group 6 credits) and updated `roadmap.md` |
| 2026-11-26 | `5043716` (`rifat` -> `main`) | Rifat + Agent | Synced latest `main` (Wasif's Phase 4.5 merge `c15217a`) into `rifat`, finalized `rifat` -> `main` branch workflow in `roadmap.md`, pushed `origin/rifat`, and merged cleanly into `main` |
| 2026-11-26 | `c15217a` (`wasif` -> `main`) | Wasif + Agent | Completed initial Phase 4.5: added `error.tsx`, `loading.tsx`, `OfflineBanner.tsx`, `AuthStatusBanners.tsx` with 401 interceptor, Logout modal/bottom sheet, and `/results` skeleton + mobile filters sheet |
| 2026-11-26 | `bc503ec` | Rifat + Agent | Audited all **62** Stitch entries (`projects/3572637668389846387`) and added explicit screen-by-screen table + Phase 4.5 for missing Stitch utility/modal screens to `roadmap.md` |
| 2026-11-26 | `ba8736a` | Rifat + Agent | Routed Navbar `Get started` button to `/register` and rebuilt `/login` & `/register` (with Step 2 Vibes/Budget Preferences) to exact Stitch `02_login`, `03_register_1`, and `04_register_2` visual layouts |
| 2026-11-26 | `fbbb6f1` | Rifat + Agent | Cleared hardcoded pre-filled prompts on Hero `/` & `/plan` + ran Wikimedia photo downloader (64/64 districts downloaded) |
| 2026-11-26 | `704d771` | Rifat + Agent | Replaced visible `"itinerary"` UI copy with plain English (`Trip Plan`, `Day Plan`); verified clean build (15/15 routes) |
| 2026-11-26 | `1f58902` | Rifat + Agent | Switched `vromon_logo.png` to standalone horizontal rendering (removed circle crop and duplicate `VROMON` text) |
| 2026-11-26 | `03f160a` | Rifat + Agent | Self-hosted `Inter` font via `next/font/google` (fixing serif fallback) and floated landing navbar cleanly over hero gradient |
| 2026-11-26 | `02572ee` | Rifat + Agent | Enforced Inter-only typography and exact Prompt 0 desktop/mobile/admin/navbar type scale across all pages |
| 2026-11-26 | `f9b91e1` | Rifat + Agent | Rebuilt core frontend screens faithfully to Google Stitch Bengal Verve design |
| 2026-11-25 | `d8f7839` | Rifat + Agent | Initialized full-stack monorepo (`@vromon/shared`, NestJS `apps/api`, Next.js `apps/web`) and seeded Neon PostgreSQL |
