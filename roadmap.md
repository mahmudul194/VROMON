# VROMON — Project Roadmap & Multi-Agent Collaboration Guide

> **Last Updated:** 2026-11-26  
> **Active Branch:** `main`  
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
   - **Feature / Owner Branches:** Rifat + Agent work on **`rifat`** branch (`git checkout rifat`), push to `origin/rifat`, and merge cleanly into **`main`** after verification (`git checkout main && git merge rifat && git push origin main`). Collaborators should work on their own named branch (e.g. `<collaborator-name>`) and merge into `main` after `npm` verification checks pass.
   - Pull latest `main` before starting new work: `git pull origin main`
   - Never push raw `.env` files, personal API keys, `images/` media dumps (unless approved), or `node_modules`. Document new env keys as placeholders in `.env.example`.
3. **Package Manager & Commands (`npm` Workspaces Only):**
   - Always use **`npm`** (do **not** introduce `pnpm-lock.yaml` or `yarn.lock`).
   - Run verification gates before marking any task `[x]`:
     - `npm run test:shared`
     - `npm run test:api`
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
| **Phase 3** | Backend API (`apps/api` — NestJS 10, Auth, AI, Admin) | Complete | `100%` |
| **Phase 4** | Stitch Primary Pages (Desktop Core Flows & Typography) | Complete | `100%` |
| **Phase 4.5** | Remaining Stitch Utility, State & Mobile Sheet Screens | Pending | `0%` |
| **Phase 5** | Google OAuth Console Setup & Live E2E Browser QA | Pending | `0%` |
| **Phase 6** | Security Hardening, Media Integration & Responsive Polish | Pending | `0%` |
| **Phase 7** | Production Deployment & Capstone Demo Readiness | Pending | `0%` |

---

## Complete Stitch Screen-by-Screen Coverage (`projects/3572637668389846387`)

> Total entries in Google Stitch: **62** (`36` desktop screens/states, `23` mobile responsive counterparts, `3` raw image assets).

### A. Core Application Pages & Implemented States (`[x]` Built)

