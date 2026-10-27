# Architecture reference

Known-good starting structures per project type. Read on demand by `/start`; **never
`@`-imported** — it must not enter the always-loaded budget.

This is a reference, not a generator. It says what a professional starting point looks like
and, just as importantly, what not to build yet. One folder structure does not fit every
project; pick the section that matches and follow its growth path as the signals appear.

## How to use this

1. Match the project type. When two fit, prefer the simpler one — you can grow into the other.
2. Create only the "Start with" directories. An empty directory is not free: it invites code
   that should not exist yet.
3. Read "Do not create". Every entry is an abstraction commonly added before it earns its
   keep, and each one costs more to remove later than to add.
4. Wire the test strategy before the first feature. That is the genesis exit condition.

---

## Static site

Marketing sites, docs, landing pages, portfolios. No server state.

- **Start with:** `src/pages/` · `src/styles/` · `public/` · one build config
- **Do not create:** a component library, a state manager, an API layer, a test suite for
  static markup, a CMS abstraction over three pages
- **Grows into:** a content collection when pages exceed ~15 or a non-developer starts
  editing; a component layer when the same markup block appears a third time
- **Test strategy:** build succeeds + links resolve. Accessibility and visual checks are
  manual and documented. Unit tests are usually the wrong tool here.

## SPA (React/Vue/Svelte + Vite)

Dashboards, internal tools, apps behind a login with a separate API.

- **Start with:** `src/components/` · `src/pages/` (or `routes/`) · `src/lib/` ·
  `src/api/` (one typed client) · `tests/`
- **Do not create:** Redux/global state before prop drilling actually hurts, a `utils/`
  dumping ground, per-feature folders while there are fewer than three features, a design
  system before the second consumer
- **Grows into:** feature folders (`src/features/<name>/`) at ~3 features; a shared UI
  package when a second app appears; route-level code splitting when the bundle gets slow
  **and you have measured it**
- **Test strategy:** unit-test `lib/` and reducers; component-test the interactive pieces;
  one end-to-end path through the primary flow. Do not test markup shape.

## Full-stack framework (Next.js, Nuxt, SvelteKit, Remix)

Products with both UI and server logic in one deployable.

- **Start with:** `app/` (or `pages/`) · `components/` · `lib/` · `server/` (or route
  handlers) · `tests/` · one `.env.example`
- **Do not create:** a hand-rolled API layer beside the framework's own, a repository
  pattern over a single table, a monorepo for one app, a DI container
- **Grows into:** `features/` when routes share domain logic; a service layer when a route
  handler exceeds ~100 lines; a queue when a request does work the user does not wait for
- **Test strategy:** unit-test `lib/` and server logic directly; integration-test route
  handlers; end-to-end the auth path and the primary flow. Server logic must be callable
  without HTTP — that is the design constraint the tests enforce.

## API service (Express, Fastify, Hono, FastAPI)

Backends with no UI of their own.

- **Start with:** `src/routes/` · `src/services/` (domain logic) · `src/db/` (schema +
  migrations) · `src/middleware/` · `tests/` · `.env.example`
- **Do not create:** GraphQL for a handful of endpoints, microservices, an ORM abstraction
  layer over the ORM, versioned routes before a second consumer, a plugin system
- **Grows into:** a `domain/` layer when services grow multi-entity logic; background jobs
  when a request does work the caller does not need; read replicas after measurement
- **Test strategy:** unit-test services with no HTTP; integration-test routes against a
  real test database, not mocks. Contract-test anything a second team consumes.

## Mobile (Expo / React Native)

- **Start with:** `app/` (expo-router) or `src/screens/` · `src/components/` · `src/lib/` ·
  `assets/` · `app.json`
- **Do not create:** a native module before a JS solution is proven insufficient, a custom
  navigator over the framework's, platform-forked screens before a real divergence, an
  offline sync engine on day one
- **Grows into:** `src/features/` at ~5 screens; `.ios.tsx`/`.android.tsx` splits only at a
  genuine platform divergence — record each one per the compatibility gate
- **Test strategy:** unit-test `lib/` and hooks; component-test screens with the native
  testing library. Device behavior (permissions, deep links, notifications) is **manual and
  documented** — do not fake it in unit tests.

## Browser game

- **Start with:** `src/` (loop · state · render · input) · `assets/` · one entry HTML
- **Do not create:** an ECS before entity count demands it, a scene-graph abstraction for
  one scene, a level editor before the game is fun, a networking layer for a single-player
  prototype
- **Grows into:** an ECS or scene system when entity types exceed ~10; asset preloading when
  load time is measurably a problem
- **Test strategy:** unit-test **pure** logic — collision math, scoring, state transitions.
  Game feel, timing, and animation are **manual verification, documented** — this is the
  case for documenting manual verification when automated tests add little value. Do not chase coverage here.

## CLI / library

- **Start with:** `src/` (public entry + internals) · `tests/` · `README` with real usage
- **Do not create:** a plugin architecture before a second consumer, config-file support
  before flags are insufficient, a logging framework for a tool that prints
- **Grows into:** subcommands when flags exceed ~7; a config file when invocations become
  unwieldy in a real workflow
- **Test strategy:** the public API is the unit under test — test it the way a caller uses
  it. High coverage is genuinely achievable here, unlike UI and games.

---

## Cross-cutting, all types

- **Environment:** `.env.example` from the first commit, real names, never real values.
- **Structure:** flat until it hurts. Nesting is easy to add and expensive to undo.
- **Boundaries:** domain logic must be callable without its transport (HTTP, UI, CLI). If
  it is not, the tests will tell you first.
- **The signal for every "grows into":** a third occurrence, or a measurement — never a
  prediction.
