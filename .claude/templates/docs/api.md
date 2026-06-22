# API

> The contract surface. Link tables to [[database]] and flows to [[architecture]].

## Conventions

Base URL, auth scheme, versioning, error format.

## Endpoints

### `<METHOD> /path`

- **Purpose:** what it does.
- **Auth:** required role / token.
- **Request:** params / body (with types).
- **Response:** shape + status codes.
- **Example:**

```http
<METHOD> /path
{ "field": "value" }
```

## Errors

Standard error codes and their meaning.