| # | Stitch Screen(s) & ID | Next.js Route / File | Status | Notes |
|---|---|---|---|---|
| 01 | VROMON Full Landing Page (`8c3a3c37...`) + Mobile (`9cd26170...`) | `/` (`apps/web/src/app/page.tsx`) | `[x]` | Empty hero input, 112px/48px Display scale, 8 Stitch sections |
| 02–05 | Login Default, Error, Loading & Success (`e21e4d8c...`, `1ac93b53...`, `b25372a4...`, `199a4a6f...`) + Mobile (`2fb2c2d2...`) | `/login` (`apps/web/src/app/login/page.tsx`) | `[x]` | 50/50 mosaic split; fake Facebook omitted |
| 06–09 | Register Step 1 Account, Step 2 Preferences, Step 3 Celebration & Validation Error (`862142cd...`, `152e992c...`, `84179f91...`, `9768a367...`) + Mobile (`f6e266e9...`, `779b2645...`, `6f96b046...`) | `/register` (`apps/web/src/app/register/page.tsx`) | `[x]` | Connected 3-step track + OTP verification + 7-col mosaic |
| 10–13 | Forgot Password A–D (`9bb1c0bc...`, `0438ac06...`, `8fda80ab...`, `f205770f...`) + Mobile (`22e918c4...`, `18eebd1c...`, `7d3c7a99...`, `4fdf6e5e...`) | `/forgot-password` (`apps/web/src/app/forgot-password/page.tsx`) | `[x]` | Centered floating-badge card + 6 OTP cells + 4-dot tracker |
| 14 | Plan Your Trip (`5cdbb9ba...`) + Mobile (`3602a203...`) | `/plan` (`apps/web/src/app/plan/page.tsx`) | `[x]` | Empty input + live extracted pills + sliders + presets + catalog |
| 15, 28, 29, 33 | Recommendation Results, No Destinations Match, Curating Loader, AI Thinking (`6f24d7d4...`, `16ceb7cc...`, `e28b5fcf...`, `95fbf8b5...`) + Mobile (`f7a2eab3...`, `df476bfd...`) | `/results` (`apps/web/src/app/results/page.tsx`) | `[x]` | 2-col cards + 6-bar breakdown + `<1ms` What-If slider + Compare dock |
| 17 | Sajek Valley Destination Detail (`f4e8d60a...`) + Mobile (`e9511d6e...`) | `/destinations/[id]` (`apps/web/src/app/destinations/[id]/page.tsx`) | `[x]` | Hero score, anchor tabs, `CostChart`, 12-month `ClimateChart`, Leaflet map |
| 18 | AI Trip Plan / Itinerary (`0a8fcd5c...`) + Mobile (`b28642bb...`) | `/itinerary` (`apps/web/src/app/itinerary/page.tsx`) | `[x]` | KPI bar, AI synthesis, timeline, sticky map, PDF + 30-day share |
| 19 | Compare Destinations (`1db090dd...`) + Mobile (`da267429...`) | `/compare` (`apps/web/src/app/compare/page.tsx`) | `[x]` | Dynamic slider, 3-col matrix, Recharts `RadarChart` |
| 20 | My Trips Dashboard (`1432698f...`) + Mobile (`6bafdf4a...`) | `/trips` (`apps/web/src/app/trips/page.tsx`) | `[x]` | Zero emoji header, 3 KPI cards, filter tabs, trip cards |
| 21 | Shared Trip Plan (`dbe0ccef...`) | `/plan/[shareId]` (`apps/web/src/app/plan/[shareId]/page.tsx`) | `[x]` | Read-only 30-day public expedition view |
| 22 | Profile & Settings (`795f3f1d...`) + Mobile (`82a41a6a...`) | `/profile` (`apps/web/src/app/profile/page.tsx`) | `[x]` | 2-col settings nav + home hub & budget tier preferences |
| 23–24 | Admin Dashboard & Destinations Management (`acba8657...`, `6e0c7912...`) | `/admin` (`apps/web/src/app/admin/page.tsx`) | `[x]` | 40px title, 44px KPIs, Recharts, slide-over editor, bulk JSON import |
| 25 | 404 Page Not Found (`3bdde069...`) + Mobile (`c2e1ef3d...`) | `not-found.tsx` (`apps/web/src/app/not-found.tsx`) | `[x]` | Clean fallback page matching theme |

### B. Remaining Stitch States, Modals & Mobile Sheets (`[ ]` Not Yet Built — Phase 4.5)

| # | Stitch Screen(s) & ID | Target File / Behavior | Status |
|---|---|---|---|
| 26 | 500 Server Error (`dd18f1ff...`) | `apps/web/src/app/error.tsx` (friendly recovery + retry button) | `[ ]` |
| 27, 60, 62 | You're Offline (`16225506...`, `ea2e89a3...`, `054ce692...`) | Offline status banner/page triggered by `navigator.onLine` / `offline` event | `[ ]` |
| 30, 59 | Full-Screen Page Loader (`00750958...`, `fc2f1fb0...`) | `apps/web/src/app/loading.tsx` branded loading transition | `[ ]` |
| 31 | Results Skeleton Loader (`a53735b1...`) | Shimmer card skeleton placeholders on `/results` while fetching | `[ ]` |
| 34–36, 58 | Logged Out Success (`178f8a5c...`), Session Expired (`18fff3b5...`), Logout Confirmation Modal & Mobile Bottom Sheet (`35e22141...`, `a0ffaaee...`) | Confirmation dialog in `Navbar.tsx` + 401 session-expired handler in `AuthContext.tsx` | `[ ]` |
| 38 | Mobile Navigation Menu Open (`0cd71a6f...`) | Verify Stitch mobile drawer layout/spacing polish on `375px` | `[ ]` |
| 52 | Mobile Filters Bottom Sheet (`be171fb2...`) | Collapsible sticky mobile filter trigger + slide-up sheet on `/results` | `[ ]` |

