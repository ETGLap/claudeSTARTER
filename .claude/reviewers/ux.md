# UX

Every state a user can reach is designed, not just the happy one.
Applies when the change is user-operable; otherwise skip.

- [ ] Loading, empty, and error states exist — not just the success path. An empty list and
      a failed fetch look different and say different things.
- [ ] Errors tell the user what to do next, not what went wrong internally. No raw
      exception text, no error code alone.
- [ ] Destructive or irreversible actions confirm first, and the confirmation names what
      will be lost.
- [ ] Form validation says which field and why, on the field, and survives a failed submit
      without discarding what was typed.
- [ ] Slow operations show progress; anything that can be optimistic says so and reconciles.
- [ ] No dead ends: every error state offers a way forward — retry, go back, or contact.
