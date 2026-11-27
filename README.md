<div align="center">
  <img src="./vromon_logo.png" alt="VROMON Logo" width="280" />

  <h1>VROMON — Bangladesh Smart Trip Feasibility & Risk-Aware Travel Recommender</h1>

  <p>
    <strong>Deterministic Travel Cost Math + Seasonal Crowd & Weather Intelligence + Grounded Gemini AI</strong>
  </p>

  <p>
    <a href="#key-features">Key Features</a> •
    <a href="#system-architecture">Architecture</a> •
    <a href="#scoring--feasibility-engine">Scoring & Math</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#monorepo-structure">Project Structure</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#api-overview">API Reference</a> •
    <a href="#team--academic-context">Team</a>
  </p>
</div>

---

## Overview

**VROMON** is a full-stack travel feasibility and destination recommendation platform purpose-built for domestic travel across all **64 districts (8 divisions) of Bangladesh**.

Unlike generic travel directories that rely only on rigid filters or general-purpose AI chatbots that hallucinate transit fares and hotel rates, VROMON combines **natural-language semantic understanding** (English, Bangla, and Banglish) with a **100% deterministic mathematical calculation engine**. Users describe their ideal trip in everyday words—alongside budget, headcount, duration, travel month, and starting hub—and VROMON evaluates verified routes, accommodation tiers, daily food expenses, usable daylight hours, seasonal weather ratings, and crowd levels in seconds.

---

## Key Features

- **Natural-Language Trip Studio:** Accepts free-text prompts in English or Banglish (e.g., *"quiet hill place with tea gardens, good in winter, under 15,000 taka for two people"*) and extracts structured intent, mood, tags, and constraints via Zod-validated Gemini structured outputs.
- **Verified 64-District Knowledge Base:** Backed by a curated PostgreSQL dataset covering **70 destinations**, **266 attractions**, **359 multi-modal transport routes** (`Bus`, `Train`, `Launch`), **840 monthly climate & crowd records**, and pre-computed **768-dimensional semantic embeddings**.
- **6-Factor Multi-Dimensional Ranking:** Computes an explainable `0–100` match score combining Semantic Meaning (`30%`), Budget Fit (`20%`), Interest Match (`15%`), Weather Suitability (`15%`), Available Time (`10%`), and Crowd Comfort (`10%`).
- **Deterministic Fair-Price Cost Calculator:** Itemizes round-trip fares, twin-share room nights, daily meals, local entry fees, and a `10%` contingency buffer—classifying trips into `Fits`, `Tight`, `Over budget`, or `Discard`. The LLM never invents or alters any number.
- **Instant Client-Side What-If Budget Slider:** Recalculates budget feasibility and composite scores in `< 1ms` directly in the browser without waiting for a new API round-trip.
- **Smart Alternative Escapes:** Automatically suggests semantically similar, lower-cost or calmer destinations whenever a top match exceeds budget, transit limits, or peak holiday crowd thresholds.
- **Side-by-Side Comparison Matrix & Radar Overlay:** Compares up to 3 destinations simultaneously across cost, transit duration, usable hours, climate, crowd calm, and interactive Recharts radar visualizations.
- **Grounded Day-by-Day Trip Plans, PDF Export & 30-Day Share Links:** Generates realistic daily schedules strictly from stored database attractions within usable daylight hours, with one-click `jsPDF` export and privacy-safe 30-day read-only shareable URLs.
- **Dual Authentication & Admin Console:** Supports Email/Password registration with **6-digit Gmail SMTP OTP verification**, password recovery, **Google OAuth 2.0**, saved user trips, and a role-protected **Admin Operations Console** with live telemetry charts, slide-over destination rate editing, and batch JSON catalog import.
- **Fail-Safe Offline & LLM Fallback Resilience:** Includes a deterministic template fallback when external AI APIs time out or hit rate limits, plus live offline detection banners and graceful error boundaries.

---

## System Architecture

