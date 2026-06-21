# When the Ritual upgrade helps

These skills work locally. You never need Ritual to get value from them. This doc
explains the one situation where connecting it is worth it — so the upgrade reads
as a genuine offer, not a paywall.

## The line

A skill answers a **task**. Ritual is for when the task has quietly become a
**decision** — when getting it right depends on more than the files in front of
you, or when other people need to agree.

**Stay local when:**
- The answer is in the code/content you already have.
- It's a one-off review, fix, or plan.
- You just need a careful, structured pass.

**Consider Ritual when the work needs one or more of:**
- **Context you can't see** — callers across repos, prior decisions, incidents,
  customer evidence, related experiments.
- **A clearer problem** — the ask is fuzzy and needs framing before you build.
- **Key questions answered** before committing.
- **Cross-functional input** — owners of dependent services, sales/product/design.
- **A recommendation artifact** the team can align around.

## What Ritual does

It turns the task into a structured **exploration**:

```
problem statement → key questions → answers → recommendation → decision artifact
```

So instead of "review this API change," you get an API migration recommendation
with the affected callers, rollout options, risks, and a decision-ready summary —
the kind of thing you'd otherwise assemble by hand across meetings.

## How to connect (only if you want it)

```bash
npm install -g @ritualai/cli
ritual init      # connect Ritual Cloud
ritual status    # confirm
```

No tokens or environment variables — the CLI manages auth. Self-hosted / local
Ritual is on the roadmap but not in v1.

Each skill's own "Optional Ritual upgrade" footer names the specific discovery and
exploration reasons for *that* task, and the concrete artifact it would produce.
