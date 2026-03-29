# API Contracts: LiterRater

**Branch**: `001-social-book-platform`
**Date**: 2026-03-29
**Style**: REST over HTTP | **Auth**: JWT in httpOnly cookie | **Format**: JSON

## Conventions
- All endpoints return `{ data: T }` on success or `{ error: string }` on failure
- Auth-required routes return 401 if unauthenticated, 403 if forbidden
- Admin-only routes return 403 for non-admin users
- Pagination: `?page=1&limit=20` (default limit 20, max 50)
- Dates: ISO 8601 strings

---

## Auth Routes

### POST /api/auth/register

- **Auth**: None
- **Request**:
  ```typescript
  interface RegisterRequest {
    email: string;
    password: string;
    username: string;
    displayName: string;
  }
  ```
- **Response**:
  ```typescript
  interface RegisterResponse {
    data: {
      user: UserSummary;
      token: string; // also set as httpOnly cookie
    };
  }
  ```

---

### POST /api/auth/login

- **Auth**: None
- **Request**:
  ```typescript
  interface LoginRequest {
    email: string;
    password: string;
  }
  ```
- **Response**:
  ```typescript
  interface LoginResponse {
    data: {
      user: UserSummary; // JWT set in httpOnly cookie
    };
  }
  ```

---

### POST /api/auth/logout

- **Auth**: Required
- **Request**: none
- **Response**:
  ```typescript
  interface LogoutResponse {
    data: { ok: true }; // clears cookie
  }
  ```

---

### GET /api/auth/me

- **Auth**: Required
- **Response**:
  ```typescript
  interface MeResponse {
    data: UserSummary;
  }
  ```

---

## Book Routes

### GET /api/books

- **Auth**: None
- **Query**: `?q=string&page=number&limit=number`
- **Response**:
  ```typescript
  interface GetBooksResponse {
    data: BookSummary[];
    meta: PaginationMeta;
  }
  ```

---

### GET /api/books/:id

- **Auth**: None
- **Response**:
  ```typescript
  interface GetBookResponse {
    data: BookDetail; // includes authors, tags, averageRating, ratingCount,
                      // and the authenticated user's own rating/review if logged in
  }
  ```

---

## Author Routes

### GET /api/authors/:id

- **Auth**: None
- **Response**:
  ```typescript
  interface GetAuthorResponse {
    data: AuthorDetail & { books: BookSummary[] }; // includes books[]
  }
  ```

---

## Reading Entry Routes

### GET /api/reading-entries

- **Auth**: Required
- **Query**: `?bookId=number&status=reading|finished|abandoned&page=number`
- **Response**:
  ```typescript
  interface GetReadingEntriesResponse {
    data: ReadingEntry[];
    meta: PaginationMeta;
  }
  ```

---

### POST /api/reading-entries

- **Auth**: Required
- **Request**:
  ```typescript
  interface CreateReadingEntryRequest {
    bookId: number;
    status: 'reading' | 'finished' | 'abandoned';
    startDate?: string;
    finishDate?: string;
    isReread?: boolean;
    notes?: string;
  }
  ```
- **Response**:
  ```typescript
  interface CreateReadingEntryResponse {
    data: ReadingEntry;
  }
  ```

---

### PATCH /api/reading-entries/:id

- **Auth**: Required (owner only)
- **Request**:
  ```typescript
  type UpdateReadingEntryRequest = Partial<CreateReadingEntryRequest>;
  ```
- **Response**:
  ```typescript
  interface UpdateReadingEntryResponse {
    data: ReadingEntry;
  }
  ```

---

### DELETE /api/reading-entries/:id

- **Auth**: Required (owner only)
- **Response**:
  ```typescript
  interface DeleteReadingEntryResponse {
    data: { ok: true };
  }
  ```

---

## Rating Routes

### POST /api/ratings

Upsert — creates or replaces existing rating.

- **Auth**: Required
- **Request**:
  ```typescript
  interface UpsertRatingRequest {
    bookId: number;
    score: 1 | 2 | 3 | 4 | 5;
  }
  ```
- **Response**:
  ```typescript
  interface UpsertRatingResponse {
    data: Rating;
  }
  ```

---

### DELETE /api/ratings/:bookId

- **Auth**: Required (owner only)
- **Response**:
  ```typescript
  interface DeleteRatingResponse {
    data: { ok: true };
  }
  ```

---

## Review Routes

### GET /api/books/:bookId/reviews

- **Auth**: None
- **Query**: `?page=number&limit=number`
- **Response**:
  ```typescript
  interface GetReviewsResponse {
    data: Review[];
    meta: PaginationMeta;
  }
  ```

---

### POST /api/reviews

Upsert — creates or replaces existing review.

- **Auth**: Required
- **Request**:
  ```typescript
  interface UpsertReviewRequest {
    bookId: number;
    content: string;
    containsSpoilers: boolean;
  }
  ```
- **Response**:
  ```typescript
  interface UpsertReviewResponse {
    data: Review;
  }
  ```

---

