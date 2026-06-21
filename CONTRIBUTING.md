# Contributing to ritual-open-skills

This is a **rendered distribution repo.** The source of truth is the **Ritual
monorepo** (`packages/shared-types/src/data/standalone-recipes.json` +
`work-graph.ts`). Everything under `skills/` and `drafts/` here is **generated** —
you never hand-edit it.

## Directory roles

| Path | Role |
| --- | --- |
| `skills/` | **Generated** ClawHub skill folders — full standalone bodies. Publish-eligible. **Do not edit by hand.** |
| `drafts/` | **Generated** previews of discovery-mode skills, clearly marked `DRAFT`. Inspection only — they have no standalone body yet, so they're never published. **Do not edit by hand.** |
| `canonical/` | The synced `openclaw-catalog.json` + the `v1-publish-allowlist.json` (what actually publishes). |
| `merge-sources/` | Build-time templates (principles, upgrade footer) the generator folds in. **Not** runtime dependencies the skills reference. |

> **Where do I "draft" a skill body, then?** Not in `drafts/` (it's regenerated and
> wiped on every run). A skill's durable body lives in the monorepo recipe. To
> author or improve one, edit `standalone-recipes.json` in the monorepo — that's
> the candidate-authoring surface. `drafts/` here just shows which jobs exist
> without a standalone body yet, as a worklist.

## The loop

```
draft (preview)  →  review  →  standalone recipe in the monorepo source
  →  regenerate catalog + rendered skills  →  add to allowlist  →  validate  →  publish
```

1. **Pick a candidate.** Browse `drafts/` for a discovery skill worth promoting (or
   identify a brand-new task).
2. **Author the standalone body in the monorepo.** Add/extend the entry in
   `packages/shared-types/src/data/standalone-recipes.json` with `surfaces:
   ["openclaw"]` — a real, *useful-with-zero-Ritual* recipe + `doneCriteria` + the
   `ritualDiscoveryWhen` / `ritualExplorationWhen` / `ritualArtifactExample` fields.
   (A brand-new task may also need a `jtbd_id` in `work-graph.ts`.)
3. **Regenerate + sync.** In the monorepo: build shared-types, run
   `emit-openclaw-catalog.mjs`. Copy the refreshed `openclaw-catalog.json` into
   `canonical/` here, then run `node scripts/generate-openclaw-skills.mjs`.
4. **Review the rendered skill** in `skills/<task>/SKILL.md`.
5. **Allowlist only after review.** Add the `taskName` to
   `canonical/v1-publish-allowlist.json`. A skill can exist in the catalog and stay
   unpublished indefinitely — the allowlist is the publish gate.
6. **Validate.** `node scripts/generate-openclaw-skills.mjs --check` (stale / orphan
   / leak), then `clawhub validate` once the CLI is wired.
7. **Draft-publish to ClawHub first**, confirm the listing, then publish live.

## The five rules

1. **Never hand-edit `skills/<task>/SKILL.md`** (or `drafts/`). Generated output only.
2. **Candidate bodies are authored in the monorepo source** (`standalone-recipes.json`),
   then *previewed* here — not written directly into the rendered repo.
3. **Promotion requires a source-of-truth update.** Once approved, the durable
   fields live in the monorepo recipe/catalog, never only in the rendered repo.
4. **The allowlist controls publish.** In the catalog ≠ published. A skill publishes
   only when its `taskName` is in `canonical/v1-publish-allowlist.json`.
5. **Run the safety checks before allowlisting** (below).

## Publish checklist (every allowlisted skill)

- [ ] **Works with zero Ritual** — a complete local workflow + `Done when:`, no Ritual gate before it. Not a thin router.
- [ ] **No private Ritual MCP tool names** (`mcp__ritual__*`).
- [ ] **No internal `jtbd_id`** in the published text (the opaque `public_skill_key` is the only Ritual identifier).
- [ ] **No persona labels or weights.**
- [ ] **No `RITUAL_*` tokens** anywhere — prose or frontmatter (v1 is token-free).
- [ ] **A concrete, skill-specific Ritual upgrade footer** — names a discovery *and* an exploration reason, plus a concrete decision-ready artifact (not a generic CTA).
- [ ] **CLI setup appears only as optional upgrade copy** (`npm install -g @ritualai/cli` → `ritual init` → `ritual status`).

The generator **hard-fails** on the leak/structure items, so a skill that renders
and passes `--check` has already cleared most of this list mechanically — the human
review is for usefulness, the upgrade copy, and the not-a-thin-router judgment.