---

## Detailed Engineering Checklist (Phases 0 – 7)

### Phase 0: Monorepo Setup, Tooling & Environment
- [x] Configure `npm workspaces` monorepo (`packages/shared`, `apps/api`, `apps/web`) (`package.json`, `tsconfig.base.json`)
- [x] Configure `.gitignore` to protect `.env`, `node_modules`, `.next`, `dist`
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
- [x] Google OAuth 2.0 Passport strategy & callback (`apps/api/src/auth/strategies/google.strategy.ts`) (`d8f7839`)
- [x] Nodemailer SMTP service (`apps/api/src/mail/mail.service.ts`) (`d8f7839`)
- [x] LangChain JS + Gemini AI service (`gemini-3-flash-preview`) + deterministic fallback (`apps/api/src/ai/ai.service.ts`) (`d8f7839`)
- [x] Recommendations engine verified on golden Khulna benchmark (`npm run test:api` — 1/1 passing) (`d8f7839`)
- [x] Destinations, Day-by-Day Plan generator, 30-day Shared Plans, Saved Trips, and Admin CRUD endpoints (`d8f7839`)

### Phase 4: Stitch Primary Pages & Polish (`apps/web`)
- [x] All 14 primary desktop routes & OAuth callback implemented matching Stitch layouts (`f9b91e1`, `ba8736a`)
- [x] Inter-only self-hosted typography + exact Prompt 0 scale (`02572ee`, `03f160a`)
- [x] Standalone horizontal `vromon_logo.png` without cropping or duplicate text (`1f58902`)
- [x] Plain English UI wording (`Trip Plan`, `Day Plan`) (`704d771`) & clean empty prompt inputs (`fbbb6f1`)
- [x] ESLint `0` errors & production build verified (`15/15` routes) (`ba8736a`)

### Phase 4.5: Remaining Stitch Error, Loader, Offline & Modal Screens
- [ ] Build `apps/web/src/app/error.tsx` matching Stitch `#26` (500 Server Error)
- [ ] Build `apps/web/src/app/loading.tsx` matching Stitch `#30` (Full-Screen Page Loader)
- [ ] Replace spinner on `/results` with Stitch `#31` skeleton cards
- [ ] Add Offline detector banner (`#27` / `#60`), Session Expired notice (`#35`), and Logout Confirmation Modal / Bottom Sheet (`#36` / `#58`) + Logged Out feedback (`#34`)
- [ ] Add collapsible Mobile Filters Bottom Sheet (`#52`) on `/results`

### Phase 5: Google OAuth Console Setup & Live E2E Browser QA *(Next Up)*
- [ ] **Google Cloud Console OAuth Setup:** Add `http://localhost:3000` (Authorized JS Origin) and `http://localhost:4000/api/auth/google/callback` (Authorized Redirect URI) + add test Gmail accounts
- [ ] **Auth Live Test:** Register -> Gmail OTP -> Preferences -> Verify -> Login -> Forgot Password -> Google OAuth callback in real browser
- [ ] **Planner & Results Live QA:** Natural English/Banglish prompts, What-If slider, filters, sorting, Save Trip
- [ ] **Day Plan, Compare & Shared Link QA:** `/compare` radar chart + slider, `/itinerary` PDF export + 30-day link, `/plan/[shareId]` logged-out view
- [ ] **Admin Live QA:** Admin login, edit destination rate via slide-over drawer (`PUT /api/admin/destinations/:id`), verify DB update persists on reload, and test bulk JSON upload

### Phase 6: Security Hardening, Media Integration & Responsive Polish
- [ ] Decide & wire downloaded 64-district Wikimedia photos (`images/` + `credits.csv`, `64/64` photos ready) into `apps/web/public/images/` and `seed.ts` + display photographer attribution footer/captions
- [ ] Mobile `375px` responsive sweep matching Stitch `#37`–`#62` mobile screens
- [ ] Add `@nestjs/throttler` rate limiting on OTP resend / auth / AI routes

