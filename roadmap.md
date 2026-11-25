# VROMON — Project Roadmap & Multi-Agent Collaboration Guide

> **Last Updated:** 2026-11-26  
> **Active Branch:** `main` (latest commit: `704d771`)  
> **Project:** Bangladesh Smart Trip Feasibility & Risk-Aware Travel Recommender (SE331 Capstone — Group 6)

---

## Mandatory Rules for Collaborators & AI Agents

> **READ THIS FIRST before starting any task or running any coding agent.**

1. **Always Check & Update This File (`roadmap.md`):**
   - Before writing code, check which Phase/Task is `[ ]` (Pending) or `[~]` (In Progress) to avoid duplicate work or merge conflicts.
   - Before ending your session or pushing code, you **MUST** update `roadmap.md`:
     - Mark finished items `[x]` with the short commit hash/date.
     - Add an entry to the **Collaboration Activity Log** at the bottom of this file.
     - Add any newly discovered follow-up tasks under the relevant Phase as `[ ]`.
2. **Branch & Git Workflow:**
   - Pull latest `main` before starting: `git pull origin main`
   - Never push raw `.env` files, personal API keys, or node_modules. If a new environment variable is added, document its placeholder in `.env.example`.
3. **Package Manager & Commands (`npm` Workspaces Only):**
   - Always use **`npm`** (do **not** introduce `pnpm-lock.yaml` or `yarn.lock`).
   - Run all verification commands before marking a task `[x]`:
     - `npm run test:shared`
     - `npm run test:api`
     - `npm run lint --workspace=apps/web`
     - `npm run build:web`
4. **Locked Architecture & Design Contracts (Do Not Break):**
   - **Shared Math Rule (`@vromon/shared`):** All cost, transport, time, crowd, weather, and weighted feasibility scores MUST live in `packages/shared/src/calculators/index.ts`. Never ask the LLM to compute prices or math scores.
   - **API Prefix & Auth:** `apps/api` serves on port `4000` with global prefix `/api` (so Google OAuth callback is `http://localhost:4000/api/auth/google/callback`, frontend origin is `http://localhost:3000`).
   - **UI Design Rules (`apps/web`):**
     - **Theme:** Google Stitch *Bengal Verve* palette (`#E5F0E0`, `#F0FDEC`, `#F6FAF3`, `#D5E6CF`, `#2F6B2F`, `#145219`, `#5D9253`, `#557945`, `#FFCB3D`, `#1F2A1F`).
     - **Font Rule:** **Inter ONLY** across all pages (self-hosted via `next/font/google`). Zero `font-mono` or `font-serif`.
     - **Type Scale:** Desktop Hero Display `112px` (`800`, `lh 1.0`, `ls -4%`) / Mobile `48px`; Section H1 `64px` / Mobile `36px`; H2 `40px` (`700`); H3 `24px` (`600`); Body `18px`/`16px` (`>=16px`); Small UI minimum `14px`; Label `13px` (`600` uppercase, `ls +6%`). Navbar links `15px` medium; Admin dashboard title `40px` bold, KPI numbers `44px` bold, min text `14px`.
     - **Brand Logo & Copy:** Use `public/vromon_logo.png` as a full horizontal standalone logo (no circle crop, no duplicate text `"VROMON"` beside it). Use **zero emojis** anywhere in the UI. Keep plain English UI labels (`Trip Plan`, `Day Plan`, `Day-by-Day Plan`) while keeping route path `/itinerary` intact for URL compatibility.

---

## Phase Progress Overview

| Phase | Scope | Status | Progress |
|---|---|---|---|
| **Phase 0** | Monorepo Setup, Tooling & Environment | Complete | `100%` |
| **Phase 1** | PostgreSQL Schema, 64-District Seeding & Embeddings | Complete | `100%` |
| **Phase 2** | Shared Pure Math Engine & Zod Schemas (`@vromon/shared`) | Complete | `100%` |
| **Phase 3** | Backend API (`apps/api` — NestJS 10, Auth, AI, Admin) | Complete | `100%` |
| **Phase 4** | Frontend Web App (`apps/web` — 16 Stitch UI Screens & Polish) | Complete | `100%` |
| **Phase 5** | Google OAuth Console Setup & Live E2E Browser QA | Pending | `0%` |
| **Phase 6** | Security Hardening, Responsive Polish & Edge Cases | Pending | `0%` |
| **Phase 7** | Production Deployment & Capstone Demo Readiness | Pending | `0%` |

---

## Detailed Phased Checklist

