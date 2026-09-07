---
paths:
  - "**/migrations/**"
  - "**/schema.{sql,prisma,rb,py,ts}"
  - "**/models/**"
  - "prisma/**"
  - "db/**"
---

# Database conventions

Applies when working on schema, migrations, or data access.

- Migrations are append-only and forward-only. An applied migration is never edited —
  write a new one that corrects it, exactly as with an ADR.
- Every migration is reversible, or documents plainly why it cannot be.
- Schema changes travel with the code that needs them, in the same change.
- Name things for what they hold, not how they are used. Foreign keys read
  `<entity>_id` consistently across the schema.
- Add an index when a query needs it and you can point at the query. Speculative indexes
  cost writes for no measured gain.
- Constraints belong in the database, not only in application code — the database is the
  last place that can enforce them.
- A destructive migration (drop, narrow a type, remove a column) gets explicit confirmation
  before it runs anywhere but a local machine.
