# Database

> Schema and how it fits together. Referenced by [[api]] and [[architecture]].

## Engine & access

DB engine, version, connection/env vars (names only, never secrets — see [[deployment]]).

## Key tables

### `<table_name>`

- **Purpose:** what it stores.
- **Key columns:** `id`, `<col>` (type — meaning).
- **Relations:** FK to `<other_table>`.

## Migrations

Where migrations live, how to run them, naming convention.

## Notes

Indexes, constraints, soft-delete, data-retention gotchas.
