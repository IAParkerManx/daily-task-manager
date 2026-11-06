# Daily Task Manager

A full-stack daily task manager: Vite + React (TypeScript) frontend, Node/Express backend, SQLite persistence (via Node's built-in `node:sqlite`, no native build step required).

## Features

- Create, edit, complete, and delete tasks
- Priority (low/medium/high), status (todo/in progress/done), category, and due date per task
- Filter by due date (today, upcoming, overdue, no due date) and by category
- Dashboard stats: due today, overdue, completed, total
- Data persists locally in a SQLite file — no external database needed

## Requirements

- Node.js 22.5+ (uses the built-in `node:sqlite` module)

## Getting started

```bash
npm run install:all   # installs server + client dependencies
npm run dev            # runs the API on :4000 and the Vite dev server on :5173
```

Open http://localhost:5173 — the Vite dev server proxies `/api` requests to the Express backend.

## Project structure

```
server/        Express API + SQLite storage (server/src)
client/        Vite + React + TypeScript frontend (client/src)
```

## Production build

```bash
npm run build          # builds the client into client/dist
node server/src/index.js   # run the API (serve client/dist separately, e.g. with a static file server)
```

The SQLite database file lives at `server/data/tasks.db` and is created automatically on first run.
