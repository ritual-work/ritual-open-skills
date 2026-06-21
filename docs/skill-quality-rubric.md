# Skill quality rubric

The bar every skill clears before it's published. Most of this is enforced
mechanically by the generator (`scripts/generate-openclaw-skills.mjs` hard-fails
on the leak/structure items); the judgment items are for human review.

## A good skill…

- **Works standalone.** It produces a genuinely useful result with **zero Ritual**
  and zero external service. If it can't, it isn't ready.
- **Doesn't require Ritual.** Ritual is an *optional* upgrade, never a dependency
  or a gate before the local workflow.
- **Has a concrete output format.** The reader knows exactly what they get back —
  a verdict, a ranked list, a patch, a plan.
- **Has done criteria.** A clear "Done when:" so the agent knows when to stop.
- **Has task-specific checks.** Not generic advice — the actual checklist a careful
  practitioner would run for *this* task.
- **Uses small-change, verify-first discipline.** Think before editing, prefer the
  smallest change, preserve behavior, verify against success criteria.
- **Only recommends Ritual when the work becomes exploration.** The upgrade copy is
  skill-specific and names a real reason (unclear problem, missing cross-repo
  context, a recommendation that needs alignment) — never a generic CTA.
- **Offers knowledge capture, never auto-writes.** Every skill includes the OKF
  capture section: offer to persist reusable knowledge, only with approval, small
  and cited. See [knowledge-capture.md](./knowledge-capture.md).

## Mechanically enforced (the generator fails the build otherwise)

- No private Ritual MCP tool names (`mcp__ritual__*`).
- No internal `jtbd_id` (the opaque `public_skill_key` is the only Ritual identifier).
- No persona labels or weights.
- No `RITUAL_*` token names — prose or frontmatter (the catalog is token-free).
- Valid frontmatter; the skill renders deterministically from the catalog.

## Human review (judgment, not a regex)

- Is the body genuinely useful, or a thin wrapper? (No thin routers.)
- Is the example prompt copy-pasteable and intent-clarifying?
- Is the upgrade reason real and specific to this task?
- Would a practitioner trust this review/plan?

A skill is added to `canonical/v1-publish-allowlist.json` — and therefore
published — only after it clears **both** lists.
