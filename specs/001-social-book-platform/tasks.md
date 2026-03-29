---
description: "Task list for LiterRater social book cataloging platform"
---

# Tasks: LiterRater — Social Book Cataloging Platform

**Input**: Design documents from `/specs/001-social-book-platform/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅

**Tests**: Included — constitution mandates Jest + RTL tests for all React components.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Paths are relative to repository root

---

## Phase 1: Setup

Purpose: Initialize both frontend and backend projects, Docker configuration, and tooling.

- [X] T001 Initialise monorepo directory structure — create `frontend/`, `backend/`, `docker/` directories with `.gitkeep` files
- [X] T002 [P] Initialize backend Next.js project with TypeScript in `backend/` — create `backend/package.json`, `backend/tsconfig.json` (strict:true), `backend/next.config.js` (disabling SSR page routing)
- [X] T003 [P] Initialize frontend Webpack + React 18 project with TypeScript in `frontend/` — create `frontend/package.json`, `frontend/tsconfig.json` (strict:true), `frontend/webpack.config.ts`
- [X] T004 [P] Install and configure shadcn/ui in `frontend/` — run shadcn init, create `frontend/src/components/ui/` directory
- [X] T005 [P] Configure Mikro-ORM 6 for MySQL 8 in `backend/mikro-orm.config.ts`
- [X] T006 [P] Create multi-stage frontend Dockerfile (Webpack build → nginx serve) in `docker/Dockerfile.frontend`
- [X] T007 [P] Create multi-stage backend Dockerfile (deps install → Next.js production build) in `docker/Dockerfile.backend`
- [X] T008 Create `docker-compose.yml` with three services: frontend (:3000), backend (:3001), db MySQL 8 (:3306)
- [X] T009 [P] Configure Jest + React Testing Library in `frontend/` — create `frontend/jest.config.ts`, `frontend/jest.setup.ts`
- [X] T010 [P] Configure Jest for backend in `backend/` — create `backend/jest.config.ts`

**Checkpoint**: `docker compose up` starts all three containers.

---

## Phase 2: Foundational

Purpose: Core infrastructure that MUST be complete before ANY user story begins — auth, database schema, book catalog API (needed by US1).

**Warning**: No user story work can begin until this phase is complete.

### Auth and User System

- [X] T011 Create User entity with all fields and role enum in `backend/src/entities/User.ts`
- [X] T012 Create initial Mikro-ORM migration (users table) in `backend/migrations/Migration001Initial.ts`
- [X] T013 Implement AuthService (register with bcrypt, login, JWT sign/verify) in `backend/src/services/AuthService.ts`
- [X] T014 [P] Create auth middleware (JWT cookie extraction, role guard) in `backend/src/middleware/auth.ts`
- [X] T015 Create auth API routes (POST register, POST login, POST logout, GET me) in `backend/pages/api/auth/`
- [X] T016 [P] Create typed API client base with fetch wrapper in `frontend/src/services/apiClient.ts`
- [X] T017 [P] Create shared TypeScript interface types (all types from contracts/api.md) in `frontend/src/types/index.ts`
- [X] T018 [P] Implement auth hooks (useAuth, useCurrentUser) in `frontend/src/hooks/useAuth.ts`
- [X] T019 [P] Create LoginPage with email+password form using shadcn/ui in `frontend/src/pages/LoginPage.tsx`
- [X] T020 [P] Create RegisterPage with registration form using shadcn/ui in `frontend/src/pages/RegisterPage.tsx`
- [X] T021 [P] Write RTL tests for LoginPage in `frontend/tests/unit/LoginPage.test.tsx`
- [X] T022 [P] Write RTL tests for RegisterPage in `frontend/tests/unit/RegisterPage.test.tsx`

### Book Catalog (needed by US1)

- [X] T023 Create Book entity in `backend/src/entities/Book.ts`
- [X] T024 [P] Create Author entity in `backend/src/entities/Author.ts`
- [X] T025 [P] Create Tag entity in `backend/src/entities/Tag.ts`
- [X] T026 Create migration for books, authors, tags, and join tables in `backend/migrations/Migration002Catalog.ts`
- [X] T027 Implement BookService (search with FULLTEXT, getById with aggregates) in `backend/src/services/BookService.ts`
- [X] T028 Create books API routes (GET /api/books?q=, GET /api/books/:id) in `backend/pages/api/books/`
- [X] T029 [P] Create authors API route (GET /api/authors/:id) in `backend/pages/api/authors/[id].ts`

### GDPR Baseline

- [X] T030 [P] Create CookieConsentBanner component (shown on first visit, blocks non-essential cookies) in `frontend/src/components/CookieConsentBanner.tsx`
- [X] T031 [P] Create PrivacyPolicyPage in `frontend/src/pages/PrivacyPolicyPage.tsx`
- [X] T032 [P] Write RTL test for CookieConsentBanner in `frontend/tests/unit/CookieConsentBanner.test.tsx`

### App Shell

- [X] T033 Set up React Router 6 with all routes and ProtectedRoute wrapper in `frontend/src/App.tsx`
- [X] T034 [P] Create AppHeader component with navigation, search bar, and auth buttons using shadcn/ui in `frontend/src/components/AppHeader.tsx`
- [X] T035 [P] Write RTL test for AppHeader in `frontend/tests/unit/AppHeader.test.tsx`

**Checkpoint**: Users can register, log in, log out. Book catalog can be queried. Cookie consent shown on first visit.

---

## Phase 3: User Story 1 — Log a Book and Rate It (Priority: P1)

Goal: User can search for a book, log it with status and dates, and assign a star rating.
Independent Test: Register → search a known book title → log as "finished" with today's date → assign 4 stars → verify entry appears in reading diary.

### Implementation for User Story 1

- [X] T036 [US1] Create ReadingEntry entity with all fields in `backend/src/entities/ReadingEntry.ts`
- [X] T037 [P] [US1] Create Rating entity with UNIQUE(user_id, book_id) constraint in `backend/src/entities/Rating.ts`
- [X] T038 [US1] Create migration for reading_entries and ratings tables in `backend/migrations/Migration003ReadingRating.ts`
- [X] T039 [US1] Implement ReadingEntryService (create, update all fields, delete, list with filters) in `backend/src/services/ReadingEntryService.ts`
- [X] T040 [P] [US1] Implement RatingService (upsert — create or replace, delete) in `backend/src/services/RatingService.ts`
- [X] T041 [US1] Create reading entries API routes (GET, POST, PATCH :id, DELETE :id) in `backend/pages/api/reading-entries/`
- [X] T042 [P] [US1] Create ratings API routes (POST upsert, DELETE :bookId) in `backend/pages/api/ratings/`
- [X] T043 [P] [US1] Create BookCard component (title, cover, author, avg rating) using shadcn/ui Card in `frontend/src/components/BookCard.tsx`
- [X] T044 [P] [US1] Create BookSearchBar component with debounced input using shadcn/ui Input in `frontend/src/components/BookSearchBar.tsx`
- [X] T045 [P] [US1] Create StarRatingInput component (1-5 interactive stars) in `frontend/src/components/StarRatingInput.tsx`
- [X] T046 [US1] Create LogBookModal component (status select, date pickers, reread checkbox, notes textarea, rating) using shadcn/ui Dialog+Form in `frontend/src/components/LogBookModal.tsx`
- [X] T047 [US1] Create BookSearchPage — search bar + results grid in `frontend/src/pages/BookSearchPage.tsx`
- [X] T048 [US1] Create BookDetailPage — metadata, avg rating, user's own rating widget, Log Book button in `frontend/src/pages/BookDetailPage.tsx`
- [X] T049 [US1] Create ReadingDiaryPage — list of user's reading entries, filterable by status in `frontend/src/pages/ReadingDiaryPage.tsx`
- [X] T050 [P] [US1] Implement useBookSearch hook (debounced API call, loading/error state) in `frontend/src/hooks/useBookSearch.ts`
- [X] T051 [P] [US1] Implement useReadingEntry hook (create, update, delete entry) in `frontend/src/hooks/useReadingEntry.ts`

### Tests for User Story 1

- [X] T052 [P] [US1] Write RTL tests for BookCard in `frontend/tests/unit/BookCard.test.tsx`
- [X] T053 [P] [US1] Write RTL tests for StarRatingInput (interaction, value changes) in `frontend/tests/unit/StarRatingInput.test.tsx`
- [X] T054 [P] [US1] Write RTL tests for LogBookModal (form fields, submit, close) in `frontend/tests/unit/LogBookModal.test.tsx`
- [X] T055 [P] [US1] Write unit tests for ReadingEntryService in `backend/tests/unit/ReadingEntryService.test.ts`
- [X] T056 [P] [US1] Write unit tests for RatingService (upsert replaces, delete) in `backend/tests/unit/RatingService.test.ts`

**Checkpoint**: User Story 1 fully functional — search, log, rate, view diary.

---

## Phase 4: User Story 2 — Write and Read Reviews (Priority: P2)

Goal: User can write a text review with optional spoiler flag; all users can read reviews on book pages.
Independent Test: Log a book as US1 → write a review with spoiler=true → visit book page as different user → confirm review is hidden behind "Show spoilers" toggle.

### Implementation for User Story 2

- [X] T057 [US2] Create Review entity with UNIQUE(user_id, book_id) constraint in `backend/src/entities/Review.ts`
- [X] T058 [US2] Create migration for reviews table in `backend/migrations/Migration004Reviews.ts`
- [X] T059 [US2] Implement ReviewService (upsert — create or replace, partial update, delete) in `backend/src/services/ReviewService.ts`
- [X] T060 [US2] Create reviews API routes (GET /api/books/:bookId/reviews, POST upsert, PATCH :id, DELETE :id) in `backend/pages/api/reviews/` and `backend/pages/api/books/[bookId]/reviews.ts`
- [X] T061 [P] [US2] Create ReviewCard component — shows reviewer, content, date; hides body behind "Show spoilers" toggle when containsSpoilers=true using shadcn/ui in `frontend/src/components/ReviewCard.tsx`
- [X] T062 [P] [US2] Create ReviewEditor component — textarea + spoiler checkbox + submit/cancel using shadcn/ui Textarea+Checkbox in `frontend/src/components/ReviewEditor.tsx`
- [X] T063 [US2] Update BookDetailPage to include ReviewsList (ReviewCard per review) and ReviewEditor (for authenticated users) in `frontend/src/pages/BookDetailPage.tsx`
- [X] T064 [P] [US2] Implement useReview hook (upsert, delete user's review) in `frontend/src/hooks/useReview.ts`

### Tests for User Story 2

- [X] T065 [P] [US2] Write RTL tests for ReviewCard — spoiler toggle hides/shows content in `frontend/tests/unit/ReviewCard.test.tsx`
- [X] T066 [P] [US2] Write RTL tests for ReviewEditor — submit with/without spoiler flag in `frontend/tests/unit/ReviewEditor.test.tsx`
- [X] T067 [P] [US2] Write unit tests for ReviewService in `backend/tests/unit/ReviewService.test.ts`

**Checkpoint**: User Stories 1 and 2 independently functional.

---

## Phase 5: User Story 3 — Manage Reading Lists (Priority: P3)

Goal: User creates a named list (public or private, ranked or unranked), adds books, and shares via URL.
Independent Test: Create a public ranked list → add 3 books with positions → visit list URL as unauthenticated user → confirm all 3 books visible in rank order.

### Implementation for User Story 3

- [X] T068 [US3] Create List entity in `backend/src/entities/List.ts`
- [X] T069 [P] [US3] Create ListItem entity with UNIQUE(list_id, book_id) in `backend/src/entities/ListItem.ts`
- [X] T070 [US3] Create migration for lists and list_items tables in `backend/migrations/Migration005Lists.ts`
- [X] T071 [US3] Implement ListService (create, update, delete list; add/update/remove items; enforce public visibility gate) in `backend/src/services/ListService.ts`
- [X] T072 [US3] Create list API routes (POST, GET :id, PATCH :id, DELETE :id; POST/PATCH/DELETE items) in `backend/pages/api/lists/`
- [X] T073 [P] [US3] Create user lists API route (GET /api/users/:userId/lists) in `backend/pages/api/users/[userId]/lists.ts`
- [X] T074 [P] [US3] Create ListCard component (title, item count, visibility badge) using shadcn/ui Card in `frontend/src/components/ListCard.tsx`
- [X] T075 [P] [US3] Create CreateListModal component (title, description, isRanked toggle, visibility select) using shadcn/ui Dialog+Form in `frontend/src/components/CreateListModal.tsx`
- [X] T076 [US3] Create ListDetailPage — list metadata, ordered/unordered book items, add-book search (owner only) in `frontend/src/pages/ListDetailPage.tsx`
- [X] T077 [US3] Create UserProfilePage — avatar, bio, stats (books logged, avg rating), public lists grid in `frontend/src/pages/UserProfilePage.tsx`
- [X] T078 [P] [US3] Implement useList hook (create, update, add/remove items) in `frontend/src/hooks/useList.ts`

### Tests for User Story 3

- [X] T079 [P] [US3] Write RTL tests for CreateListModal in `frontend/tests/unit/CreateListModal.test.tsx`
- [X] T080 [P] [US3] Write RTL tests for ListCard in `frontend/tests/unit/ListCard.test.tsx`
- [X] T081 [P] [US3] Write unit tests for ListService (visibility gate, item uniqueness) in `backend/tests/unit/ListService.test.ts`

**Checkpoint**: User Stories 1, 2, and 3 independently functional.

---

## Phase 6: User Story 4 — Follow Users and View Activity Feed (Priority: P4)

Goal: User follows another reader; home feed shows that reader's activity (finished, rated, reviewed, listed).
Independent Test: User A follows User B → User B logs a finished book → User A's home feed shows "User B finished [Book]".

### Implementation for User Story 4

- [X] T082 [US4] Create Follow entity with UNIQUE(follower_id, following_id) and self-follow guard in `backend/src/entities/Follow.ts`
- [X] T083 [P] [US4] Create Activity entity with type enum and nullable subject FKs in `backend/src/entities/Activity.ts`
- [X] T084 [US4] Create migration for follows and activities tables in `backend/migrations/Migration006Social.ts`
- [X] T085 [US4] Implement FollowService (follow, unfollow, getFollowers, getFollowing) in `backend/src/services/FollowService.ts`
- [X] T086 [US4] Implement ActivityService (createEvent, getFeedForUser — pull-based JOIN on follows → activities) in `backend/src/services/ActivityService.ts`
- [X] T087 [US4] Integrate activity event emission into ReadingEntryService (book_finished), RatingService (book_rated), ReviewService (review_published), and ListService (list_created) in respective service files
- [X] T088 [US4] Create social API routes (POST/DELETE /api/follows/:userId, GET /api/users/:userId/followers, GET /api/users/:userId/following) in `backend/pages/api/follows/` and `backend/pages/api/users/`
- [X] T089 [P] [US4] Create feed API route (GET /api/feed — paginated, pull-based) in `backend/pages/api/feed/index.ts`
- [X] T090 [P] [US4] Create ActivityEventCard component — renders each event type (finished/rated/reviewed/listed) using shadcn/ui Card in `frontend/src/components/ActivityEventCard.tsx`
- [X] T091 [P] [US4] Create FollowButton component (follow/unfollow toggle) using shadcn/ui Button in `frontend/src/components/FollowButton.tsx`
- [X] T092 [US4] Create ActivityFeedPage (home) — paginated list of ActivityEventCards; empty state prompts user to follow readers in `frontend/src/pages/ActivityFeedPage.tsx`
- [X] T093 [US4] Update UserProfilePage to include FollowButton, followers/following counts, and isFollowedByMe state in `frontend/src/pages/UserProfilePage.tsx`
- [X] T094 [P] [US4] Implement useFeed hook (paginated fetch, loading state) in `frontend/src/hooks/useFeed.ts`

### Tests for User Story 4

- [X] T095 [P] [US4] Write RTL tests for ActivityEventCard (renders each event type, book link present) in `frontend/tests/unit/ActivityEventCard.test.tsx`
- [X] T096 [P] [US4] Write RTL tests for FollowButton (toggle state, loading) in `frontend/tests/unit/FollowButton.test.tsx`
- [X] T097 [P] [US4] Write unit tests for ActivityService (feed query returns only followed users' events) in `backend/tests/unit/ActivityService.test.ts`
- [X] T098 [P] [US4] Write unit tests for FollowService (self-follow rejected, unfollow idempotent) in `backend/tests/unit/FollowService.test.ts`

**Checkpoint**: All user stories 1–4 independently functional. Core social platform working.

---

## Phase 7: User Story 5 — Discover and Search Books (Priority: P5)

Goal: Any visitor (including unauthenticated) can search books and view full book detail pages.
Independent Test: Visit site without logging in → search for a book title → click result → confirm full book page (cover, authors, description, avg rating, public reviews) displays without auth prompt.

### Implementation for User Story 5

- [X] T099 [P] [US5] Create HomePage — featured/recent books grid, search prompt, call-to-action for new users in `frontend/src/pages/HomePage.tsx`
- [X] T100 [US5] Update BookSearchPage to work for unauthenticated users — search results, pagination, no auth gate in `frontend/src/pages/BookSearchPage.tsx`
- [X] T101 [US5] Update BookDetailPage to display full content (metadata, reviews, aggregate rating) for unauthenticated users — auth-gate only the Log/Rate/Review actions in `frontend/src/pages/BookDetailPage.tsx`
- [X] T102 [P] [US5] Create AuthorDetailPage — author bio, book listing in `frontend/src/pages/AuthorDetailPage.tsx`

### Tests for User Story 5

- [X] T103 [P] [US5] Write RTL tests for HomePage (renders without auth, shows search prompt) in `frontend/tests/unit/HomePage.test.tsx`
- [X] T104 [P] [US5] Write RTL tests for BookDetailPage unauthenticated state (full content visible, auth gates on actions) in `frontend/tests/unit/BookDetailPage.test.tsx`

**Checkpoint**: All 5 user stories independently functional.

---

## Phase 8: Admin Tooling

Purpose: Internal admin interface for catalog management and basic user management (FR-016, FR-016b).

- [X] T105 Create admin auth middleware (role=admin guard) in `backend/src/middleware/adminAuth.ts`
- [X] T106 Create admin books API routes (GET/POST /api/admin/books, PATCH/DELETE /api/admin/books/:id) in `backend/pages/api/admin/books/`
- [X] T107 [P] Create admin authors API routes (GET/POST/PATCH /api/admin/authors, /api/admin/authors/:id) in `backend/pages/api/admin/authors/`
- [X] T108 [P] Create admin users API routes (GET /api/admin/users, DELETE /api/admin/users/:id with anonymisation) in `backend/pages/api/admin/users/`
- [X] T109 Create AdminLayout with navigation using shadcn/ui in `frontend/src/components/AdminLayout.tsx`
- [X] T110 [P] Create AdminBooksPage — table of books with add/edit/delete actions using shadcn/ui Table+Dialog in `frontend/src/pages/admin/AdminBooksPage.tsx`
- [X] T111 [P] Create AdminAuthorsPage — table of authors with add/edit actions in `frontend/src/pages/admin/AdminAuthorsPage.tsx`
- [X] T112 [P] Create AdminUsersPage — table of users with delete (anonymise) action in `frontend/src/pages/admin/AdminUsersPage.tsx`
- [X] T113 Add /admin/* routes to React Router with admin-role guard redirect in `frontend/src/App.tsx`
- [X] T114 [P] Write RTL tests for AdminBooksPage (renders table, opens add dialog) in `frontend/tests/unit/AdminBooksPage.test.tsx`

---

## Phase 9: GDPR Compliance

Purpose: Account self-deletion with PII anonymisation, data export, complete cookie consent flow (FR-017–FR-020).

- [X] T115 Implement account deletion in AuthService — overwrite PII fields, set deletedAt, set isAnonymised=true, clear JWT cookie in `backend/src/services/AuthService.ts`
- [X] T116 [P] Implement data export in a new GdprService — serialize user's ReadingEntries, Ratings, Reviews, Lists to JSON in `backend/src/services/GdprService.ts`
- [X] T117 Create account API routes (DELETE /api/account with password confirmation, GET /api/account/export as file download) in `backend/pages/api/account/`
- [X] T118 [P] Create AccountSettingsPage — profile edit, data export button, delete account section with confirmation dialog using shadcn/ui in `frontend/src/pages/AccountSettingsPage.tsx`
- [X] T119 [P] Write RTL tests for AccountSettingsPage (delete confirmation dialog, export button) in `frontend/tests/unit/AccountSettingsPage.test.tsx`
- [X] T120 [P] Write unit tests for GdprService (export includes all user data, anonymisation clears PII) in `backend/tests/unit/GdprService.test.ts`

---

## Phase 10: Polish and Cross-Cutting Concerns

Purpose: Final quality pass across all stories.

- [X] T121 [P] Add TypeScript strict-mode compliance check to CI — tsc --noEmit must pass with zero errors in both `frontend/` and `backend/`
- [X] T122 [P] Audit all React components — confirm no class components, no custom UI primitives (shadcn/ui only)
- [X] T123 [P] Add error boundary and 404/500 fallback pages in `frontend/src/pages/`
- [X] T124 [P] Validate docker compose up succeeds on a clean checkout with no pre-existing volumes
- [X] T125 [P] Run quickstart.md validation checklist — all 6 items confirmed passing

---

## Dependencies and Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — can start once foundational is complete
- **US2 (Phase 4)**: Depends on Phase 2; loosely depends on US1 BookDetailPage existing
- **US3 (Phase 5)**: Depends on Phase 2; UserProfilePage integrates with US4 but independently testable
- **US4 (Phase 6)**: Depends on Phase 2 + T087 integration (requires US1/US2/US3 services complete)
- **US5 (Phase 7)**: Depends on Phase 2; updates pages created in US1
- **Admin (Phase 8)**: Depends on Phase 2 (User entity + auth middleware)
- **GDPR (Phase 9)**: Depends on Phase 2 (AuthService base)
- **Polish (Phase 10)**: Depends on all prior phases

### User Story Dependencies

- **US1 (P1)**: Can start immediately after Foundational — no cross-story deps
- **US2 (P2)**: Can start after Foundational — depends on BookDetailPage from US1 for integration
- **US3 (P3)**: Can start after Foundational — independent
- **US4 (P4)**: Requires US1/US2/US3 service activity integration (T087) before fully testable
- **US5 (P5)**: Can start after Foundational — updates existing pages

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel after T001
- All Foundational entity/migration tasks can run in parallel after T011
- US1, US3, Admin, GDPR phases can proceed in parallel once Foundational is complete
- Within each story: model/service tasks → API routes → frontend components → tests (components marked [P] run in parallel)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1
4. **STOP AND VALIDATE**: Search a book → log it → rate it → check diary
5. Demo-ready MVP

### Incremental Delivery

1. Setup + Foundational → working auth + book catalog
2. US1 → reading diary + ratings (MVP)
3. US2 → reviews with spoiler handling
4. US3 → curated lists
5. US4 → social feed (full platform)
6. US5 → public discovery
7. Admin → catalog management
8. GDPR → compliance complete

---

## Notes

- [P] tasks = no dependencies on incomplete tasks in the same phase; safe to parallelise
- [US#] label maps every task to its user story for traceability
- Each user story has a defined independent test — validate before moving to next story
- Constitution-mandated RTL tests are included for all React components
- Commit after each task or logical group; stop at any checkpoint to validate
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independence
