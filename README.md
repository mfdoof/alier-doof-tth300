# Server Maintenance Log

Next.js (App Router) + MySQL via `mysql2`, raw parameterized SQL, no ORM.

## Setup

```bash
npm install
cp .env.example .env.local        # set DATABASE_URL (your MySQL user/password)
npm run db:migrate                # creates the database + tables (idempotent)
npm run db:seed                   # optional sample data
npm run dev                       # http://localhost:3000
```

## Layout

- `db/schema.sql` – `servers` and `maintenance_logs` tables (FK `ON DELETE CASCADE`)
- `lib/queries.ts` – all SQL (parameterized with `?`)
- `app/actions.ts` – server actions for create/update/delete, with validation
- `app/page.tsx` – log list (joined to hostname, newest first), filters, monthly summary
- `app/servers/` – server CRUD
- `app/logs/` – new/edit log entry

Times are stored as `DATETIME` exactly as entered in the form (no time zone
conversion), so form input and display always agree.
