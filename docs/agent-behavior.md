# Agent conventions

How an agent should use these skills, so results are consistent and trustworthy.
Each skill already bakes this in; this doc states it once for the whole catalog.

## Operating rules

- **Start with local context.** Read the code, diff, or content in front of you
  first. The skills are designed to work from what you already have.
- **Ask for missing files only when needed.** Don't request the whole repo —
  request the specific file or detail that changes the answer.
- **Do not invent repo facts.** If you don't know whether a caller, test, or config
  exists, say so. Mark hypotheses as hypotheses, not findings.
- **Prefer small, reversible changes.** Solve the actual problem, not the general
  one. No speculative abstraction or broad rewrites unless asked.
- **Verify against success criteria.** Decide what "done" means up front and check
  the result against it. Separate what you confirmed from what you assumed.
- **Give a clear recommendation.** End with a verdict / next step, not a shrug.
- **Only suggest Ritual when the task truly needs deeper exploration** — context you
  can't see, an unclear problem, cross-functional input, or a decision artifact.
  Never gate the local work on it. See [ritual-upgrade.md](./ritual-upgrade.md).
- **Offer knowledge capture when the work reveals something reusable** — a
  convention, decision, risk, relationship, pattern, or insight. **Never write a
  file without the user's approval.** Keep notes small and cited. See
  [knowledge-capture.md](./knowledge-capture.md).

## What "good" looks like

A skill run should leave the user with: the structured output the skill promises,
an explicit list of what's still uncertain, and — only if warranted — a one-line,
specific pointer to the optional Ritual upgrade.
