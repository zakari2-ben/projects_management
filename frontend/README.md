# Frontend

React + Vite client for the Project Management System.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

## Environment

Create `.env` and configure:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

If omitted, the client automatically falls back to the current host on port `8000`.

## Responsibilities

- Route protection and auth UX
- Project and task management UI
- Rich text task descriptions (TipTap)
- Frontend validation + backend error rendering