```mermaid
flowchart TD
    subgraph Client["Next.js 14 Web App — apps/web (Port 3000)"]
        Pages["16+ Stitch Bengal Verve Screens"]
        Slider["Instant <1ms What-If Slider (@vromon/shared)"]
        Visuals["Recharts Analytics + Leaflet Maps + jsPDF"]
    end

    subgraph Shared["Shared TypeScript Workspace — packages/shared"]
        Calc["Pure Feasibility & Scoring Calculators"]
        Schemas["Shared Zod Schemas & Type Contracts"]
    end

    subgraph Server["NestJS 10 API Server — apps/api (Port 4000, /api)"]
        Controllers["REST Controllers + Zod Validation Pipes"]
        AuthMod["Passport JWT + Google OAuth 2.0 + Role Guards"]
        MailMod["Nodemailer Gmail SMTP (6-Digit OTP)"]
        RecMod["Multi-Factor Recommendation & Trip Plan Engine"]
        AiMod["LangChain JS + Gemini + Deterministic Fallback"]
        AdminMod["Admin Telemetry, Live Editor & Bulk JSON Import"]
    end

    subgraph Data["External Infrastructure & Data"]
        NeonDB[("Neon Serverless PostgreSQL + Prisma 5")]
        Gemini["Google Gemini API (Flash + 768-d Embeddings)"]
        GoogleOAuth["Google Cloud OAuth 2.0"]
    end

    Pages -->|REST + Bearer JWT| Controllers
    Slider --> Calc
    RecMod --> Calc
    Controllers --> Schemas
    Controllers --> AuthMod
    AuthMod --> GoogleOAuth
    AuthMod --> MailMod
    Controllers --> RecMod
    Controllers --> AdminMod
    RecMod --> AiMod
    AiMod --> Gemini
    RecMod --> NeonDB
    AdminMod --> NeonDB
```

---

## Scoring & Feasibility Engine

All numerical evaluations live in [`packages/shared/src/calculators/index.ts`](./packages/shared/src/calculators/index.ts) and are covered by automated unit tests:

### 1. Six-Factor Weighted Match Score (`0–100`)

| Factor | Weight | Calculation Logic |
|---|---|---|
| **Meaning Match** | `30%` | Cosine similarity between user prompt embedding and destination's 768-d vector |
| **Budget Fit** | `20%` | `100` when `Total Cost <= Budget`; scales linearly down to `0` at `25%` over budget |
| **Interest Match** | `15%` | Overlap ratio between AI-extracted intent tags and verified destination tags |
| **Weather Fit** | `15%` | Normalized from stored monthly weather suitability rating (`1–5`) for chosen month |
| **Time Fit** | `10%` | Ratio of usable destination hours against `min_hours_needed` (rejected if insufficient) |
| **Crowd Fit** | `10%` | `Low = 100`, `Medium = 60`, `High = 20` (automatically steps up one tier on holidays/weekends) |

### 2. Deterministic Cost & Time Formulas

- **Usable Daylight Hours:**
  $$\text{Usable Hours} = (\text{Days} \times 12) - (2 \times \text{One-Way Transit Hours})$$
- **Total Group Trip Cost (BDT):**
  $$\text{Subtotal} = (2 \times \text{Fare} \times \text{Travelers}) + (\lceil \text{Travelers} / 2 \rceil \times \max(0, \text{Days} - 1) \times \text{Room Rate}) + (\text{Travelers} \times \text{Days} \times \text{Daily Food}) + (\text{Travelers} \times \text{Local Fees})$$
  $$\text{Total Cost} = \text{Subtotal} + 0.10 \times \text{Subtotal}$$
- **Feasibility Tiers:**
  - `Fits`: $\text{Total Cost} \le \text{Budget}$
  - `Tight`: $\text{Budget} < \text{Total Cost} \le 1.10 \times \text{Budget}$
  - `Over budget`: $1.10 \times \text{Budget} < \text{Total Cost} \le 1.25 \times \text{Budget}$
  - `Discard`: $\text{Total Cost} > 1.25 \times \text{Budget}$

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Monorepo & Language** | `npm workspaces`, TypeScript `5.6` |
| **Frontend (`apps/web`)** | Next.js `14.2` (App Router), React `18`, Tailwind CSS `3.4`, Self-Hosted `Inter` Typography, Lucide Icons, Recharts, React-Leaflet / Leaflet, `jsPDF` |
| **Design System** | Google Stitch *Bengal Verve* Theme (`#E5F0E0`, `#2F6B2F`, `#145219`, `#FFCB3D`, `#1F2A1F`) |
| **Backend (`apps/api`)** | NestJS `10.4`, Prisma ORM `5.22`, Passport (`passport-jwt`, `passport-google-oauth20`), `bcryptjs`, Nodemailer, `xlsx`, Zod |
| **AI & Vector Search** | LangChain JS (`@langchain/google-genai`, `@langchain/core`), `@google/genai` (`gemini-3-flash-preview` + `gemini-embedding-001` 768-d vectors) |
| **Database** | Neon Serverless PostgreSQL |
| **Testing & Quality** | Jest `29`, `ts-jest`, Next.js ESLint (`core-web-vitals`), TypeScript strict builds |

