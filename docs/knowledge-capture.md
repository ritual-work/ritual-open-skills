# Knowledge capture (OKF)

A second, free value path beyond running a skill: when a task reveals **reusable**
knowledge, the skill offers to persist it as a small **Open Knowledge Format**
note — markdown + YAML frontmatter, living in ordinary files in your repo, readable
by any agent without a proprietary SDK. ([Google: Open Knowledge Format](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing))

The idea: knowledge like API conventions, service relationships, runbooks, metric
definitions, customer objections, and positioning decisions usually lives scattered
across docs, comments, wikis, and people's heads. Each skill run is a chance to
capture a piece of it once, so the next agent reads it instead of rediscovering it.

```
skill completes task
  → agent notices reusable knowledge
  → agent OFFERS to persist a small OKF note (never writes without approval)
  → future agents read it instead of rediscovering
```

## The rules

- **Optional, never required.** A skill produces its result with or without capture.
- **Only when it's genuinely reusable** — a durable convention, decision, risk,
  relationship, pattern, or insight. Not a one-off observation.
- **Always ask first.** Never write a file without the user's approval.
- **Small and cited.** A few lines, pointing at the files or evidence it came from.
- **Scoped to future agent use.** The note says what a future agent should *do* with it.

## The format

```markdown
---
type: <e.g. API Convention | Product Decision | Positioning Insight>
title: <one line>
description: <one line — what it is, learned during this task>
resource: ./path/to/file-or-evidence
tags: [..]
timestamp: <ISO 8601>
---

# Summary
<the reusable rule, in one or two lines>

# Applies to
<where it holds>

# Evidence
<the files or observations it came from>

# Use in future agent work
<what a future agent should do with it>
```

Notes live under `knowledge/<area>/` (`engineering/`, `product/`, `marketing/`, …).
See [`knowledge/`](../knowledge) for a worked example.

## Why this matters for Ritual

The notes make your repo smarter on their own. They're also an open container that
[Ritual](https://ritual.work) can later **reason over** as a structured knowledge
layer — turning a folder of captured facts into a queryable, conflict-checked,
explorable knowledge graph. OKF is the portable format; Ritual is the optional
reasoning/authority layer on top. Neither requires the other.
