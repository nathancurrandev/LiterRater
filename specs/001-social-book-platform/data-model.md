# Data Model: LiterRater — Social Book Cataloging Platform

**Branch**: `001-social-book-platform`
**Date**: 2026-03-29
**ORM**: Mikro-ORM 6 | **Database**: MySQL 8

## Overview

The entity graph is centered on `Book`, which is catalogued with `Author` (via `BookAuthor`) and categorised with `Tag` (via `BookTag`). A `User` interacts with books through three distinct activity entities: `ReadingEntry` (tracking reading progress and re-reads), `Rating` (a 1–5 score, one per user per book), and `Review` (a text critique, one per user per book). Users can curate ordered or unordered `List` collections of books via `ListItem`. Social features are handled by `Follow` (a directed user-to-user relationship) and `Activity` (a denormalised feed log recording key events such as finishing a book, posting a rating, publishing a review, or creating a list).

---

## Entity Definitions

### User

| Field           | Type                         | Constraints                        | Notes                                              |
|-----------------|------------------------------|------------------------------------|----------------------------------------------------|
| id              | `number`                     | PK, auto-increment                 |                                                    |
| email           | `string`                     | UNIQUE, NOT NULL                   |                                                    |
| passwordHash    | `string`                     | NOT NULL                           |                                                    |
| username        | `string`                     | UNIQUE, NOT NULL                   | URL-safe slug                                      |
| displayName     | `string`                     | NOT NULL                           |                                                    |
| bio             | `string \| null`             |                                    |                                                    |
| avatarUrl       | `string \| null`             |                                    |                                                    |
| role            | `'member' \| 'admin'`        | NOT NULL, DEFAULT `'member'`       | Enum                                               |
| isAnonymised    | `boolean`                    | NOT NULL, DEFAULT `false`          | Set `true` on GDPR erasure; see GDPR Notes         |
| createdAt       | `Date`                       | NOT NULL                           |                                                    |
| deletedAt       | `Date \| null`               |                                    | Soft-delete timestamp                              |

**Relationships**

- `OneToMany` → `ReadingEntry` (as author of the entry)
- `OneToMany` → `Rating`
- `OneToMany` → `Review`
- `OneToMany` → `List` (as owner)
- `OneToMany` → `Activity` (as actor)
- `OneToMany` → `Follow` (as `follower`)
- `OneToMany` → `Follow` (as `following`)

**Indexes / Constraints**

- `UNIQUE(email)`
- `UNIQUE(username)`

---

### Author

| Field       | Type             | Constraints        | Notes |
|-------------|------------------|--------------------|-------|
| id          | `number`         | PK, auto-increment |       |
| name        | `string`         | NOT NULL           |       |
| bio         | `string \| null` |                    |       |
| birthYear   | `number \| null` |                    |       |
| nationality | `string \| null` |                    |       |

**Relationships**

- `ManyToMany` ↔ `Book` (via `BookAuthor` join table)

---

### Book

| Field            | Type             | Constraints                  | Notes                           |
|------------------|------------------|------------------------------|---------------------------------|
| id               | `number`         | PK, auto-increment           |                                 |
| title            | `string`         | NOT NULL                     | FULLTEXT indexed                |
| isbn             | `string \| null` | UNIQUE                       |                                 |
| publicationYear  | `number \| null` |                              |                                 |
| description      | `string \| null` |                              | TEXT column; FULLTEXT indexed   |
| coverImageUrl    | `string \| null` |                              |                                 |
| pageCount        | `number \| null` |                              |                                 |
| language         | `string`         | NOT NULL, DEFAULT `'en'`     |                                 |
| createdAt        | `Date`           | NOT NULL                     |                                 |
| updatedAt        | `Date`           | NOT NULL                     |                                 |

**Relationships**

- `ManyToMany` ↔ `Author` (via `BookAuthor` join table)
- `ManyToMany` ↔ `Tag` (via `BookTag` join table)
- `OneToMany` → `ReadingEntry`
- `OneToMany` → `Rating`
- `OneToMany` → `Review`

**Indexes / Constraints**

- `UNIQUE(isbn)`
- `FULLTEXT(title, description)`

---

### Tag