---

## Monorepo Structure

```text
VROMON/
├── apps/
│   ├── api/                        # NestJS 10 REST API (Port 4000, prefix /api)
│   │   ├── prisma/                 # Prisma schema & 64-district Excel seed script
│   │   └── src/
│   │       ├── admin/              # Platform telemetry, destination editor & bulk JSON import
│   │       ├── ai/                 # LangChain + Gemini structured intent & grounded writer
│   │       ├── auth/               # Register, 6-digit OTP, JWT, Google OAuth, Reset Password
│   │       ├── database/           # PrismaService lifecycle module
│   │       ├── destinations/       # 64-district catalog & metadata endpoints
│   │       ├── itineraries/        # Grounded day-by-day trip plan scheduler
│   │       ├── mail/               # Nodemailer Gmail SMTP OTP delivery
│   │       ├── recommendations/    # Multi-factor ranking & alternative destination engine
│   │       ├── shared-plans/       # 30-day ephemeral read-only shared trip plans
│   │       └── trips/              # Authenticated user saved trips CRUD
│   └── web/                        # Next.js 14 App Router Frontend (Port 3000)
│       ├── public/                 # Brand assets (vromon_logo.png)
│       └── src/
│           ├── app/                # 15+ routes (/, /plan, /results, /destinations/[id], /compare, /itinerary, /trips, /profile, /admin, auth flows)
│           ├── components/         # Navbar, Footer, DestinationMap, ClimateChart, CostChart, ScoreRing, OfflineBanner, AuthStatusBanners
│           ├── context/            # AuthContext & session persistence
│           └── lib/                # Typed API client with automatic JWT & 401 handling
├── packages/
│   └── shared/                     # @vromon/shared pure math calculators, constants & Zod schemas
├── Diagrams/                       # Architecture & system design diagrams
├── VROMON_64_Districts_Dataset.xlsx# Authoritative 64-district dataset workbook
├── download_photos.py              # Wikimedia Commons CC-licensed landscape photo fetcher
├── PROJECT_PLAN.md                 # Detailed technical specification
├── roadmap.md                      # Phased progress tracker & multi-agent collaboration rules
└── .env.example                    # Environment variable template
```

---

## Getting Started

### Prerequisites

