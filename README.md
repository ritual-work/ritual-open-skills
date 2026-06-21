# Ritual Open Skills

Free, standalone skills for coding and product/marketing agents. Each one is a
deep, self-contained prompt for a single task — **works locally, no account, no
setup, no dependency on any service.**

`✅ works with zero Ritual` · `✅ no private tool names` · `✅ token-free` ·
`✅ MIT-0` · `✅ generator-guarded (no leaks)` · `✅ clawhub publish --dry-run: ok (24/24)`

## Need to do this? Use this.

| You need to… | Skill |
| --- | --- |
| Review an API change for breaking behavior + migration risk | `api-change-review` |
| Debug a TypeScript error without reaching for `any` | `debug-typescript-error` |
| Risk-check a database migration before it ships | `database-migration-risk-review` |
| Review a React component (hooks, a11y, state, types) | `react-component-review` |
| Triage a performance regression from the evidence | `performance-regression-triage` |
| Pressure-test a PRD or an MVP scope | `prd-review`, `mvp-scope-review` |
| Sharpen product positioning or a launch brief | `positioning-review`, `launch-brief-review` |
| Review a landing page / conversion funnel | `conversion-path-review` |

**[Browse the full catalog →](./catalog.md)** (24 skills across Engineering,
Product, and Marketing/GTM, each with an example prompt).

## Start here

The ten we'd reach for first (the v1 publish set): `api-change-review` ·
`debug-typescript-error` · `database-migration-risk-review` ·
`react-component-review` · `performance-regression-triage` · `backend-test-plan` ·
`generate-storybook-story` · `review-error-handling` · `review-accessibility` ·
`review-loading-error-empty-states`.

## What a skill does to your prompt

The skills turn a vague ask into a structured one:

```text
Without the skill:
  "Review this API change."

With api-change-review:
  Classify the change; flag breaking behavior and the callers it affects;
  check validation, auth, error shape, idempotency, and observability;
  give a migration + rollout plan and the tests to add; end with a verdict.
```

Same one line from you — a complete, repeatable review back.

## Make your repo smarter (optional)

When a task reveals **reusable** knowledge — an API convention, a service
relationship, a customer objection, a positioning decision — a skill will *offer*
to save it as a small [OKF note](./docs/knowledge-capture.md) (Open Knowledge
Format: markdown + YAML frontmatter, no SDK). It never writes a file without your
approval. Over time `knowledge/` becomes a portable, agent-readable memory the next
run reads instead of rediscovering — and a layer [Ritual](https://ritual.work) can
later reason over. See [`knowledge/`](./knowledge) for the shape.

## Optional: Ritual

Skills work entirely on their own. When a task stops being a one-off answer and
becomes a **decision** — unclear problem, missing context, cross-functional input,
a recommendation that needs alignment — they can hand off to
[Ritual](https://ritual.work), which turns it into a structured exploration
(problem → key questions → answers → a decision-ready artifact). See
[docs/ritual-upgrade.md](./docs/ritual-upgrade.md). It's never required.

```bash
# only if a skill suggests it and you want it
npm install -g @ritualai/cli
ritual init      # connect Ritual Cloud
ritual status    # confirm
```

No tokens or environment variables to manage — the CLI handles auth.

## Docs

- **[catalog.md](./catalog.md)** — the full skill index, by category, with example prompts.
- **[docs/skill-quality-rubric.md](./docs/skill-quality-rubric.md)** — what makes a skill good enough to publish.
- **[docs/agent-behavior.md](./docs/agent-behavior.md)** — conventions for agents using these skills.
- **[docs/knowledge-capture.md](./docs/knowledge-capture.md)** — the OKF knowledge-capture pattern.
- **[docs/ritual-upgrade.md](./docs/ritual-upgrade.md)** — when (and when not) the optional upgrade helps.
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — how skills are generated + the promotion runbook.
- **[ROADMAP.md](./ROADMAP.md)** — where this is going.

## For maintainers

This is a **rendered distribution repo, not a source of truth.** `skills/` and
`drafts/` and the indexes are **generated** from the synced catalog — never
hand-edited. See [CONTRIBUTING.md](./CONTRIBUTING.md).

```
canonical/openclaw-catalog.json     ← synced from the Ritual monorepo
canonical/v1-publish-allowlist.json ← the curated v1 publish set (10, gated)
canonical/catalog.public.json       ← GENERATED machine index (public fields)
catalog.md                          ← GENERATED human index
skills/<task>/SKILL.md              ← GENERATED, publish-eligible
drafts/<task>/SKILL.md              ← GENERATED discovery drafts (inspection only)
```

```bash
node scripts/generate-openclaw-skills.mjs        # render everything
node scripts/generate-openclaw-skills.mjs --check # CI guard (stale / orphan / leak)
```

The generator **hard-fails** if a skill leaks a private tool name, an internal id,
a persona, or a `RITUAL_*` token — published skills carry only an opaque
`public_skill_key`.

### Publishing (owner: `ritual`)

Needs Node ≥22 and a one-time `clawhub login`. Publishes under the `ritual`
publisher org; the slug is the folder name.

```bash
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"   # clawhub needs node >=22
clawhub login                                        # device flow, once
cd ritual-open-skills
for s in $(node -p "require('./canonical/v1-publish-allowlist.json').skills.join('\n')"); do
  clawhub publish "skills/$s" --owner ritual --dry-run     # preview; drop --dry-run to go live
done
```

Or from CI: add a `CLAWHUB_TOKEN` repo secret (`clawhub login && clawhub token`),
then run the **ritual-open-skills** workflow via *Run workflow* → `mode: live`. It
publishes only the v1 allowlist under `--owner ritual` and links the GitHub source.

**Drip publisher (rate-limit aware).** ClawHub caps *new* skills at 5/hour.
`scripts/publish-drip.sh` publishes the allowlist under `--owner ritual`, **skips
anything already live** (no re-versioning), and lets the rest retry next run. Run
it on a schedule until everything is live, then stop. Example macOS launchd agent
(`~/Library/LaunchAgents/ai.ritual.openskills-publish.plist`, hourly) logs to
`~/Library/Logs/ritual-openskills-publish.log`. Stop it when done:

```bash
launchctl unload ~/Library/LaunchAgents/ai.ritual.openskills-publish.plist
```

### Known TBV (verify before first publish)

- **`public_skill_key` placement** — currently `metadata.ritual.public_skill_key`.
  `clawhub publish --dry-run` **accepts** it (all 24 skills pass), so it isn't
  rejected at validation. Still to confirm on a first real publish: that the
  registry **preserves** arbitrary `metadata.*` end-to-end (dry-run doesn't echo
  it). If it's dropped, switch `PUBLIC_KEY_PLACEMENT` in the generator and re-render.
- **dry-run vs scan** — the badge reflects `clawhub publish --dry-run` (local
  pre-publish validation). The platform's security scan (`clawhub scan`) runs
  against a *published* version, so it's part of the first-publish step, not done yet.
- **CLI auto-install** — intentionally **not** declared in
  `metadata.openclaw.install` (it would make the CLI a hard dependency and break
  standalone-first). The install lives in the upgrade footer + README only.

## License

[MIT-0](./LICENSE) — required by ClawHub, and the right fit for a free public catalog.
