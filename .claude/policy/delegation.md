# Delegation

Delegate a bounded question when independent expertise or a large search justifies a
separate context. Keep small lookups and work dependent on current decisions local.
Parallelize only independent questions; combine findings before deciding.

Discovery is the default agent for behavior, reuse, test and documentation reconnaissance.
Optional specialists live in `.claude/templates/agents/`; install only those a project needs.
For high-risk independent review, use an available specialist or a bounded review agent;
if none is available, report the gap rather than silently claiming independent review.
Implementation, including tests, stays in the main session unless the user requests otherwise.

Pass the objective, relevant paths, constraints, known findings, and expected brief.
Reuse an available agent for follow-ups; do not have several agents repeat the same search.
Request findings with evidence, file paths, risks and a recommendation; cap the brief to
roughly 300 words unless the task needs more. Do not ask for exploration logs.

Claude custom agents normally inherit CLAUDE.md. Explore/Plan skip it; pass necessary
constraints explicitly when using them for literal lookups. Do not assume other harnesses
have the same inheritance rules. Keep model selection configurable; measure total task
cost and correctness before introducing a cheaper model or another delegation step.
