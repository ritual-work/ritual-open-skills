# Skill catalog

Every skill works locally with zero Ritual. Browse by what you need to do.

> Generated from the catalog — do not edit by hand.

## Start here

The 10 skills we'd reach for first:

- **api-change-review** — Review an API change for compatibility, validation, auth, error shape, idempotency, and observability, and classify it as additive, behavior-changing, or breaking.
- **backend-test-plan** — Turn a backend change into verifiable success criteria and a minimum useful test set across unit, integration, contract, and migration tests.
- **database-migration-risk-review** — Classify a database migration and surface production risks — locks, compatibility, backfills, rollback — and prefer expand-contract sequencing.
- **debug-typescript-error** — Translate a TypeScript compiler error into plain English, find the smallest type boundary at fault, and prefer the smallest safe fix over suppression.
- **generate-storybook-story** — Write Storybook stories for a component's meaningful user-facing states with minimal, readable fixtures.
- **performance-regression-triage** — Triage a performance regression from concrete evidence — latency percentiles, error rate, resource and DB metrics, recent deploys — separate symptoms from hypotheses, and recommend one measurement before one fix.
- **react-component-review** — Review a React/TypeScript component for correctness, hook safety, prop modeling, accessibility, state coverage, and minimal safe changes.
- **review-accessibility** — Check keyboard, screen-reader, contrast, focus, and semantics for a UI surface.
- **review-error-handling** — Audit failure states, retries, validation, and idempotency in the code under review.
- **review-loading-error-empty-states** — Check loading, error, empty, partial, and retry states for a UI surface.

## Engineering

### api-change-review · ⭐ v1

Review an API change for compatibility, validation, auth, error shape, idempotency, and observability, and classify it as additive, behavior-changing, or breaking.

**Example prompt**

```text
Use api-change-review on this diff: classify the change, flag breaking behavior and the callers it affects, and give me a migration + rollout plan with the tests to add.
```

**When Ritual helps:** an API migration recommendation with affected callers, rollout options, compatibility risks, and a decision-ready summary.

### backend-test-plan · ⭐ v1

Turn a backend change into verifiable success criteria and a minimum useful test set across unit, integration, contract, and migration tests.

**Example prompt**

```text
Use backend-test-plan for this change: turn it into success criteria and a minimum test set (unit, integration, contract, migration), with exact test names and the commands to run.
```

**When Ritual helps:** a test-strategy recommendation mapping each success criterion to its tests, with affected callers, risk-driven coverage, and a decision-ready summary.

### database-migration-risk-review · ⭐ v1

Classify a database migration and surface production risks — locks, compatibility, backfills, rollback — and prefer expand-contract sequencing.

**Example prompt**

```text
Use database-migration-risk-review on this migration: classify it, flag locks/compat/backfill/rollback risks, propose a safer expand-contract sequence, and the verification + monitoring.
```

**When Ritual helps:** a migration-readiness note with rollback criteria, affected services, owner input, and a launch recommendation.

### debug-typescript-error · ⭐ v1

Translate a TypeScript compiler error into plain English, find the smallest type boundary at fault, and prefer the smallest safe fix over suppression.

**Example prompt**

```text
Use debug-typescript-error on this error: explain it in plain English, find the smallest type boundary at fault, and give the smallest safe fix (no `any`/casts) plus the verify command.
```

**When Ritual helps:** a type-contract recommendation identifying the source of truth, affected call sites, and the adopted fix, with a decision-ready summary.

### generate-storybook-story · ⭐ v1

Write Storybook stories for a component's meaningful user-facing states with minimal, readable fixtures.

**Example prompt**

```text
Use generate-storybook-story for this component: write stories for its meaningful states (default, loading, empty, error, long content) with minimal fixtures, and the command to verify them.
```

**When Ritual helps:** a story-coverage recommendation listing the canonical states, fixtures, and conventions, with a decision-ready summary.

### performance-regression-triage · ⭐ v1

Triage a performance regression from concrete evidence — latency percentiles, error rate, resource and DB metrics, recent deploys — separate symptoms from hypotheses, and recommend one measurement before one fix.

**Example prompt**

