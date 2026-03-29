# Feature Specification: LiterRater — Social Book Cataloging Platform

**Feature Branch**: `001-social-book-platform`
**Created**: 2026-03-29
**Status**: Draft
**Input**: User description: "A Letterboxd-style social cataloging platform for books called LiterRater."

## Clarifications

### Session 2026-03-29

- Q: How is the book catalog populated and kept up to date? → A: Manual admin curation — books added via internal admin tooling only.
- Q: Can users edit the status and dates of an existing ReadingEntry after saving? → A: Fully mutable — users can edit status, dates, and notes on any entry at any time.
- Q: Are there data privacy or compliance requirements? → A: GDPR-compliant — right to erasure, data export, cookie consent, and privacy policy required.
- Q: What is the target user and data scale for MVP? → A: Small — up to 1,000 registered users and hundreds of books in the catalog.
- Q: What is the scope of the admin role? → A: Catalog management plus basic user management — admins can view users and delete accounts.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Log a Book and Rate It (Priority: P1)

A user searches for a book they have just finished, logs it to their reading diary
with a finish date and status of "finished", and gives it a star rating.

**Why this priority**: This is the core product loop. Without logging and rating,
nothing else on the platform has value. Every other feature builds on this action.

**Independent Test**: Register a new account, search for a known book title, log
it as finished with today's date, and assign a rating. Delivers a functional
personal reading log.

**Acceptance Scenarios**:

1. **Given** a logged-in user on a book page, **When** they tap "Log Book", select
   status "Finished", set a finish date, and save, **Then** the book appears in
   their reading diary with the correct date and status.
2. **Given** a logged-in user who has logged a book, **When** they assign a rating
   of 1–5 stars, **Then** the rating is saved, displayed on the book page, and
   factored into the book's aggregate rating.
3. **Given** a book with multiple ratings, **When** any user views the book page,
   **Then** the page displays the average community rating and the user's own
   rating if they have rated it.
4. **Given** a logged-in user, **When** they log a book they have already logged,
   **Then** the system records it as a re-read without removing the previous entry.

---

### User Story 2 — Write and Read Reviews (Priority: P2)

A user writes a text review for a book they have read, optionally marking it as
containing spoilers. Other users can read reviews on a book's page.

**Why this priority**: Reviews add qualitative depth to ratings and drive discovery
and social engagement. They are the primary user-generated content on the platform.

**Independent Test**: Log a book and write a review, then visit the book page as a
different user to confirm the review appears with correct spoiler handling.

**Acceptance Scenarios**:

1. **Given** a logged-in user who has rated a book, **When** they write a review
   and save it, **Then** the review appears on the book page attributed to the user.
2. **Given** a review marked as containing spoilers, **When** any user views the
   book page, **Then** the review body is hidden behind a "Show spoilers" toggle.
3. **Given** multiple reviews on a book page, **When** a visitor views the page,
   **Then** reviews are displayed in reverse chronological order by default.

---

### User Story 3 — Manage Reading Lists (Priority: P3)

A user creates a named curated list of books (e.g., "Summer Reads 2026"), adds
books to it, and makes it publicly visible to other users.

**Why this priority**: Lists enable curation and discovery beyond individual ratings;
they are a lightweight publishing format that drives return visits.

**Independent Test**: Create a list, add books to it, then visit the list URL as
an unauthenticated user to confirm full visibility.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they create a new list with a title,
   description, and visibility set to "public", **Then** the list appears on their
   profile and is accessible via a shareable URL.
2. **Given** an existing list, **When** the owner adds a book and sets its position
   in a ranked list, **Then** the book appears at the correct rank and the list
   order can be updated.
3. **Given** a public list, **When** any user (including unauthenticated) visits
   the list URL, **Then** the full list with book covers and titles is displayed.

---

### User Story 4 — Follow Users and View Activity Feed (Priority: P4)

A user follows another reader. Their home feed shows that reader's recent
activity: books finished, ratings given, reviews written, and lists created.

