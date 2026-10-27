---
paths:
  - "src/{api,server,routes,services,handlers}/**"
  - "app/api/**"
  - "**/*.{route,controller,service,handler}.{js,ts,py,go,rb}"
---

# Backend conventions

Applies when working on server-side request handling and domain logic.

- Route handlers stay thin: parse, delegate, respond. Domain logic belongs in a service
  that is callable without HTTP — if it cannot be tested without a request object, the
  boundary is in the wrong place.
- Validate every input at the boundary, before it reaches domain logic. Trust nothing from
  a client, including its own prior responses.
- Errors surface as typed failures the handler maps to status codes. No silent catch; a
  caught error is either handled or rethrown with context.
- Auth is checked per route, not assumed from a parent. Distinguish authentication (who)
  from authorization (may they) — passing the first says nothing about the second.
- Secrets come from the environment, never a literal, and never appear in a log line or an
  error response.
- Anything that returns a collection takes a limit. An endpoint that returns "all" is a
  future incident.