```text
Use performance-regression-triage on this regression: from the latency percentiles, error rate, and recent deploys, rank the likely causes, name the first measurement to run, and the smallest likely fix.
```

**When Ritual helps:** a regression-triage recommendation with ranked hypotheses, the correlated deploy, the chosen remediation, and a decision-ready summary.

### react-component-review · ⭐ v1

Review a React/TypeScript component for correctness, hook safety, prop modeling, accessibility, state coverage, and minimal safe changes.

**Example prompt**

```text
Use react-component-review on this component: review correctness, hook-dependency risks, prop typing, accessibility, and state coverage, and give me a verdict plus a minimal patch.
```

**When Ritual helps:** a component-design recommendation with related-component findings, the chosen pattern, affected tests, and a decision-ready summary.

### review-accessibility · ⭐ v1

Check keyboard, screen-reader, contrast, focus, and semantics for a UI surface.

**Example prompt**

```text
Use review-accessibility on this component: check keyboard operation, ARIA/semantics, focus order, contrast, and announced changes, and flag each issue with the offending element.
```

**When Ritual helps:** an accessibility remediation recommendation with prioritized issues, the target WCAG level, affected components, and a decision-ready summary.

### review-error-handling · ⭐ v1

Audit failure states, retries, validation, and idempotency in the code under review.

**Example prompt**

```text
Use review-error-handling on this service: audit every error path, input validation, timeout/retry, log/metric, and idempotency, and list each gap with the file and line.
```

**When Ritual helps:** an error-handling recommendation with the chosen failure policy, affected callers, retry/idempotency rules, and a decision-ready summary.

### review-loading-error-empty-states · ⭐ v1

Check loading, error, empty, partial, and retry states for a UI surface.

**Example prompt**

```text
Use review-loading-error-empty-states on this screen: confirm a loading, error (with retry), empty, and slow-network state for every async path, and flag the ones that are missing.
```

**When Ritual helps:** a state-coverage recommendation mapping each required loading/error/empty state to its treatment, with acceptance criteria and a decision-ready summary.

## Product

### customer-problem-review

Pressure-test a stated customer problem for specificity, evidence, and whether it's a real problem worth solving — not a solution in disguise.

**Example prompt**

```text
Use customer-problem-review on this problem statement: separate problem from solution, weigh the evidence vs assumptions, and tell me the riskiest assumption to validate first.
```

**When Ritual helps:** a problem-definition recommendation with the evidence-backed problem statement, riskiest assumptions, and a validate-or-commit summary.

### mvp-scope-review

Review a proposed MVP scope for the smallest thing that tests the core hypothesis — explicit cuts, a clear learning goal, and no gold-plating.

**Example prompt**

```text
Use mvp-scope-review on this MVP: state the core hypothesis, check the scope is the smallest build that tests it, list the cuts, flag gold-plating, and name the success/kill signal.
```

**When Ritual helps:** an MVP-scope recommendation with the core hypothesis, the explicit cuts, the success/kill signal, and a decision-ready summary.

### prd-review

Review a product requirements doc for a clear problem, defined users, explicit scope and non-goals, measurable success criteria, and surfaced open questions.

**Example prompt**

```text
Use prd-review on this PRD: check it has a clear problem, specific user, explicit scope/non-goals, measurable success metrics, and surface the open questions that block a build decision.
```

**When Ritual helps:** a PRD recommendation with a sharpened problem statement, agreed scope and non-goals, success metrics, and a decision-ready summary.

### product-experiment-review

Review a product experiment plan for a falsifiable hypothesis, a decision rule set in advance, adequate power, and protection against common validity traps.

**Example prompt**

```text
Use product-experiment-review on this experiment: check the hypothesis is falsifiable, the decision rule is set in advance, it's adequately powered, and flag validity traps.
```

**When Ritual helps:** an experiment-design recommendation with the falsifiable hypothesis, pre-registered decision rule, power estimate, and a decision-ready summary.

### product-metrics-review

Review a metrics/instrumentation plan for a clear primary metric, guardrails, well-defined events, and the ability to actually answer the product question.

**Example prompt**

```text
Use product-metrics-review on this instrumentation plan: confirm one primary metric tied to the goal, guardrails, well-defined events, and that it can actually answer the product question.
```

