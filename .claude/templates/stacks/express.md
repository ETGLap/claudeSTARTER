---
name: express
description: Express/Fastify API conventions. Use when building or reviewing routes, middleware, validation, or error handling in a Node HTTP service.
---

<!-- Stack pack — knowledge, not a generator. Enable by copying:
     mkdir -p .claude/skills/express && cp .claude/templates/stacks/express.md .claude/skills/express/SKILL.md -->

# Express / Fastify stack pack

Informs the spec→test→implement pipeline; never scaffolds code on its own.

## Patterns

- Handlers parse, delegate, respond. Domain logic lives in a service callable without a
  `req`/`res` pair — that is what makes it testable and reusable.
- Validate the body, params, and query at the boundary with a schema, and derive the type
  from the schema rather than declaring it twice.
- One error-handling middleware maps typed domain errors to status codes. Handlers throw;
  they do not each format their own error response.
- Async handlers must not swallow rejections — use the framework's async support or a
  wrapper, never a bare `async` handler on Express 4.
- Every list endpoint takes a limit and returns a stable order.

## Spec considerations (/sdd)

- Outcomes are request → response contracts: status, shape, and the error cases.
- Name the auth requirement per endpoint; "authenticated" and "authorized" are different
  criteria and both need verifying.

## Reviewer hints

- Security: authorize per route, never by inheritance from a mounted router. Parameterize
  every query. Rate-limit auth endpoints. Never log request bodies containing credentials.
- Performance: watch for N+1 inside `for await`; batch or join. Add pagination before the
  table is large, not after.
- Documentation: an endpoint change updates `docs-vault/api.md` in the same change.

## Test strategy

Unit-test services with no HTTP involved. Integration-test routes against a real test
database rather than mocks — mocked persistence hides exactly the bugs these tests exist to
catch. Contract-test anything a second team consumes.
