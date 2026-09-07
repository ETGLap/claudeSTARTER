# Requirements

Separate what was asked for from what the work professionally requires.

Under-building ships a feature that is not safe to use; over-building spends the user's
time on things they did not want. Naming the three categories out loud is what prevents
both, and it must happen before any technical decision.

- [ ] **Explicit** — what the user actually asked for. Build it.
- [ ] **Inferred** — what this class of application professionally requires (a login form
      implies hashed credentials, session expiry, and rate limiting). Build it, and say in
      the report that you did and why.
- [ ] **Optional** — what would improve it but was not implied. Name it, do not build it;
      park it in the spec's Out list or a backlog.
- [ ] Category assignments stated to the user before deciding anything technical.
- [ ] Scaled to intent: a prototype's inferred set is smaller than a production app's. Ask
      which when the request does not make it obvious.
- [ ] Nothing silently promoted — an optional item becomes inferred only by saying so.