### Phase 0: Monorepo Setup, Tooling & Environment
- [x] Configure `npm workspaces` monorepo (`packages/shared`, `apps/api`, `apps/web`) (`package.json`, `tsconfig.base.json`)
- [x] Configure `.gitignore` to protect `.env`, `node_modules`, `.next`, `dist`
- [x] Provide complete `.env.example` covering Neon DB, JWT secrets, Google OAuth, Gmail SMTP, and Gemini keys (`d8f7839`)

### Phase 1: Database Schema, 64-District Seeding & Embeddings
- [x] Author Prisma schema for Divisions, Destinations, Attractions, TransportOptions, MonthlyConditions, Users, SavedTrips, SharedPlans, QueryLogs, ImportLogs
- [x] Build and run Excel seed script ingesting `VROMON_64_Districts_Dataset.xlsx` into Neon PostgreSQL (**70** destinations, **266** attractions, **359** transport routes, **840** monthly conditions) (`d8f7839`)
- [x] Generate and store 768-dim travel embeddings (`gemini-embedding-001`) for semantic search (`d8f7839`)

### Phase 2: Shared Pure Math Engine & Zod Schemas (`packages/shared`)
- [x] Implement Zod trip query & parsed intent schemas (`packages/shared/src/schemas/index.ts`)
- [x] Implement deterministic calculators: `calculateAvailableTime`, `selectOptimalTransport`, `calculateBudgetFeasibility`, `calculateCrowdEvaluation`, `calculateWeatherScore`, `calculateInterestScore`, `calculateMultiFactorScore`, `recalculateForBudgetSlider`, `cosineSimilarity`
- [x] Verify with Jest unit suite (`npm run test:shared` — 9/9 passing) (`d8f7839`)

### Phase 3: Backend API (`apps/api` — NestJS 10)
- [x] Auth module: Email/Password sign-up, bcrypt hashing, 6-digit email OTP verification, Password recovery OTP, JWT Bearer tokens (`apps/api/src/auth/`) (`d8f7839`)
- [x] Google OAuth 2.0 Passport strategy & callback handler redirecting with token to frontend (`apps/api/src/auth/strategies/google.strategy.ts`) (`d8f7839`)
- [x] Nodemailer SMTP service for OTP verification emails (`apps/api/src/mail/mail.service.ts`) (`d8f7839`)
- [x] LangChain JS + Gemini AI service (`gemini-3-flash-preview`) with strict Zod structured intent extraction + deterministic fallback (`apps/api/src/ai/ai.service.ts`) (`d8f7839`)
- [x] Recommendations engine (`POST /api/recommendations`) verified on golden Khulna benchmark (`npm run test:api` — 1/1 passing) (`d8f7839`)
- [x] Destinations catalog, Day-by-day plan generator (`POST /api/itineraries/generate`), 30-day public Shared Plans (`POST/GET /api/shared-plans`), Saved Trips (`GET/POST/DELETE /api/trips`), and Admin telemetry/CRUD/bulk JSON endpoints (`apps/api/src/admin/admin.module.ts`) (`d8f7839`)

### Phase 4: Frontend Web App (`apps/web` — Next.js 14 Stitch UI)
- [x] Rebuild Landing Page (`/`) matching Google Stitch 8-section editorial layout (`f9b91e1`, `03f160a`)
- [x] Rebuild Floating Glass Navbar & Dark Editorial Footer with standalone full horizontal `vromon_logo.png` (`f9b91e1`, `1f58902`)
- [x] Rebuild Auth screens (`/login`, `/register` 3-step stepper + 6 OTP cells, `/forgot-password`, `/auth/callback`) without fake unimplemented social buttons (`f9b91e1`, `1f58902`)
- [x] Rebuild Planner & Discovery (`/plan`, `/results` with live `<1ms` What-If slider, 6-bar breakdown grid, sticky compare dock) (`f9b91e1`)
- [x] Rebuild Destination Detail (`/destinations/[id]`), Day Plan (`/itinerary` + jsPDF + 30-day share + Leaflet map), Shared Plan (`/plan/[shareId]`), and Side-by-Side Comparison Matrix + RadarChart (`/compare`) (`f9b91e1`)
- [x] Rebuild User Workspace (`/trips`, `/profile`) and Admin Dashboard + Slide-Over Destination Editor + Bulk JSON Import (`/admin`) (`f9b91e1`)
- [x] Self-host Inter font (`next/font/google`), remove all monospace/serif classes, and enforce exact Prompt 0 desktop/mobile typography scale (`02572ee`, `03f160a`)
- [x] Replace `"itinerary"` visible UI wording with plain English (`Trip Plan`, `Day Plan`, `Day-by-Day Plan`) while preserving routes (`704d771`)
- [x] Verify `npm run lint --workspace=apps/web` (0 errors) and `npm run build:web` (15/15 routes compiled cleanly) (`704d771`)

