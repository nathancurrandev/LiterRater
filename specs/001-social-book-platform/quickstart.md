# Quickstart: LiterRater

**Branch**: `001-social-book-platform`

## Prerequisites

- Docker Desktop installed and running
- Node.js 20+ (for local dev outside Docker)
- Git

## Quick Start (Docker — recommended)

1. Clone the repository:

```bash
git clone <repo-url>
cd literRater
```

2. Copy the example environment file:

```bash
cp .env.example .env
```

3. Start all services:

```bash
docker compose up
```

This starts three containers:

| Container | Service | Port |
|---|---|---|
| `frontend` | React 18 SPA (Webpack dev server) | http://localhost:3000 |
| `backend` | Next.js API routes | http://localhost:3001 |
| `db` | MySQL 8 | localhost:3306 |

4. Open http://localhost:3000 in your browser.

## Environment Variables

Copy `.env.example` to `.env` and set the following variables:

| Variable | Default / Example | Notes |
|---|---|---|
| `DATABASE_URL` | `mysql://literrater:password@db:3306/literrater` | Uses the `db` Docker service hostname |
| `JWT_SECRET` | _(your value)_ | Strong random string, minimum 32 characters |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Must be reachable from the browser |
| `NODE_ENV` | `development` | |

## Local Development (without Docker)

### 1. Start MySQL (Docker only)

The database must still run in Docker:

```bash
docker compose up db -d
```

### 2. Backend setup

```bash
cd backend
npm install
npm run migrate
npm run dev
```

The Next.js API server starts on http://localhost:3001.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The Webpack dev server starts on http://localhost:3000.

## Database Migrations

LiterRater uses MikroORM for database migrations.

Run all pending migrations:

```bash
cd backend && npm run migrate
```

Create a new migration:

```bash
cd backend && npm run migrate:create -- --name=migration-name
```

## Running Tests

Frontend (Jest + React Testing Library):

```bash
cd frontend && npm test
```

Backend (Jest):

```bash
cd backend && npm test
```

## Creating an Admin User

Admin users cannot be created through the normal registration flow. Use the seed script:

```bash
cd backend && npm run seed:admin -- --email=admin@example.com --password=yourpassword
```

Alternatively, set `role='admin'` directly in the database for an existing user.

## Validating the Setup

- [ ] http://localhost:3000 loads the LiterRater home page
- [ ] http://localhost:3001/api/books returns JSON (an empty array is fine)
- [ ] Can register a new user account
- [ ] Can search for books (will be empty until an admin adds books)
- [ ] Admin user can access `/admin` and add a book