### Phase 7: Production Deployment & Capstone Demo Readiness
- [ ] Prepare production environment configs for Backend (Render/Railway/Fly) and Frontend (Vercel) + update CORS `WEB_ORIGIN` and `NEXT_PUBLIC_API_URL`
- [ ] Register production Google OAuth callback URL (`https://<api-domain>/api/auth/google/callback`)
- [ ] Add automated Playwright E2E smoke test script covering core capstone grading flows (`Khulna 10k 2-person` query, PDF export, Admin edit)
- [ ] Update root `README.md` with clear local setup, test commands, architecture overview, and team credits

---

## Active Collaboration Board

| Task / Area | Owner | Branch | Status | Notes |
|---|---|---|---|---|
| Phases 0 – 4 (Core Monorepo, API, Seed, 14 Stitch Pages) | Rifat + Agent | `rifat` -> `main` | `[x]` Done | Pushed to `rifat` and merged cleanly into `main` |
| Phase 4.5 (Stitch Error/Offline/Skeleton/Modal Screens) | Unassigned | — | `[ ]` Open | Available for collaborator |
| Phase 5 (Google Console URIs + Live E2E Browser QA) | Unassigned | — | `[ ]` Open | Coordinate here before claiming |
| Phase 6 (Local 64 Photos Wiring + Mobile `375px` Polish) | Unassigned | — | `[ ]` Open | `images/` + `credits.csv` already downloaded locally |
| Phase 7 (Deployment & Final README) | Unassigned | — | `[ ]` Open | Target after Phase 5 & 6 pass |

---

## Collaboration Activity Log

| Date | Commit / Ref | Author / Agent | Summary of Changes |
|---|---|---|---|
| 2026-11-26 | `rifat` -> `main` | Rifat + Agent | Created `rifat` branch, updated branch/merge workflow in `roadmap.md`, pushed `origin/rifat`, and merged into `main` |
| 2026-11-26 | `bc503ec` | Rifat + Agent | Audited all **62** Stitch entries (`projects/3572637668389846387`) and added explicit screen-by-screen table + Phase 4.5 for missing Stitch utility/modal screens to `roadmap.md` |
| 2026-11-26 | `ba8736a` | Rifat + Agent | Routed Navbar `Get started` button to `/register` and rebuilt `/login` & `/register` (with Step 2 Vibes/Budget Preferences) to exact Stitch `02_login`, `03_register_1`, and `04_register_2` visual layouts |
| 2026-11-26 | `fbbb6f1` | Rifat + Agent | Cleared hardcoded pre-filled prompts on Hero `/` & `/plan` + ran Wikimedia photo downloader (64/64 districts downloaded) |
| 2026-11-26 | `704d771` | Rifat + Agent | Replaced visible `"itinerary"` UI copy with plain English (`Trip Plan`, `Day Plan`); verified clean build (15/15 routes) |
| 2026-11-26 | `1f58902` | Rifat + Agent | Switched `vromon_logo.png` to standalone horizontal rendering (removed circle crop and duplicate `VROMON` text) |
| 2026-11-26 | `03f160a` | Rifat + Agent | Self-hosted `Inter` font via `next/font/google` (fixing serif fallback) and floated landing navbar cleanly over hero gradient |
| 2026-11-26 | `02572ee` | Rifat + Agent | Enforced Inter-only typography and exact Prompt 0 desktop/mobile/admin/navbar type scale across all pages |
| 2026-11-26 | `f9b91e1` | Rifat + Agent | Rebuilt core frontend screens faithfully to Google Stitch Bengal Verve design |
| 2026-11-25 | `d8f7839` | Rifat + Agent | Initialized full-stack monorepo (`@vromon/shared`, NestJS `apps/api`, Next.js `apps/web`) and seeded Neon PostgreSQL |