### Phase 5: Google OAuth Console Setup & Live E2E Browser QA *(Next Up)*
- [ ] **Google Cloud Console OAuth Setup:** Add `http://localhost:3000` (Authorized JS Origin) and `http://localhost:4000/api/auth/google/callback` (Authorized Redirect URI) + add test Gmail accounts under Audience
- [ ] **Auth End-to-End Live Test:** Verify full Register -> Gmail OTP arrival -> Verify -> Login -> Forgot Password -> Google OAuth callback in real browser
- [ ] **Planner & Results Live QA:** Test natural Banglish/English queries, What-If budget slider movement, filters/sorting, and Save Trip persistence
- [ ] **Day Plan, Compare & Shared Link Live QA:** Test `/compare` radar chart + slider, `/itinerary` PDF download + 30-day link generation, and `/plan/[shareId]` logged-out access
- [ ] **Admin Live QA:** Test Admin login, edit destination rate via slide-over drawer (`PUT /api/admin/destinations/:id`), verify DB update persists on reload, and test bulk JSON upload

### Phase 6: Security Hardening, Responsive Polish & Edge Cases
- [ ] Run mobile viewport responsive audit (`375px` width) across Landing, Navbar drawer, Results filters, Compare table, and Admin table
- [ ] Verify `@nestjs/throttler` or rate-limit protection on OTP resend / auth / AI endpoints
- [ ] Add user-friendly toast/inline feedback when API server is offline or rate-limited (`apps/web/src/lib/api.ts`)
- [ ] Audit Leaflet map markers, dynamic page meta titles, and custom `404` / error boundaries across routes

### Phase 7: Production Deployment & Capstone Evaluation Readiness
- [ ] Prepare production environment configs for Backend (Render/Railway/Fly) and Frontend (Vercel) + update CORS `WEB_ORIGIN` and `NEXT_PUBLIC_API_URL`
- [ ] Register production Google OAuth callback URL (`https://<api-domain>/api/auth/google/callback`)
- [ ] Add automated Playwright E2E smoke test script covering core capstone grading flows (`Khulna 10k 2-person` query, PDF export, Admin edit)
- [ ] Update root `README.md` with clear local setup, test commands, architecture overview, and team credits

---

## Active Collaboration Board

| Task / Area | Owner | Branch | Status | Notes |
|---|---|---|---|---|
| Phases 0 – 4 (Core Monorepo, API, Seed, Stitch Frontend) | Rifat + Agent | `main` | `[x]` Done | Verify locally with `npm run dev:api` & `npm run dev:web` |
| Phase 5 (Google Console URIs + Live E2E Browser QA) | Unassigned | — | `[ ]` Open | Coordinate here before claiming |
| Phase 6 (Mobile 375px Audit & API Rate Limits) | Unassigned | — | `[ ]` Open | Available for collaborator |
| Phase 7 (Deployment & Final README) | Unassigned | — | `[ ]` Open | Target after Phase 5 & 6 pass |

---

## Collaboration Activity Log

| Date | Commit / Ref | Author / Agent | Summary of Changes |
|---|---|---|---|
| 2026-11-26 | `main` | Rifat + Agent | Routed Navbar `Get started` button to `/register` and rebuilt `/login` & `/register` (with Step 2 Vibes/Budget Preferences) to exact Stitch `02_login`, `03_register_1`, and `04_register_2` visual layouts |
| 2026-11-26 | `fbbb6f1` | Rifat + Agent | Cleared hardcoded pre-filled prompts on Hero `/` & `/plan` + ran Wikimedia photo downloader (64/64 districts downloaded) |
| 2026-11-26 | `704d771` | Rifat + Agent | Replaced visible `"itinerary"` UI copy with plain English (`Trip Plan`, `Day Plan`); verified clean build (15/15 routes) |
| 2026-11-26 | `1f58902` | Rifat + Agent | Switched `vromon_logo.png` to standalone horizontal rendering (removed circle crop and duplicate `VROMON` text) |
| 2026-11-26 | `03f160a` | Rifat + Agent | Self-hosted `Inter` font via `next/font/google` (fixing serif fallback) and floated landing navbar cleanly over hero gradient |
| 2026-11-26 | `02572ee` | Rifat + Agent | Enforced Inter-only typography and exact Prompt 0 desktop/mobile/admin/navbar type scale across all pages |
| 2026-11-26 | `f9b91e1` | Rifat + Agent | Rebuilt all 16 frontend screens faithfully to Google Stitch Bengal Verve design |
| 2026-11-25 | `d8f7839` | Rifat + Agent | Initialized full-stack monorepo (`@vromon/shared`, NestJS `apps/api`, Next.js `apps/web`) and seeded Neon PostgreSQL |
