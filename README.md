# Project Management System (Monorepo)

Full-stack project management app with React (frontend) and Laravel (backend), designed for team collaboration, task tracking, and workspace management.

## Tech Stack

- Frontend: React, Vite, React Router, Axios, TipTap, React Hot Toast
- Backend: Laravel 12, Sanctum, Eloquent ORM, PHPUnit
- Database: MySQL/SQLite (Laravel-compatible)

## Run Locally

### Backend

```bash
cd backend
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

## Quality Checks

### Backend tests

```bash
cd backend
php artisan test
```

### Frontend lint

```bash
cd frontend
npm run lint
```

## Architecture Notes

The codebase currently follows a clear split by runtime boundary:

- `frontend/src/api`: API adapters and transport
- `frontend/src/context`: app-wide state (auth, projects)
- `frontend/src/components`: reusable UI blocks
- `frontend/src/pages`: route-level screens
- `backend/app/Http`: requests/controllers/resources
- `backend/app/Services`: domain-specific business rules
- `backend/app/Models`: persistence and relationships

A recommended next-step architecture for long-term scale is documented in `docs/ARCHITECTURE.md`.