### PATCH /api/reviews/:id

- **Auth**: Required (owner only)
- **Request**:
  ```typescript
  interface UpdateReviewRequest {
    content?: string;
    containsSpoilers?: boolean;
  }
  ```
- **Response**:
  ```typescript
  interface UpdateReviewResponse {
    data: Review;
  }
  ```

---

### DELETE /api/reviews/:id

- **Auth**: Required (owner only)
- **Response**:
  ```typescript
  interface DeleteReviewResponse {
    data: { ok: true };
  }
  ```

---

## List Routes

### GET /api/users/:userId/lists

- **Auth**: None (returns only public lists for non-owners; all lists for owner)
- **Query**: `?page=number`
- **Response**:
  ```typescript
  interface GetUserListsResponse {
    data: ListSummary[];
    meta: PaginationMeta;
  }
  ```

---

### POST /api/lists

- **Auth**: Required
- **Request**:
  ```typescript
  interface CreateListRequest {
    title: string;
    description?: string;
    isRanked: boolean;
    visibility: 'public' | 'private';
  }
  ```
- **Response**:
  ```typescript
  interface CreateListResponse {
    data: ListDetail;
  }
  ```

---

### GET /api/lists/:id

- **Auth**: None (404 for private lists unless owner)
- **Response**:
  ```typescript
  interface GetListResponse {
    data: ListDetail; // includes items with book summaries
  }
  ```

---

### PATCH /api/lists/:id

- **Auth**: Required (owner only)
- **Request**:
  ```typescript
  interface UpdateListRequest {
    title?: string;
    description?: string;
    isRanked?: boolean;
    visibility?: 'public' | 'private';
  }
  ```
- **Response**:
  ```typescript
  interface UpdateListResponse {
    data: ListDetail;
  }
  ```

---

### DELETE /api/lists/:id

- **Auth**: Required (owner only)
- **Response**:
  ```typescript
  interface DeleteListResponse {
    data: { ok: true };
  }
  ```

---

### POST /api/lists/:id/items

- **Auth**: Required (owner only)
- **Request**:
  ```typescript
  interface AddListItemRequest {
    bookId: number;
    position?: number;
    notes?: string;
  }
  ```
- **Response**:
  ```typescript
  interface AddListItemResponse {
    data: ListItem;
  }
  ```

---

### PATCH /api/lists/:id/items/:bookId

- **Auth**: Required (owner only)
- **Request**:
  ```typescript
  interface UpdateListItemRequest {
    position?: number;
    notes?: string;
  }
  ```
- **Response**:
  ```typescript
  interface UpdateListItemResponse {
    data: ListItem;
  }
  ```

---

### DELETE /api/lists/:id/items/:bookId

- **Auth**: Required (owner only)
- **Response**:
  ```typescript
  interface DeleteListItemResponse {
    data: { ok: true };
  }
  ```

---

## Social Routes

### POST /api/follows/:userId

- **Auth**: Required (cannot follow self — returns 400)
- **Response**:
  ```typescript
  interface FollowResponse {
    data: { ok: true };
  }
  ```

---

### DELETE /api/follows/:userId

- **Auth**: Required
- **Response**:
  ```typescript
  interface UnfollowResponse {
    data: { ok: true };
  }
  ```

---

### GET /api/users/:userId/followers

- **Auth**: None
- **Query**: `?page=number`
- **Response**:
  ```typescript
  interface GetFollowersResponse {
    data: UserSummary[];
    meta: PaginationMeta;
  }
  ```

---

### GET /api/users/:userId/following

- **Auth**: None
- **Query**: `?page=number`
- **Response**:
  ```typescript
  interface GetFollowingResponse {
    data: UserSummary[];
    meta: PaginationMeta;
  }
  ```

---

## Feed Route

### GET /api/feed

- **Auth**: Required
- **Query**: `?page=number&limit=number`
- **Response**:
  ```typescript
  interface GetFeedResponse {
    data: ActivityEvent[];
    meta: PaginationMeta;
  }
  ```
- **Note**: Returns activity from followed users sorted by `createdAt` DESC. Pull-based query on Activity table JOINed through Follow.

---

## User Routes

### GET /api/users/:userId

- **Auth**: None
- **Response**:
  ```typescript
  interface GetUserResponse {
    data: UserProfile; // includes stats, recentActivity, publicLists
  }
  ```

---

### PATCH /api/users/me

- **Auth**: Required
- **Request**:
  ```typescript
  interface UpdateMeRequest {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
  }
  ```
- **Response**:
  ```typescript
  interface UpdateMeResponse {
    data: UserSummary;
  }
  ```

---

## Account / GDPR Routes

### GET /api/account/export

- **Auth**: Required
- **Response**: JSON file download containing all user data: `readingEntries`, `ratings`, `reviews`, `lists`, `follows`
  - `Content-Type: application/json`
  - `Content-Disposition: attachment`

---

### DELETE /api/account

- **Auth**: Required
- **Request**:
  ```typescript
  interface DeleteAccountRequest {
    password: string; // confirmation required
  }
  ```
