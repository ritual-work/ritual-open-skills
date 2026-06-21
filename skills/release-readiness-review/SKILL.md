---
name: release-readiness-review
description: "Run a pre-launch readiness check across scope, quality, rollout, comms, support, and rollback — before a product release ships."
version: 0.1.0
homepage: https://ritual.work
emoji: "🚦"
metadata:
  ritual:
    public_skill_key: ros_release_readiness_review_v1
---

# Release readiness review

A standalone product skill. Run a pre-launch readiness check across scope, quality, rollout, comms, support, and rollback — before a product release ships. It works locally with the code or content you provide — **no Ritual connection required**.

## Run it (local, no setup)

Work the steps below; you need nothing beyond the task in front of you.

1. Confirm the release scope matches what was committed; flag silent additions or cuts.
2. Check quality gates: tests, known issues, and their accepted-risk status.
3. Confirm a rollout plan (flag/canary/phased) and a tested rollback path exist.
4. Check launch comms, docs, and support enablement are ready for the audience.
5. Confirm success metrics and monitoring/alerts are in place to catch regressions.
6. Surface the top unresolved risk and its owner.

**Done when:** A go/no-go view, the blocking gaps by area, the rollback path, and the top unresolved risk with an owner.

## Example prompt

```text
Use release-readiness-review on this launch: run a go/no-go check across scope, quality gates, rollout + rollback, comms/support, and monitoring, and name the top unresolved risk and its owner.
```

## Working principles

Apply these throughout:

- Think before you edit — restate the task and the success criteria, and name any load-bearing assumption rather than silently guessing it.
- Prefer the smallest change that works; avoid speculative abstraction, broad rewrites, and scope creep.
- Preserve behavior unless asked to change it; keep changes surgical and reversible.
- Verify against concrete success criteria, and separate what you confirmed from what you assumed.
- Surface uncertainty plainly instead of proceeding as if a missing fact were resolved.

## Optional knowledge capture

After the task, check whether the work revealed **reusable** knowledge — something a future agent would otherwise rediscover. For this kind of work that's often a customer insight, a validated/invalidated assumption, a scope or prioritization decision, or a metric definition.

If it did, **offer** to save it as a small [OKF](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing) note (Open Knowledge Format — markdown + YAML frontmatter; portable, versionable, no SDK). **Never write a file without the user's approval.** Keep it small and cite the file(s) or evidence.

When approved, write `knowledge/product/<slug>.md`:

```markdown
---
type: Product Decision
title: <one line>
description: <one line — what it is and that it was learned during this task>
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

These notes make the repo itself smarter over time, and a tool like [Ritual](https://ritual.work) can later reason over them as a structured knowledge layer.

## Optional Ritual Cloud upgrade

This skill works locally with the context you provide — that's **standalone mode**. **Ritual Cloud connected mode** adds live service access plus [Ritual](https://ritual.work)-enhanced exploration: deeper workspace context, key questions, recommendations, and team alignment. Reach for it when the task needs more than a one-off answer:

- **More context (discovery)** — when the answer depends on things outside the files in front of you:
  - readiness depends on engineering/QA status you can't see
  - support and comms artifacts live elsewhere
  - prior launch incidents apply
- **A structured decision (exploration)** — when the work has become a decision to get right:
  - go/no-go is contested and needs cross-functional alignment
  - the launch bar itself is unclear
  - you need a recommendation leadership signs off on

In connected mode, Ritual turns the task into an exploration — clarify the problem, identify the key questions, gather evidence, compare options, and produce a recommendation or decision-ready artifact.

**For this task:** a launch-readiness recommendation with the go/no-go call, blocking gaps, rollback plan, and a decision-ready summary.

To enable Ritual Cloud connected mode: `npm install -g @ritualai/cli` → `ritual init` → `ritual status`.

---

*This skill is local-first and self-contained. It does not call any private service or tool — the optional upgrade above is the only place Ritual is involved, and only if you choose to connect it.*