**When Ritual helps:** a measurement recommendation with the primary metric, guardrails, event definitions, and a decision-ready summary.

### release-readiness-review

Run a pre-launch readiness check across scope, quality, rollout, comms, support, and rollback — before a product release ships.

**Example prompt**

```text
Use release-readiness-review on this launch: run a go/no-go check across scope, quality gates, rollout + rollback, comms/support, and monitoring, and name the top unresolved risk and its owner.
```

**When Ritual helps:** a launch-readiness recommendation with the go/no-go call, blocking gaps, rollback plan, and a decision-ready summary.

### roadmap-prioritization-review

Sanity-check a prioritized roadmap or backlog for a consistent ranking rationale, surfaced tradeoffs, and dependencies — before it's committed.

**Example prompt**

```text
Use roadmap-prioritization-review on this backlog: check the ranking rationale is consistent, surface hidden dependencies and what's being silently deprioritized, and flag items to scope first.
```

**When Ritual helps:** a prioritization recommendation with a consistent ranking rationale, surfaced tradeoffs and dependencies, and a decision-ready summary.

## Marketing / GTM

### content-asset-review

Review a content asset (post, page, email) for audience fit, a single clear takeaway, a strong hook and CTA, credibility, and on-brand voice.

**Example prompt**

```text
Use content-asset-review on this draft: name the audience and the one takeaway, check the hook and CTA, flag unbacked claims and filler, and give line-level fixes.
```

**When Ritual helps:** a content recommendation with the audience takeaway, the angle, proof points, and a decision-ready summary.

### conversion-path-review

Review a landing page or conversion funnel for message match, a single clear action, friction points, credibility, and the highest-leverage fix.

**Example prompt**

```text
Use conversion-path-review on this landing page: check message match, one primary action, friction points down the funnel, and name the single highest-leverage change and the metric it should move.
```

**When Ritual helps:** a conversion recommendation with ranked friction fixes, the message-match correction, and a decision-ready summary.

### growth-experiment-review

Review a growth experiment for a clear hypothesis tied to a lever, a pre-set decision rule, adequate power, and protection against vanity wins.

**Example prompt**

```text
Use growth-experiment-review on this experiment: check the hypothesis names a growth lever and effect, the decision rule is pre-set, it's powered, and a guardrail protects against a vanity win.
```

**When Ritual helps:** a growth-experiment recommendation with the lever, hypothesis, pre-set decision rule, and a decision-ready summary.

### launch-brief-review

Review a go-to-market launch brief for a clear audience, goal, message, channel plan, and success metric — and surface what's missing before launch.

**Example prompt**

```text
Use launch-brief-review on this GTM brief: check the goal is measurable, the audience and core message are clear, the channel plan has owners/dates, and surface the biggest gap.
```

**When Ritual helps:** a launch-plan recommendation with the goal, audience, core message, channel plan, success metric, and a decision-ready summary.

### lifecycle-sequence-review

Review a lifecycle or onboarding email/message sequence for a clear goal per message, the right trigger and timing, value before ask, and a working exit.

**Example prompt**

```text
Use lifecycle-sequence-review on this sequence: check each message has one job, triggers/timing are behavior-based, value comes before the ask, and exit/suppression rules exist.
```

**When Ritual helps:** a lifecycle recommendation with the per-message goals, triggers, timing, exit rules, and a decision-ready summary.

### messaging-framework-review

Review a messaging framework for audience fit, a clear hierarchy from value to proof, consistency, and resonance — before it cascades into assets.

**Example prompt**

```text
Use messaging-framework-review on this framework: check each message ladders from value to proof, is in the audience's language, and flag contradictions and parity claims.
```

**When Ritual helps:** a messaging recommendation with the value-to-proof hierarchy, audience-fit fixes, and a decision-ready summary.

### positioning-review

Review product positioning for a clear target, a sharp differentiated value, credible proof, and a named competitive alternative — not generic claims.

**Example prompt**

```text
Use positioning-review on this positioning: check for a specific target, a differentiated and provable value, a named competitive alternative, and flag the riskiest unbacked claim.
```

**When Ritual helps:** a positioning recommendation with the target, differentiated value, proof points, competitive frame, and a decision-ready summary.