- **Response**:
  ```typescript
  interface DeleteAccountResponse {
    data: { ok: true }; // anonymises PII, sets deletedAt, clears cookie
  }
  ```

---

## Admin Routes

All routes in this section require `role = admin`. Non-admin users receive `403 Forbidden`.

### GET /api/admin/books

- **Auth**: Admin
- **Query**: `?page=number&q=string`
- **Response**:
  ```typescript
  interface AdminGetBooksResponse {
    data: BookSummary[];
    meta: PaginationMeta;
  }
  ```

---

### POST /api/admin/books

- **Auth**: Admin
- **Request**:
  ```typescript
  interface AdminCreateBookRequest {
    title: string;
    isbn?: string;
    publicationYear?: number;
    description?: string;
    coverImageUrl?: string;
    pageCount?: number;
    language?: string;
    authorIds: number[];
    tagIds?: number[];
  }
  ```
- **Response**:
  ```typescript
  interface AdminCreateBookResponse {
    data: BookDetail;
  }
  ```

---

### PATCH /api/admin/books/:id

- **Auth**: Admin
- **Request**:
  ```typescript
  type AdminUpdateBookRequest = Partial<AdminCreateBookRequest>;
  ```
- **Response**:
  ```typescript
  interface AdminUpdateBookResponse {
    data: BookDetail;
  }
  ```

---

### DELETE /api/admin/books/:id

- **Auth**: Admin
- **Response**:
  ```typescript
  interface AdminDeleteBookResponse {
    data: { ok: true };
  }
  ```

---

### GET /api/admin/authors

- **Auth**: Admin
- **Query**: `?page=number&q=string`
- **Response**:
  ```typescript
  interface AdminGetAuthorsResponse {
    data: AuthorDetail[];
    meta: PaginationMeta;
  }
  ```

---

### POST /api/admin/authors

- **Auth**: Admin
- **Request**:
  ```typescript
  interface AdminCreateAuthorRequest {
    name: string;
    bio?: string;
    birthYear?: number;
    nationality?: string;
  }
  ```
- **Response**:
  ```typescript
  interface AdminCreateAuthorResponse {
    data: AuthorDetail;
  }
  ```

---

### PATCH /api/admin/authors/:id

- **Auth**: Admin
- **Request**:
  ```typescript
  type AdminUpdateAuthorRequest = Partial<AdminCreateAuthorRequest>;
  ```
- **Response**:
  ```typescript
  interface AdminUpdateAuthorResponse {
    data: AuthorDetail;
  }
  ```

---

### GET /api/admin/users

- **Auth**: Admin
- **Query**: `?page=number&q=string`
- **Response**:
  ```typescript
  interface AdminGetUsersResponse {
    data: UserSummary[];
    meta: PaginationMeta;
  }
  ```

---

### DELETE /api/admin/users/:id

- **Auth**: Admin
- **Request**: none
- **Response**:
  ```typescript
  interface AdminDeleteUserResponse {
    data: { ok: true }; // applies same anonymisation as self-deletion
  }
  ```

---

## Shared TypeScript Types

```typescript
interface UserSummary {
  id: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'member' | 'admin';
}

interface UserProfile extends UserSummary {
  bio: string | null;
  booksLoggedCount: number;
  averageRating: number | null;
  followersCount: number;
  followingCount: number;
  isFollowedByMe: boolean;
}

interface BookSummary {
  id: number;
  title: string;
  coverImageUrl: string | null;
  authors: Pick<AuthorDetail, 'id' | 'name'>[];
  averageRating: number | null;
  ratingCount: number;
}

interface BookDetail extends BookSummary {
  isbn: string | null;
  publicationYear: number | null;
  description: string | null;
  pageCount: number | null;
  language: string;
  tags: Tag[];
  myRating: number | null;
  myReview: Review | null;
}

interface AuthorDetail {
  id: number;
  name: string;
  bio: string | null;
  birthYear: number | null;
  nationality: string | null;
}

interface ReadingEntry {
  id: number;
  bookId: number;
  status: 'reading' | 'finished' | 'abandoned';
  startDate: string | null;
  finishDate: string | null;
  isReread: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Rating {
  id: number;
  bookId: number;
  score: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
  updatedAt: string;
}

interface Review {
  id: number;
  bookId: number;
  author: UserSummary;
  content: string;
  containsSpoilers: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ListSummary {
  id: number;
  title: string;
  description: string | null;
  isRanked: boolean;
  visibility: 'public' | 'private';
  itemCount: number;
  owner: UserSummary;
  createdAt: string;
}

interface ListDetail extends ListSummary {
  items: ListItem[];
}

interface ListItem {
  bookId: number;
  book: BookSummary;
  position: number | null;
  notes: string | null;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface ActivityEvent {
  id: number;
  type: 'book_finished' | 'book_rated' | 'review_published' | 'list_created';
  actor: UserSummary;
  book?: BookSummary;
  review?: Review;
  list?: ListSummary;
  createdAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```