**Why this priority**: The social graph and activity feed transform a personal
reading log into a social platform and drive daily engagement.

**Independent Test**: Follow a user, have that user log a book, then confirm the
activity appears in the follower's feed.

**Acceptance Scenarios**:

1. **Given** user A visits user B's profile, **When** they click "Follow",
   **Then** user B appears in user A's following list and user A in user B's
   followers list.
2. **Given** user A follows user B, **When** user B logs a finished book or
   publishes a review, **Then** that activity appears in user A's home feed.
3. **Given** a user with no follows, **When** they view their feed,
   **Then** they see an empty-state prompt to discover readers to follow.
4. **Given** user A follows user B, **When** user A unfollows user B,
   **Then** user B's future activity no longer appears in user A's feed.

---

### User Story 5 — Discover and Search Books (Priority: P5)

A user searches for a book by title or author name and views the book's detail
page with metadata, aggregate ratings, and community reviews.

**Why this priority**: Without findable books, no other feature can be used. Search
and book pages are the entry point for every other user story.

**Independent Test**: Type a known book title into search and confirm the book page
displays title, author, cover, and aggregate rating data.

**Acceptance Scenarios**:

1. **Given** any user (including unauthenticated), **When** they enter a book title
   or author name in the search bar, **Then** matching results appear within 2
   seconds showing title, author, and cover image.
2. **Given** a book detail page, **When** any user views it, **Then** it displays
   title, author, publication year, cover image, description, average community
   rating, total ratings count, and all public reviews.
3. **Given** a search with no exact matches, **When** the user submits the query,
   **Then** the system displays the closest partial matches ranked by relevance.

---

### Edge Cases

- What happens when a user searches for a book not in the catalog? Display a
  "not found" message; ad-hoc book creation is out of scope for MVP.
- How does the system handle account deletion? Reviews and ratings are anonymised,
  not deleted, to preserve community data integrity.
- Can a user rate a book they have not logged? Yes — ratings are permitted without
  a reading log entry, as many users rate from memory.
- What if a list owner changes visibility to "private" after others have bookmarked
  the URL? The list returns not-found to non-owners.
- What happens when the activity feed has no events? An empty-state with suggested
  users to follow is shown rather than a blank page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to register with an email address and
  password, and subsequently log in and log out.
- **FR-002**: System MUST allow any user (authenticated or not) to search the book
  catalog by title and author name.
- **FR-003**: System MUST allow authenticated users to log a book entry with:
  status (reading / finished / abandoned), optional start date, optional finish
  date, re-read flag, and optional notes. Users MUST be able to edit all fields
  of an existing entry at any time, including changing its status.
- **FR-004**: System MUST allow authenticated users to assign a rating of 1–5 stars
  to any book independently of writing a review.
- **FR-005**: System MUST allow authenticated users to write a text review for a
  book, with a boolean spoiler flag.
- **FR-006**: System MUST hide the body of any review flagged as containing
  spoilers behind a manual reveal toggle visible to all users.
- **FR-007**: System MUST allow authenticated users to create named book lists with
  a title, optional description, and public/private visibility setting.
- **FR-008**: System MUST allow list owners to add books to their lists and
  optionally assign a rank position when the list is ordered.
- **FR-009**: System MUST allow authenticated users to follow and unfollow other
  users.
- **FR-010**: System MUST display a personalised activity feed to authenticated
  users containing events from followed users: book finished, book rated, review
  published, list created.
- **FR-011**: System MUST display a public profile page for each user showing
  recent activity, books logged count, average rating, public lists, and
  followers/following counts.
- **FR-012**: System MUST display a book detail page showing: title, author(s),
  publication year, cover image, description, average community rating, total
  ratings count, and all public reviews.
- **FR-013**: System MUST allow unauthenticated users to browse book pages and
  public profiles, but MUST require authentication to log books, rate, review,
  create lists, or follow users.
- **FR-016**: System MUST provide an internal admin interface allowing authorised
  administrators to add, edit, and remove books and authors from the catalog.
  Regular users MUST NOT have access to catalog management.
