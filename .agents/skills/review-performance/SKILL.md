---
name: review-performance
description: Performance gates for changes that touch hot paths, database queries, loops over data, or payload sizes — N+1 detection, work hoisting, unbounded result sets, cache invalidation, and the rule that optimization follows measurement.
when_to_use: The change adds or edits a query, iterates over a collection that can grow, touches a request path called at high frequency, returns a list without a limit, or introduces caching.
---

# Performance

Optimize what is measured, on paths that matter.
Applies when the change touches hot paths, queries, loops over data, or payload sizes;
otherwise skip and note.

- [ ] No N+1 or repeated queries — batch or join instead.
- [ ] No work inside loops that can be hoisted or precomputed.
- [ ] Unbounded data has pagination, limits, or streaming.
- [ ] Optimization justified by a measurement, not a hunch.
- [ ] Caching, if added, has a clear invalidation story.