| Field | Type     | Constraints        | Notes      |
|-------|----------|--------------------|------------|
| id    | `number` | PK, auto-increment |            |
| name  | `string` | UNIQUE, NOT NULL   |            |
| slug  | `string` | UNIQUE, NOT NULL   | kebab-case |

**Relationships**

- `ManyToMany` ↔ `Book` (via `BookTag` join table)

---

### ReadingEntry

| Field      | Type                                        | Constraints              | Notes                          |
|------------|---------------------------------------------|--------------------------|--------------------------------|
| id         | `number`                                    | PK, auto-increment       |                                |
| status     | `'reading' \| 'finished' \| 'abandoned'`   | NOT NULL                 | Enum; see State Transitions    |
| startDate  | `Date \| null`                              |                          |                                |
| finishDate | `Date \| null`                              |                          |                                |
| isReread   | `boolean`                                   | NOT NULL, DEFAULT `false`|                                |
| notes      | `string \| null`                            |                          | TEXT column                    |
| createdAt  | `Date`                                      | NOT NULL                 |                                |
| updatedAt  | `Date`                                      | NOT NULL                 |                                |

**Relationships**

- `ManyToOne` → `User` (NOT NULL)
- `ManyToOne` → `Book` (NOT NULL)

**Notes**

Multiple `ReadingEntry` rows per `(user, book)` are explicitly allowed to support re-reads. There is **no** unique constraint on `(user_id, book_id)`.

---

### Rating

| Field     | Type     | Constraints        | Notes                                          |
|-----------|----------|--------------------|------------------------------------------------|
| id        | `number` | PK, auto-increment |                                                |
| score     | `number` | NOT NULL           | CHECK constraint: value between 1 and 5        |
| createdAt | `Date`   | NOT NULL           |                                                |
| updatedAt | `Date`   | NOT NULL           |                                                |

**Relationships**

- `ManyToOne` → `User` (NOT NULL)
- `ManyToOne` → `Book` (NOT NULL)

**Indexes / Constraints**

- `UNIQUE(user_id, book_id)` — one active rating per user per book; upsert replaces the existing row.

---

### Review

| Field            | Type      | Constraints              | Notes       |
|------------------|-----------|--------------------------|-------------|
| id               | `number`  | PK, auto-increment       |             |
| content          | `string`  | NOT NULL                 | TEXT column |
| containsSpoilers | `boolean` | NOT NULL, DEFAULT `false`|             |
| createdAt        | `Date`    | NOT NULL                 |             |
| updatedAt        | `Date`    | NOT NULL                 |             |

**Relationships**

- `ManyToOne` → `User` (NOT NULL)
- `ManyToOne` → `Book` (NOT NULL)

**Indexes / Constraints**

- `UNIQUE(user_id, book_id)` — one active review per user per book; editing replaces `content` in place.

---

### List

| Field       | Type                       | Constraints              | Notes |
|-------------|----------------------------|--------------------------|-------|
| id          | `number`                   | PK, auto-increment       |       |
| title       | `string`                   | NOT NULL                 |       |
| description | `string \| null`           |                          | TEXT  |
| isRanked    | `boolean`                  | NOT NULL, DEFAULT `false`|       |
| visibility  | `'public' \| 'private'`   | NOT NULL, DEFAULT `'public'` | Enum |
| createdAt   | `Date`                     | NOT NULL                 |       |
| updatedAt   | `Date`                     | NOT NULL                 |       |

**Relationships**

- `ManyToOne` → `User` as `owner` (NOT NULL)
- `OneToMany` → `ListItem`

---

### ListItem

| Field    | Type             | Constraints        | Notes                                     |
|----------|------------------|--------------------|-------------------------------------------|
| id       | `number`         | PK, auto-increment |                                           |
| position | `number \| null` |                    | Populated only when `List.isRanked = true`|
| notes    | `string \| null` |                    |                                           |

**Relationships**

- `ManyToOne` → `List` (NOT NULL)
- `ManyToOne` → `Book` (NOT NULL)

**Indexes / Constraints**

- `UNIQUE(list_id, book_id)` — a book appears at most once per list.

---

### Follow

| Field     | Type     | Constraints        | Notes                                           |
|-----------|----------|--------------------|-------------------------------------------------|
| id        | `number` | PK, auto-increment |                                                 |
| createdAt | `Date`   | NOT NULL           |                                                 |

**Relationships**

