# Research: LiterRater — Social Book Cataloging Platform

**Branch**: `001-social-book-platform`
**Date**: 2026-03-29
**Status**: Complete — all NEEDS CLARIFICATION resolved

## Summary

All technology choices are fully resolved from the project constitution and the clarification session. No open questions remain. The decisions below reflect choices appropriate for the confirmed scale (up to 1,000 users, hundreds of books) and compliance requirements (GDPR), favouring simplicity and avoiding infrastructure overhead that would not pay for itself at this scale.

## Architectural Decisions

### 1. Book Search Strategy

**Decision**: MySQL 8 full-text search (`FULLTEXT` index on title/author columns).

**Rationale**: The catalog is small (hundreds of books). Full-text search built into the existing MySQL instance is sufficient to deliver fast, relevant results without standing up additional infrastructure. No operational overhead, no extra cost, and no added complexity in deployment.

**Alternatives considered**:
- **Elasticsearch** — powerful ranking and fuzzy matching, but requires a separate cluster, adds operational burden, and is overkill at this catalog size.
- **Algolia** — excellent hosted search with a generous free tier, but introduces an external SaaS dependency and data-sync complexity that is unnecessary for hundreds of records.

---

### 2. Activity Feed Approach

**Decision**: Pull-based fan-out on read — the feed is computed at request time via a JOIN query over the follows graph.

**Rationale**: At 1,000 users where each user follows at most a few hundred others, a single SQL query per feed page load is fast and simple. No background workers, no message queue, and no pre-computed feed tables are needed. The query complexity scales linearly with follow count, which remains tractable at this scale.

**Alternatives considered**:
- **Push / pre-computed fan-out** — writes activity to every follower's feed table on creation; improves read latency but introduces write amplification, a background worker, and a fan-out table. Not justified for 1,000 users.
- **Message queue (e.g. Redis Streams, RabbitMQ)** — enables async processing but adds infrastructure that is disproportionate to the scale requirements.

---

### 3. Session / Auth Strategy

**Decision**: JWT stored in an `httpOnly`, `Secure`, `SameSite=Strict` cookie, issued and validated by Next.js API routes.

**Rationale**: Storing the token in an httpOnly cookie prevents JavaScript-accessible XSS token theft entirely. `SameSite=Strict` provides strong CSRF protection without requiring a separate CSRF token mechanism. This approach works naturally with Next.js API route middleware and requires no server-side session store, keeping the infrastructure footprint minimal.

**Alternatives considered**:
- **localStorage JWT** — simple to implement but exposes the token to any JavaScript running on the page, making XSS attacks directly exploitable. Rejected for security reasons.
- **Server-side sessions (e.g. express-session + Redis)** — provides easy revocation but requires a session store, adding operational complexity. At 1,000 users, stateless JWTs with a short expiry are acceptable.

---

### 4. Book Cover Images

**Decision**: Admin-supplied external URLs stored as strings; no file upload or blob storage.

**Rationale**: Eliminates the need for S3 (or equivalent) blob storage, a CDN, and upload validation pipelines for the MVP. Admins can reference publicly available images from open CDNs such as the OpenLibrary Covers API. This keeps the data model simple (a single URL column) and removes an entire infrastructure dependency.

**Alternatives considered**:
- **File upload to S3 / object storage** — gives full control over image availability and CDN caching, but adds significant infrastructure complexity (IAM, presigned URLs, upload handling) that is not warranted at MVP scale.
- **Base64 in database** — avoids external storage but bloats the database with binary data and is unsuitable for production use.

---

### 5. GDPR Data Export Format

**Decision**: JSON.

**Rationale**: JSON is machine-readable and naturally represents nested relational data (e.g. a user record containing their reading entries, reviews, and follows) in a single file. It is easy to generate from ORM entity graphs, easy for users to inspect, and straightforward for third-party tools to consume. Satisfies the GDPR Article 20 data portability requirement.

**Alternatives considered**:
- **CSV** — familiar to non-technical users but requires flattening nested data into multiple files or losing relational context. Not suitable for a data model with one-to-many relationships.
- **XML** — supports nesting but is verbose, harder to consume programmatically than JSON, and carries no meaningful advantage for this use case.

---

### 6. Monorepo Structure

**Decision**: Single repository with `frontend/` and `backend/` subdirectories.

**Rationale**: The project constitution mandates co-location of frontend and backend code. Two clearly separated subdirectories give clean build boundaries (each has its own `package.json`, `tsconfig.json`, and toolchain) without requiring a shared packages workspace, which would add complexity unnecessary for MVP. A single repo also simplifies CI configuration and keeps history unified.

**Alternatives considered**:
- **Separate repositories** — maximises team autonomy and deployment independence, but adds friction for cross-cutting changes (e.g. shared types) and contradicts the constitution's co-location requirement.
- **Next.js for both frontend and backend** — would unify the toolchain but couples the SPA (React Router 6, Webpack 5, no SSR) to Next.js conventions in ways that conflict with the architecture. The current design uses Next.js for API routes only.
- **Shared `packages/` workspace** — appropriate when shared libraries are needed; not warranted for MVP where the only cross-boundary contract is the HTTP API.

---

### 7. Admin Auth

**Decision**: `role` enum column on the `User` entity (`user` | `admin`), enforced by a middleware guard on all `/api/admin/*` routes.

**Rationale**: The system has exactly two roles. A single column on the existing `User` entity is the simplest correct implementation. The middleware guard centralises the check and protects all admin endpoints uniformly. No additional tables, services, or tokens are required.

**Alternatives considered**:
- **Separate admin service** — appropriate when admin functionality is a distinct bounded context with its own scaling requirements. Unnecessary at this scale; adds deployment complexity.
- **Separate admin user table** — avoids polluting the user table with role data but requires joins for any operation that needs to check role. Adds schema complexity with no benefit for a two-role system.

---

### 8. Password Hashing

**Decision**: bcrypt with cost factor 12.

**Rationale**: bcrypt is well-understood, battle-tested, and has mature Node.js support (`bcryptjs` / `bcrypt`). Cost factor 12 provides strong resistance to brute-force attacks while keeping login latency acceptable (roughly 250–400 ms on modest hardware). Appropriate for an MVP at this scale.

**Alternatives considered**:
- **argon2** — the current OWASP recommendation and marginally stronger than bcrypt (wins on memory-hardness), but adds a native module dependency (`argon2` requires compilation) and more complex configuration. The marginal security gain does not justify the added complexity for MVP.
- **PBKDF2** — built into Node.js `crypto` without native modules, but requires careful configuration of iteration count and is less ergonomic than bcrypt for this use case.

---

## Resolved Unknowns

The following questions were open at the start of the specification phase and were resolved during the clarification session:

- **Book catalog source** — Manual admin curation; no third-party ISBN or publisher API integration.
- **ReadingEntry mutability** — Reading entries (status, progress, dates) are fully mutable after creation; no immutable audit log required.
- **Compliance** — GDPR compliance is required, including data export (Article 20) and account deletion (Article 17).
- **Scale** — Up to 1,000 users and hundreds of books; architecture decisions are calibrated to this ceiling.
- **Admin scope** — Admins manage the book catalog (create, edit, delete) and perform basic user management (view, deactivate); no content moderation tooling required at MVP.
