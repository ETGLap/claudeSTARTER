# Performance

Optimize what is measured, on paths that matter.
Applies when the change touches hot paths, queries, loops over data, or payload sizes;
otherwise skip and note.

- [ ] No N+1 or repeated queries — batch or join instead.
- [ ] No work inside loops that can be hoisted or precomputed.
- [ ] Unbounded data has pagination, limits, or streaming.
- [ ] Optimization justified by a measurement, not a hunch (`reviewers/quality.md`).
- [ ] Caching, if added, has a clear invalidation story.
