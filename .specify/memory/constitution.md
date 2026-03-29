<!--
SYNC IMPACT REPORT
==================
Version change: [unversioned template] → 1.0.0
Modified principles: N/A (initial population)
Added sections:
  - Core Principles (I–X, all new)
  - Technology Stack
  - Development Workflow
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md  ✅ aligned (Constitution Check section present; no changes required)
  - .specify/templates/spec-template.md  ✅ aligned (no constitution-specific constraints missing)
  - .specify/templates/tasks-template.md ✅ aligned (task categories match; web-app path conventions apply)
Follow-up TODOs:
  - TODO(RATIFICATION_DATE): Using 2026-03-29 (today) as ratification date — update if project predates this.
-->

# LiterRater Constitution

## Core Principles

### I. TypeScript Strict Mode

All TypeScript code MUST be compiled with `strict: true` in `tsconfig.json`.
The `any` type is FORBIDDEN. Use `unknown` with explicit type guards instead.
Type assertions (`as T`) MUST be accompanied by a comment justifying why a guard
is insufficient. Implicit `any` from untyped third-party packages MUST be wrapped
in typed adapter modules.

**Rationale**: Strict typing surfaces bugs at compile time and prevents silent
runtime failures that are common in loosely typed codebases.

### II. Frontend Stack — Webpack + React 18 SPA

The frontend MUST be a Single Page Application bundled with Webpack.
React 18 is the required version. Server-Side Rendering (SSR) is FORBIDDEN
on the frontend. File-based routing (e.g., Next.js `pages/` or `app/` directories
driving the frontend) MUST NOT be used — routing MUST be handled by a client-side
router (e.g., React Router).

**Rationale**: A Webpack-bundled SPA gives full control over the build pipeline and
keeps the frontend cleanly decoupled from the backend framework.

### III. UI Components — shadcn/ui Only

All UI primitives (buttons, inputs, modals, cards, etc.) MUST come from the
shadcn/ui component library. Custom primitive components (e.g., hand-rolled
`<Button>` or `<Input>`) are FORBIDDEN. Composition of shadcn/ui primitives into
feature-level components is permitted and encouraged.

**Rationale**: Using a single component system enforces visual consistency and
eliminates duplicated accessibility logic across the codebase.

### IV. Backend API — Co-located Next.js API Routes

The backend API MUST live within the same repository as the frontend.
Next.js API routes (`pages/api/` or `app/api/`) MUST be used for all server-side
endpoints. The Next.js layer is strictly a backend API — its SSR and file-based
page routing features MUST NOT be used to serve frontend views.

**Rationale**: Co-location reduces cross-repo coordination overhead while keeping a
clean boundary between the React SPA (Webpack) and the API layer (Next.js).

### V. Database — MySQL + Mikro-ORM

MySQL MUST be the sole relational database. All database access MUST go through
Mikro-ORM entities and repositories — raw SQL queries are FORBIDDEN except for
migrations or performance-critical queries that MUST be documented. All
database-mutating operations MUST be wrapped in explicit Mikro-ORM transactions.
Schema changes MUST be managed via Mikro-ORM migrations.

**Rationale**: An ORM enforces a consistent data model and prevents SQL injection;
explicit transactions protect data integrity.

### VI. Functional React — Hooks Only

All React components MUST be function components using hooks. Class components
are FORBIDDEN. Component state MUST use `useState`, `useReducer`, or a
state-management library built on hooks. `React.Component` and
`React.PureComponent` MUST NOT appear anywhere in the codebase.

**Rationale**: Function components with hooks are the current React idiom;
class components introduce lifecycle complexity and resist composition patterns.

### VII. Testing — Jest + React Testing Library

Unit and component tests MUST use Jest as the test runner and React Testing
Library (RTL) for rendering and querying React components. `enzyme` and
direct DOM manipulation in tests are FORBIDDEN. Tests MUST assert on
user-visible behavior, not implementation details (internal state, refs,
or private methods). Coverage gates MUST be enforced in CI.

**Rationale**: RTL encourages tests that mirror real user interactions, making
refactors less likely to break the test suite unnecessarily.

### VIII. Simplicity First — YAGNI

Abstractions MUST NOT be introduced until they are needed by at least two
concrete use cases in production code. Premature generalization, over-engineering,
and speculative features are FORBIDDEN. When two valid implementations exist,
the simpler one MUST be chosen unless a measurable requirement justifies
the complexity. Every abstraction MUST be justifiable by a present, not future,
requirement.

**Rationale**: Accidental complexity is the primary driver of maintenance burden;
YAGNI keeps the codebase navigable as it grows.

### IX. Containerization — Docker

The application (frontend build + Next.js API) and the MySQL database MUST each
run in separate Docker containers orchestrated via `docker-compose`. A single
`docker compose up` command MUST bring the full local development environment to
a working state. Production images MUST use multi-stage builds to minimize image
size. Container configuration MUST be committed to the repository.

**Rationale**: Containerization eliminates "works on my machine" discrepancies and
provides a reproducible environment for development, CI, and production.

## Technology Stack

Summary of mandatory technology choices:

| Layer | Technology |
|---|---|
| Language | TypeScript 5.x (strict mode) |
| Frontend bundler | Webpack 5 |
| Frontend framework | React 18 |
| UI components | shadcn/ui |
| Client-side routing | React Router (or equivalent hooks-based router) |
| Backend framework | Next.js (API routes only — no SSR, no page routing) |
| ORM | Mikro-ORM |
| Database | MySQL 8 |
| Testing | Jest + React Testing Library |
| Containerization | Docker + docker-compose |

Introducing a technology not listed above requires a constitution amendment.

## Development Workflow

- All features begin with a spec (`/speckit.specify`) before any implementation.
- The `docker compose up` command MUST succeed on a fresh clone before any PR
  is merged.
- TypeScript compilation (`tsc --noEmit`) MUST pass with zero errors in CI.
- All new React components MUST have at least one RTL test covering the primary
  user interaction.
- Database schema changes MUST include a Mikro-ORM migration file.
- PRs MUST NOT introduce `any` types, class components, custom UI primitives,
  or raw SQL outside migrations.

## Governance

This constitution supersedes all other project conventions. Any practice not
addressed here defaults to the simplest reasonable approach consistent with the
principles above.

**Amendment procedure**: Amendments require updating this file, incrementing the
version (MAJOR for removals/redefinitions, MINOR for additions, PATCH for
clarifications), and propagating changes to dependent templates via
`/speckit.constitution`.

**Compliance review**: Every PR MUST be reviewed against the Constitution Check
section of the relevant `plan.md`. Violations MUST be documented in the
Complexity Tracking table with justification.

**Version policy**: Semantic versioning — `MAJOR.MINOR.PATCH`.

**Version**: 1.0.0 | **Ratified**: 2026-03-29 | **Last Amended**: 2026-03-29
