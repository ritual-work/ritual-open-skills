# Optional Ritual upgrade — footer template

The three-layer footer the generator composes into every skill from the catalog's
`ritualDiscoveryWhen` / `ritualExplorationWhen` / `ritualArtifactExample` fields.

The framing is **exploration**, not "better discovery": Ritual is for when a task
crosses from execution into a decision that needs structure. Per the
[Ritual FAQ](https://ritual.work/faq/): structured exploration → key questions →
answers → recommendation → decision-ready artifact.

## v1 rules (load-bearing)

- **Standalone-first.** Every skill is fully useful with NO Ritual. The upgrade is
  optional and never blocks the local workflow.
- **Cloud-only upgrade in v1.** The connect path is the Ritual CLI → Ritual Cloud.
  No self-hosted / local-MCP copy in v1 (deferred).
- **Name the install** so a first-time user can't hit "command not found":
  `npm install -g @ritualai/cli`, then `ritual init`, then `ritual status`.
- **Token-free.** No `RITUAL_*` environment-variable names anywhere — not prose,
  not frontmatter.
- **No private internals.** Never name private Ritual MCP tools, internal job ids,
  or personas. The only Ritual identifier a published skill carries is its opaque
  `public_skill_key` (in machine metadata, not prose).

## Rendered shape

> **Optional Ritual upgrade**
>
> This skill works locally with the context you provide. Reach for Ritual when the
> task needs more than a one-off answer:
>
> - **More context** (discovery) — when the answer depends on things outside the
>   files in front of you: `<ritualDiscoveryWhen bullets>`.
> - **A structured decision** (exploration) — when the work has become a decision
>   to get right: `<ritualExplorationWhen bullets>`.
>
> Ritual turns the task into an exploration — define the problem, surface the key
> questions, develop answers, and produce a recommendation or decision-ready
> artifact. **For this task:** `<ritualArtifactExample>`.
>
> To enable Ritual Cloud:
> 1. `npm install -g @ritualai/cli`
> 2. `ritual init`
> 3. confirm with `ritual status`
