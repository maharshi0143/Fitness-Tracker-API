# Fitness Tracker API

A production-grade fitness tracking API that enforces data integrity across three layers: TypeScript types, Zod runtime validation, and PostgreSQL constraints.

## Architecture Overview

- **TypeScript (compile-time)**: Strict typing prevents invalid shapes and misuse during development.
- **Zod (runtime)**: Validates inbound API payloads and business rules before any database writes.
- **PostgreSQL (database)**: Enforces immutable invariants with `NOT NULL`, `UNIQUE`, `FOREIGN KEY`, and `CHECK` constraints.

## Quick Start (Docker)

1. Create a local environment file:

```bash
cp .env.example .env
```

2. Start the stack:

```bash
docker-compose up --build -d
```

3. Verify the API:

```bash
curl http://localhost:3000/health
```

## Environment Variables

Defined in [.env.example](.env.example).

- `DATABASE_URL` - Full Postgres connection string.
- `API_PORT` - Port for the API server.

## Key Endpoints

- `POST /api/gyms`
  - Create a gym.
  - Validates positive capacity and unique name.

- `POST /api/trainers/:trainerId/assignments`
  - Assign a trainer to a gym.
  - Validates certification validity and assignment limits.

- `POST /api/members/:memberId/enrollments`
  - Enroll a member in a gym.
  - Uses a transaction to ensure capacity is not exceeded.

- `POST /api/sessions/:sessionId/exercises`
  - Add a polymorphic exercise (`strength` or `cardio`).
  - Validates payload structure in both Zod and database constraints.

- `POST /api/members/:memberId/metrics`
  - Log health metrics with bounds checks.
  - Enforces temporal delta rules for weight changes.

## Error Response Contract

Validation failures return `400` with a consistent response shape:

```json
{
  "success": false,
  "error": {
    "layer": "runtime",
    "errors": [
      {
        "field": "string",
        "rule": "string",
        "message": "string",
        "value": "unknown"
      }
    ]
  }
}
```

The `layer` is `runtime` for Zod and business rules or `database` for constraint violations.

## Prisma & Migrations

- Schema is defined in [prisma/schema.prisma](prisma/schema.prisma).
- Database constraints are enforced in the migration SQL under [prisma/migrations](prisma/migrations).
- Initial data is seeded via [prisma/seed.sql](prisma/seed.sql).

## Development

```bash
npm install
npm run dev
```

## Notes

- The API expects PostgreSQL and is designed to run with Docker Compose.
- All integrity rules are enforced at the runtime and database layers to prevent bad data from being stored.