- `ManyToOne` → `User` as `follower` (NOT NULL)
- `ManyToOne` → `User` as `following` (NOT NULL)

**Indexes / Constraints**

- `UNIQUE(follower_id, following_id)` — no duplicate follow relationships.
- Self-follow is forbidden: `follower_id != following_id` (enforced at the application layer).
- `INDEX(following_id)` — supports reverse-lookup for feed queries.

---

### Activity

| Field           | Type                                                                           | Constraints        | Notes                                             |
|-----------------|--------------------------------------------------------------------------------|--------------------|---------------------------------------------------|
| id              | `number`                                                                       | PK, auto-increment |                                                   |
| type            | `'book_finished' \| 'book_rated' \| 'review_published' \| 'list_created'`    | NOT NULL           | Enum                                              |
| subjectBookId   | `number \| null`                                                               | FK → Book          | Populated for `book_finished`, `book_rated`       |
| subjectListId   | `number \| null`                                                               | FK → List          | Populated for `list_created`                      |
| subjectReviewId | `number \| null`                                                               | FK → Review        | Populated for `review_published`                  |
| subjectRatingId | `number \| null`                                                               | FK → Rating        | Populated for `book_rated`                        |
| createdAt       | `Date`                                                                         | NOT NULL           |                                                   |

**Relationships**

- `ManyToOne` → `User` as `actor` (NOT NULL)

**Notes**

Exactly one subject FK is populated per row, corresponding to the `type` value. All other subject FK columns are `null`.

**Indexes / Constraints**

- `INDEX(actor_id, created_at DESC)` — supports paginated feed queries sorted by recency.

---

## State Transitions

### ReadingEntry.status

| From         | To           | Notes                              |
|--------------|--------------|------------------------------------|
| `reading`    | `finished`   | User marks the book complete       |
| `reading`    | `abandoned`  | User gives up on the book          |
| `finished`   | `reading`    | User starts a re-read              |
| `finished`   | `abandoned`  | User may retroactively change      |
| `abandoned`  | `reading`    | User resumes or restarts           |
| `abandoned`  | `finished`   | User may retroactively change      |

Transitions are fully mutable — the user can edit `status` at any time. Allowed values: `reading`, `finished`, `abandoned`.

### User.isAnonymised

| From    | To     | Notes                                                                 |
|---------|--------|-----------------------------------------------------------------------|
| `false` | `true` | Irreversible. Triggered by account self-deletion (FR-017) or admin deletion (FR-016b). |

On anonymisation: `email`, `passwordHash`, `username`, `displayName`, `bio`, and `avatarUrl` are overwritten with anonymised placeholder values; `role` is set to `'member'`.

---

## GDPR Notes

- **Account deletion**: The `User` row is retained with `isAnonymised = true` and `deletedAt` set to the deletion timestamp. All PII fields (`email`, `passwordHash`, `username`, `displayName`, `bio`, `avatarUrl`) are overwritten with placeholder values. Reviews and ratings retain their content but the user reference is displayed as "Deleted User".
- **Data export (FR-018)**: A JSON dump of all `ReadingEntry`, `Rating`, `Review`, `List`, `ListItem`, and `Follow` rows belonging to the requesting user is produced and delivered to the user.

---

## Indexes

| Table        | Index                                  | Purpose                                        |
|--------------|----------------------------------------|------------------------------------------------|
| `users`      | `UNIQUE(email)`                        | Login lookup; uniqueness enforcement           |
| `users`      | `UNIQUE(username)`                     | Profile URL routing; uniqueness enforcement    |
| `books`      | `UNIQUE(isbn)`                         | Deduplication on import                        |
| `books`      | `FULLTEXT(title, description)`         | Full-text book search                          |
| `ratings`    | `UNIQUE(user_id, book_id)`             | One rating per user per book; upsert target    |
| `reviews`    | `UNIQUE(user_id, book_id)`             | One review per user per book                   |
| `list_items` | `UNIQUE(list_id, book_id)`             | Prevent duplicate books within a list          |
| `follows`    | `UNIQUE(follower_id, following_id)`    | Prevent duplicate follow edges                 |
| `follows`    | `INDEX(following_id)`                  | Reverse-lookup: "who follows this user?"       |
| `activities` | `INDEX(actor_id, created_at DESC)`     | Paginated activity feed sorted by recency      |
