# LiterRater

A Letterboxd-style social book cataloging platform. Track what you're reading, rate and review books, build curated lists, follow other readers, and discover books through social activity.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Webpack 5, React Router 6, shadcn/ui, TypeScript 5 (strict) |
| Backend | Next.js 14 (API routes only — no SSR), TypeScript 5 (strict) |
| Database | MySQL 8 via Mikro-ORM 6 |
| Auth | JWT in httpOnly cookie, bcrypt password hashing |
| Infrastructure | Docker + Docker Compose |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the database and full-stack Docker option)
- npm v10+

---

## Local Development (Recommended)

This approach runs the database in Docker and the frontend/backend locally for fast hot-reload.

### 1. Start the database

```bash
docker compose up db -d
```

This starts MySQL 8 on port `3306` with default credentials:

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `3306` |
| Database | `literrater` |
| User | `literrater` |
| Password | `password` |

### 2. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Run database migrations

```bash
cd backend
npm run migrate
```

### 4. Start the backend

```bash
cd backend
npm run dev
```

The backend API runs at **http://localhost:3001**.

### 5. Start the frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

The frontend runs at **http://localhost:3000** (Webpack Dev Server with hot reload).

---

## Environment Variables

Both services read environment variables at startup. The defaults work out-of-the-box for local development — you only need to set these in production.

### Backend (`backend/`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `literrater` | MySQL user |
| `DB_PASSWORD` | `password` | MySQL password |
| `DB_NAME` | `literrater` | Database name |
| `JWT_SECRET` | `dev-secret-change-me` | JWT signing secret — **change in production** |
| `JWT_EXPIRES_IN` | `7d` | JWT token lifetime |

Create a `backend/.env.local` file to override any of the above:

```bash
JWT_SECRET=your-secret-here
```

### Frontend (`frontend/`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Backend API base URL |

---

## Running with Docker Compose (Full Stack)

To run everything in containers (matches production):

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| MySQL | localhost:3306 |

To stop and remove containers:

```bash
docker compose down
```

To also delete the database volume:

```bash
docker compose down -v
```

---

## Database Migrations

Migrations live in `backend/migrations/` and are run with Mikro-ORM.

```bash
cd backend

# Apply all pending migrations
npm run migrate

# Create a new blank migration
npm run migrate:create
```

Migrations run automatically in order:

| Migration | Description |
|-----------|-------------|
| `Migration001Initial` | Users table |
| `Migration002Catalog` | Books, authors, tags, join tables |
| `Migration003ReadingRating` | Reading entries, ratings |
| `Migration004Reviews` | Reviews |
| `Migration005Lists` | Lists, list items |
| `Migration006Social` | Follows, activity feed |

---

## Running Tests

### Frontend (React Testing Library + Jest)

```bash
cd frontend
npm test               # run once
npm run test:watch     # watch mode
```

### Backend (Jest)

```bash
cd backend
npm test               # run once
npm run test:watch     # watch mode
```

### TypeScript type checking

```bash
cd frontend && npm run typecheck
cd backend  && npm run typecheck
```

---

## Project Structure

```
literrater/
├── frontend/
│   ├── src/
│   │   ├── components/     # Feature components (composed from shadcn/ui)
│   │   ├── pages/          # React Router page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # Typed API client (fetch wrappers)
│   │   └── types/          # Shared TypeScript interfaces
│   ├── tests/unit/         # RTL unit tests
│   ├── webpack.config.ts
│   └── tsconfig.json
│
├── backend/
│   ├── pages/api/          # Next.js API route handlers
│   │   ├── auth/           # register, login, logout, me
│   │   ├── books/          # search, detail, reviews
│   │   ├── authors/        # author detail
│   │   ├── reading-entries/
│   │   ├── ratings/
│   │   ├── reviews/
│   │   ├── lists/
│   │   ├── follows/
│   │   ├── feed/
│   │   ├── users/          # profile, followers, following, lists
│   │   ├── account/        # export, delete
│   │   └── admin/          # books, authors, users (admin only)
│   ├── src/
│   │   ├── entities/       # Mikro-ORM entity classes
│   │   ├── services/       # Business logic
│   │   └── middleware/     # Auth guards
│   ├── migrations/         # Database schema migrations
│   ├── tests/unit/         # Jest unit tests
│   ├── mikro-orm.config.ts
│   └── tsconfig.json
│
├── docker/
│   ├── Dockerfile.frontend
│   └── Dockerfile.backend
│
├── docker-compose.yml
└── specs/001-social-book-platform/   # Feature spec, plan, tasks
```

---

## Creating an Admin User

The backend includes a seed script for creating the first admin account:

```bash
cd backend
npm run seed:admin
```

Admin users can manage the book catalogue at **http://localhost:3000/admin**.

---

## API Overview

All endpoints return `{ data: T }` on success or `{ error: string }` on failure. Auth uses an httpOnly JWT cookie set on login.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | — | Create account |
| `POST` | `/api/auth/login` | — | Sign in |
| `POST` | `/api/auth/logout` | Required | Sign out |
| `GET` | `/api/auth/me` | Required | Current user |
| `GET` | `/api/books` | — | Search books (`?q=`) |
| `GET` | `/api/books/:id` | — | Book detail |
| `GET` | `/api/books/:id/reviews` | — | Book reviews |
| `GET` | `/api/authors/:id` | — | Author + books |
| `GET/POST` | `/api/reading-entries` | Required | Reading diary |
| `PATCH/DELETE` | `/api/reading-entries/:id` | Required | Update/delete entry |
| `POST` | `/api/ratings` | Required | Rate a book (upsert) |
| `DELETE` | `/api/ratings/:bookId` | Required | Remove rating |
| `POST` | `/api/reviews` | Required | Write/update review |
| `DELETE` | `/api/reviews/:bookId` | Required | Delete review |
| `POST/GET/PATCH/DELETE` | `/api/lists/...` | Mixed | Reading lists |
| `POST/DELETE` | `/api/follows/:userId` | Required | Follow/unfollow |
| `GET` | `/api/feed` | Required | Activity feed |
| `GET` | `/api/users/:id/lists` | — | User's public lists |
| `GET` | `/api/account/export` | Required | Download your data |
| `DELETE` | `/api/account` | Required | Delete account |