- **Node.js** `>= 18.18` (LTS `20.x` recommended)
- **npm** `>= 9.x` (this workspace uses **`npm`** exclusively)
- A **PostgreSQL** database URL (e.g., [Neon](https://neon.tech))
- **Google Gemini API Key** (optional for local offline fallback, required for live semantic/LLM calls)
- **Gmail App Password** (for OTP emails) and **Google Cloud OAuth 2.0 Credentials** (for Google Sign-In)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/mahmudul194/VROMON.git
cd VROMON
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` in the repository root and fill in your credentials:

```bash
cp .env.example .env
```

Key variables inside `.env`:

```env
# PostgreSQL (Neon)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://user:password@host/dbname?sslmode=require"

# API & Web Origins
PORT=4000
WEB_ORIGIN="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:4000/api"

# JWT Secrets
JWT_ACCESS_SECRET="replace-with-strong-secret"
JWT_REFRESH_SECRET="replace-with-strong-secret"

# Google OAuth 2.0 (Authorized JS Origin: http://localhost:3000)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:4000/api/auth/google/callback"

# Gmail SMTP for 6-Digit OTPs
MAIL_HOST="smtp.gmail.com"
MAIL_PORT=465
MAIL_USER="your-email@gmail.com"
MAIL_PASS="your-16-char-gmail-app-password"
MAIL_FROM="VROMON <your-email@gmail.com>"

# Gemini AI
GOOGLE_API_KEY="your-gemini-api-key"
LLM_MODEL="gemini-3-flash-preview"
EMBEDDING_MODEL="gemini-embedding-001"
```

### 3. Build Shared Package, Push Schema & Seed Database

```bash
npm run build:shared
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### 4. Run in Development Mode

Open two terminals from the repository root:

```bash
# Terminal 1 — Start NestJS API on http://localhost:4000/api
npm run dev:api

# Terminal 2 — Start Next.js Web App on http://localhost:3000
npm run dev:web
```

---

## Testing & Verification Commands

Run the full verification suite from the root directory before merging any branch into `main`:

```bash
# Unit tests for deterministic math & scoring calculators (@vromon/shared)
npm run test:shared

# Backend recommendation benchmark tests (@vromon/api)
npm run test:api

# Automated live end-to-end Capstone smoke suite (Auth, AI, Trips, Share, Admin, Throttler)
npm run test:e2e

# Frontend ESLint validation
npm run lint --workspace=apps/web

# Full monorepo production build (shared -> api -> web)
npm run build
```

---

## API Overview

All backend routes are served under `http://localhost:4000/api`:

| Module | Method & Endpoint | Access | Description |
|---|---|---|---|
| **Health** | `GET /api/health` | Public | Service & database readiness probe |
| **Auth** | `POST /api/auth/register` | Public | Create account & dispatch 6-digit email OTP |
| **Auth** | `POST /api/auth/verify-otp` | Public | Activate account & issue JWT access token |
| **Auth** | `POST /api/auth/login` | Public | Authenticate via email & password |
| **Auth** | `GET /api/auth/google` | Public | Initiate Google OAuth 2.0 login flow |
| **Auth** | `POST /api/auth/forgot-password` | Public | Send 6-digit password recovery OTP |
| **Auth** | `POST /api/auth/reset-password` | Public | Verify recovery OTP & update password |
| **Auth** | `GET /api/auth/me` / `PATCH /api/auth/profile` | JWT | Inspect or update user profile & defaults |
| **Catalog** | `GET /api/destinations` / `GET /api/destinations/:id` | Public | List all destinations or inspect full 12-month & transit breakdown |
| **Recommend** | `POST /api/recommendations` | Public | Run semantic + 6-factor feasibility evaluation |
| **Trip Plan** | `POST /api/itineraries/generate` | Public | Generate grounded day-by-day schedule from stored attractions |
| **Sharing** | `POST /api/shared-plans` / `GET /api/shared-plans/:shareId` | Public | Create or view 30-day ephemeral read-only trip plan |
| **Trips** | `GET /api/trips` / `POST /api/trips` / `DELETE /api/trips/:id` | JWT | Manage saved personal trip evaluations |
| **Admin** | `GET /api/admin/stats` | Admin | View platform KPIs, query logs & import history |
| **Admin** | `PUT /api/admin/destinations/:id` / `POST /api/admin/destinations/bulk` | Admin | Update district cost parameters or batch-upsert JSON records |

---

## Collaboration Workflow

Team members and AI coding agents coordinate via [`roadmap.md`](./roadmap.md):

1. Pull latest `main` before starting work (`git pull origin main`).
2. Work on your dedicated contributor branch (`rifat` or `wasif`), push to `origin/<branch>`, and run all test/lint/build gates.
3. Update checkboxes and the **Collaboration Activity Log** inside [`roadmap.md`](./roadmap.md) before merging cleanly into `main`.

---

## Team & Academic Context

Developed as part of the **SE331 — Software Engineering Design Capstone Project** (Fall 2026, Batch 41, Section A2, **Group 6**) at **Daffodil International University (DIU)**.

| Name | Student ID | Focus Areas |
|---|---|---|
| **Md. Mahmudul Hoque Rifat** | `232-35-194` | Architecture, NestJS API, Gemini AI & Shared Calculators, Core Stitch UI |
| **Azwad Wasif Bin Kabir Nuhan** | `232-35-045` | Frontend Polish, Stitch Utility/State/Mobile Screens, Dataset & QA |

**Course Teacher:** Farhan Tanvir, Lecturer, Department of Software Engineering, Daffodil International University.

---

## Advisory Disclaimer

All transport fares, room rates, meal estimates, weather ratings, and crowd levels in VROMON are curated regional estimates in Bangladeshi Taka (`BDT`) intended for trip feasibility planning. Travelers should verify live ticket schedules, road conditions, and local advisories prior to departure.