- **FR-016b**: Administrators MUST be able to view a list of all registered users
  and permanently delete any user account (with the same anonymisation rules as
  self-deletion per FR-017).
- **FR-017**: System MUST allow authenticated users to permanently delete their
  account. On deletion, all personally identifiable data MUST be erased; reviews
  and ratings MUST be anonymised and retained to preserve community data.
- **FR-018**: System MUST allow authenticated users to export all their personal
  data (reading log, ratings, reviews, lists) in a machine-readable format.
- **FR-019**: System MUST display a cookie consent notice on first visit and MUST
  NOT set non-essential cookies before consent is granted.
- **FR-020**: System MUST provide a Privacy Policy page accessible without
  authentication.
- **FR-014**: System MUST enforce one rating per user per book — updating a rating
  replaces the previous value rather than creating a duplicate.
- **FR-015**: System MUST enforce one review per user per book — editing a review
  replaces the previous version.

### Key Entities

- **User**: Account holder with one of two roles — **member** (standard user) or
  **admin**. Members have profile, reading log, lists, follows, reviews, and
  ratings. Admins additionally have access to catalog and user management tooling.
- **Book**: Core media object; title, author(s), ISBN, publication year, cover
  image, description, genres, page count.
- **Author**: Person who wrote one or more books; name, bio, nationality, birth
  year.
- **ReadingEntry**: One user's record of reading a book; status (reading /
  finished / abandoned), optional start/finish dates, re-read flag, optional
  notes; all fields are fully editable after creation. May reference a rating
  and review.
- **Rating**: A 1–5 star score from one user for one book; one active rating per
  user per book.
- **Review**: A text body authored by one user for one book; includes spoiler flag;
  one active review per user per book.
- **List**: A named, optionally ordered collection of books created by one user;
  has visibility (public/private).
- **ListItem**: A book within a list; stores optional rank/position.
- **Follow**: A directed relationship from follower user to followed user.
- **Activity**: An event record representing a user action (logged, rated,
  reviewed, created list) used to populate the social feed.
- **Tag**: A genre or thematic label that can be applied to a book.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can log a finished book (search → log → rate) in under 10
  seconds from the search bar — as measured by task-completion timing in user
  testing.
- **SC-002**: Book search returns results for 95% of queries in under 2 seconds
  under normal load conditions.
- **SC-003**: A new user can complete registration and log their first book within
  5 minutes of landing on the site with no prior instructions.
- **SC-004**: The activity feed loads and displays the first page of events within
  3 seconds for users following up to 500 accounts.
- **SC-005**: Public book pages and public list pages are fully visible to
  unauthenticated users with no authentication gate blocking content.
- **SC-006**: 90% of users who log a book assign a rating within the same session,
  measured by funnel analytics.
- **SC-007**: The system MUST remain fully functional for up to 1,000 registered
  users and a catalog of hundreds of books without degradation to any stated
  performance criteria.

## Assumptions

- MVP is designed to support up to 1,000 registered users and a catalog of
  hundreds of books. Scaling beyond this is a post-MVP concern.
- Users are assumed to have a stable internet connection; offline support is out
  of scope for MVP.
- Book catalog is managed exclusively by administrators via internal tooling;
  users cannot add or edit books. No third-party catalog API is used.
- Email and password authentication is sufficient for MVP; OAuth2 social login is
  a post-MVP enhancement.
- A mobile-responsive web interface is required; a native mobile app is out of
  scope for MVP.
- The platform MUST comply with GDPR: users have the right to erasure, data
  portability, and informed consent for cookie usage.
- Moderation tooling (flagging reviews, banning users) is out of scope for MVP.
- Email notifications (new follower, reply, etc.) are out of scope for MVP.
- Recommendations engine, personal analytics dashboards, and gamification
  (reading goals, badges, annual recap) are explicitly deferred to post-MVP phases.
- The reading diary supports re-reads by allowing multiple log entries for the
  same book per user.
