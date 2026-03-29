# Implementation Plan: LiterRater — Social Book Cataloging Platform

**Branch**: `001-social-book-platform` | **Date**: 2026-03-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-social-book-platform/spec.md`

## Summary

LiterRater is a Letterboxd-style social book cataloging platform where users track
reading, rate and review books, create curated lists, follow other readers, and
discover books through social activity. The core product loop is:
Discover → Log → Rate → Review → Share → Feed → More Discovery.

The technical approach uses a co-located monorepo with a Webpack-bundled React 18 SPA
for the frontend (client-side routing via React Router, all UI via shadcn/ui) and a
Next.js backend serving REST API routes exclusively (no SSR, no page routing). MySQL 8
with Mikro-ORM handles persistence. All services are containerised with Docker Compose.
The platform is GDPR-compliant and scoped to 1,000 users at MVP.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode — `any` forbidden throughout)
**Primary Dependencies**: React 18, Webpack 5, shadcn/ui, React Router 6, Next.js
(API routes only), Mikro-ORM 6, bcrypt
**Storage**: MySQL 8 via Mikro-ORM entities and migrations
**Testing**: Jest + React Testing Library (frontend); Jest (backend)
**Target Platform**: Docker-containerised Linux; mobile-responsive web
**Project Type**: Web application — React 18 SPA (frontend) + Next.js REST API (backend)
**Performance Goals**: Search <2s p95; activity feed <3s first page; book-log flow <10s
**Constraints**: GDPR compliance (right to erasure, data export, cookie consent); no
SSR; no file-based routing on frontend; no `any` types; up to 1,000 users MVP
**Scale/Scope**: MVP — 1,000 registered users, hundreds of books in admin-curated catalog

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | TypeScript strict mode, no `any` | ✅ Pass | Both `frontend/` and `backend/` enforce `strict: true`; adapters wrap untyped packages |
| II | Webpack + React 18 SPA (no SSR, no file-based routing) | ✅ Pass | `frontend/` is a standalone Webpack build; React Router handles all routing |
| III | shadcn/ui only — no custom primitives | ✅ Pass | All UI via shadcn/ui; feature components compose primitives, never replace them |
| IV | Next.js API routes only — no SSR, no page routing | ✅ Pass | `backend/pages/api/` used exclusively; no `pages/` views exist |
| V | MySQL 8 + Mikro-ORM, explicit transactions | ✅ Pass | All DB access through entities/repositories; Mikro-ORM migrations own schema |
| VI | Functional React + hooks only | ✅ Pass | No class components; state via `useState`/`useReducer` |
| VII | Jest + React Testing Library | ✅ Pass | Frontend uses RTL; backend uses Jest for API/service unit tests |
| VIII | YAGNI — no premature abstraction | ✅ Pass | Minimal structure for MVP; no shared packages layer, no event bus |
| IX | Docker + docker-compose | ✅ Pass | Three containers: frontend (:3000), backend (:3001), MySQL (:3306) |
| X | Branch-per-task before implementation | ✅ Pass | Branch `001-social-book-platform` created at spec time |

**All gates pass. No violations.**

## Project Structure

### Documentation (this feature)

```text
specs/001-social-book-platform/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # Phase 1 output — REST API contracts
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/          # Feature-level components (composed from shadcn/ui primitives)
│   ├── pages/               # React Router page components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # Typed API client (fetch wrappers)
│   └── types/               # Shared TypeScript interfaces
├── tests/
│   └── unit/
├── webpack.config.ts
└── tsconfig.json            # strict: true

backend/
├── pages/
│   └── api/                 # Next.js API route handlers (ONLY Next.js feature used)
│       ├── auth/
│       ├── books/
│       ├── users/
│       ├── reviews/
│       ├── ratings/
│       ├── lists/
│       ├── feed/
│       └── admin/
├── src/
│   ├── entities/            # Mikro-ORM entity classes
│   ├── repositories/        # Custom Mikro-ORM repositories
│   ├── services/            # Business logic (auth, feed, GDPR export, etc.)
│   └── middleware/          # Auth guards, role checks, cookie consent
├── migrations/              # Mikro-ORM migration files
├── tests/
│   └── unit/
├── mikro-orm.config.ts
└── tsconfig.json            # strict: true

docker/
├── Dockerfile.frontend      # Multi-stage: build (Webpack) → serve (nginx)
├── Dockerfile.backend       # Multi-stage: deps → Next.js production build
└── docker-compose.yml       # frontend, backend, db services
```

**Structure Decision**: Web application layout with `frontend/` and `backend/` as
separate build targets in the same repo. No shared `packages/` layer — simplest
valid structure for a 1,000-user MVP per YAGNI principle. Types duplicated in
`frontend/src/types/` from the API contracts; no runtime cross-package dependency.

## Complexity Tracking

> No constitution violations — table not required.
