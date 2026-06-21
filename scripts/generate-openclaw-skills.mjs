#!/usr/bin/env node
/**
 * generate-openclaw-skills.mjs — renders the public OpenClaw/ClawHub skill catalog
 * from the synced canonical/openclaw-catalog.json (emitted in the Ritual monorepo
 * from work-graph.ts + standalone-recipes.json — single source of truth).
 *
 * This repo is a RENDERED DISTRIBUTION, not a source of truth. Do not hand-edit
 * skills/<task>/SKILL.md — edit the monorepo recipe and re-sync the catalog.
 *
 * Each rendered skill is STANDALONE-FIRST: a deep, self-contained task prompt that
 * works with zero Ritual, with the careful-coding posture woven inline and the
 * "Optional Ritual upgrade" footer (Cloud-only in v1) at the end. Per-skill it
 * carries ONLY the opaque public_skill_key — never the internal jtbdId/persona.
 *
 * v1 publishes the curated set in canonical/v1-publish-allowlist.json (the ~25
 * standalone skills). Discovery-mode skills are deferred to v2.
 *
 * Usage: node scripts/generate-openclaw-skills.mjs [--check]
 *   --check : exit 1 if any rendered SKILL.md is stale or leaks (CI guard).
 */
import { createHash } from 'node:crypto';
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scrubPublic, detectOpenclawLeaks } from './lib/scrub-public.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const CATALOG = JSON.parse(readFileSync(join(ROOT, 'canonical', 'openclaw-catalog.json'), 'utf8'));
const ALLOWLIST = JSON.parse(
  readFileSync(join(ROOT, 'canonical', 'v1-publish-allowlist.json'), 'utf8'),
);

// Public-safe guard: this repo is public, so the synced catalog must NOT carry the
// internal job/persona mapping. If a re-sync re-introduces it, fail here (and in CI
// via --check) rather than leak the taxonomy. Sync the PUBLIC-SAFE catalog.
if (CATALOG.resolverMap || (CATALOG.skills || []).some((s) => s._internal)) {
  fail(
    'canonical/openclaw-catalog.json contains the internal mapping (_internal / resolverMap).\n' +
      'This repo is public — sync the PUBLIC-SAFE catalog (strip _internal + resolverMap).',
  );
}
const SKILLS_DIR = join(ROOT, 'skills'); // publish-eligible standalone skills (full bodies)
const DRAFTS_DIR = join(ROOT, 'drafts'); // discovery skills rendered for INSPECTION only — thin
                                         // bodies, never published until an author writes a
                                         // standalone local workflow and promotes them.
const CATALOG_MD = join(ROOT, 'catalog.md'); // generated human index (browse by category)
const CATALOG_PUBLIC = join(ROOT, 'canonical', 'catalog.public.json'); // generated machine index (public fields only)

const FUNCTION_LABEL = { development: 'Engineering', product: 'Product', marketing: 'Marketing / GTM' };
const FUNCTION_ORDER = ['development', 'product', 'marketing'];

const VERSION = '0.1.0'; // semver for every skill this release (single constant).

// Where the opaque public_skill_key rides in frontmatter. PLACEMENT IS TBV until
// validated against the `clawhub` CLI — `metadata.ritual.*` is the preferred form
// (decision 3); if the validator rejects arbitrary metadata namespaces, switch to
// 'openclaw-config' (metadata.openclaw.config) or 'skillKey'. One-line swap here.
const PUBLIC_KEY_PLACEMENT = 'metadata-ritual'; // 'metadata-ritual' | 'openclaw-config'

const PRINCIPLES = [
  'Think before you edit — restate the task and the success criteria, and name any load-bearing assumption rather than silently guessing it.',
  'Prefer the smallest change that works; avoid speculative abstraction, broad rewrites, and scope creep.',
  'Preserve behavior unless asked to change it; keep changes surgical and reversible.',
  'Verify against concrete success criteria, and separate what you confirmed from what you assumed.',
  'Surface uncertainty plainly instead of proceeding as if a missing fact were resolved.',
];

// Optional knowledge-capture (OKF) — a uniform post-task behavior woven into every
// skill: offer to persist REUSABLE knowledge as a small Open Knowledge Format note
// (markdown + YAML frontmatter; portable, no SDK), ALWAYS with user approval. The
// "what kind of knowledge" + the knowledge/ subfolder are tailored per function.
const KNOWLEDGE = {
  development: {
    area: 'knowledge/engineering/',
    kinds: 'a durable convention, an architectural decision, a recurring risk, a system/service relationship, or a rollout/testing pattern',
    exampleType: 'API Convention',
  },
  product: {
    area: 'knowledge/product/',
    kinds: 'a customer insight, a validated/invalidated assumption, a scope or prioritization decision, or a metric definition',
    exampleType: 'Product Decision',
  },
  marketing: {
    area: 'knowledge/marketing/',
    kinds: 'a customer insight or objection, a positioning/messaging decision, a proof point, or a channel/launch lesson',
    exampleType: 'Positioning Insight',
  },
};

function knowledgeCapture(s) {
  const k = KNOWLEDGE[s.function] ?? KNOWLEDGE.development;
  // NOTE: timestamp is a PLACEHOLDER (`<ISO 8601>`) on purpose — a literal date
  // would be stripped by scrubPublic's date scrub.
  return [
    '## Optional knowledge capture',
    '',
    `After the task, check whether the work revealed **reusable** knowledge — something a future agent would otherwise rediscover. For this kind of work that's often ${k.kinds}.`,
    '',
    'If it did, **offer** to save it as a small [OKF](https://cloud.google.com/blog/products/data-analytics/how-the-open-knowledge-format-can-improve-data-sharing) note (Open Knowledge Format — markdown + YAML frontmatter; portable, versionable, no SDK). **Never write a file without the user\'s approval.** Keep it small and cite the file(s) or evidence.',
    '',
    `When approved, write \`${k.area}<slug>.md\`:`,
    '',
    '```markdown',
    '---',
    `type: ${k.exampleType}`,
    'title: <one line>',
    'description: <one line — what it is and that it was learned during this task>',
    'resource: ./path/to/file-or-evidence',
    'tags: [..]',
    'timestamp: <ISO 8601>',
    '---',
    '',
    '# Summary',
    '<the reusable rule, in one or two lines>',
    '',
    '# Applies to',
    '<where it holds>',
    '',
    '# Evidence',
    '<the files or observations it came from>',
    '',
    '# Use in future agent work',
    '<what a future agent should do with it>',
    '```',
    '',
    'These notes make the repo itself smarter over time, and a tool like [Ritual](https://ritual.work) can later reason over them as a structured knowledge layer.',
  ].join('\n');
}

function fail(msg) {
  console.error(`\n❌ generate-openclaw-skills: ${msg}\n`);
  process.exit(1);
}

function frontmatter(skill) {
  const lines = [
    '---',
    `name: ${skill.taskName}`,
    `description: ${JSON.stringify(skill.summary)}`,
    `version: ${VERSION}`,
    `homepage: https://ritual.work`,
  ];
  if (skill.emoji) lines.push(`emoji: ${JSON.stringify(skill.emoji)}`);
  if (PUBLIC_KEY_PLACEMENT === 'openclaw-config') {
    lines.push('metadata:', '  openclaw:', '    config:', `      ritual_public_skill_key: ${skill.publicSkillKey}`);
  } else {
    lines.push('metadata:', '  ritual:', `    public_skill_key: ${skill.publicSkillKey}`);
  }
  lines.push('---');
  return lines.join('\n');
}

function upgradeFooter(s) {
  const disc = (s.ritualDiscoveryWhen ?? []).map((b) => `  - ${b}`).join('\n');
  const expl = (s.ritualExplorationWhen ?? []).map((b) => `  - ${b}`).join('\n');
  const lines = [
    '## Optional Ritual Cloud upgrade',
    '',
    "This skill works locally with the context you provide — that's **standalone mode**. **Ritual Cloud connected mode** adds live service access plus [Ritual](https://ritual.work)-enhanced exploration: deeper workspace context, key questions, recommendations, and team alignment. Reach for it when the task needs more than a one-off answer:",
    '',
    '- **More context (discovery)** — when the answer depends on things outside the files in front of you:',
    disc,
    '- **A structured decision (exploration)** — when the work has become a decision to get right:',
    expl,
    '',
    'In connected mode, Ritual turns the task into an exploration — clarify the problem, identify the key questions, gather evidence, compare options, and produce a recommendation or decision-ready artifact.',
  ];
  if (s.ritualArtifactExample) lines.push('', `**For this task:** ${s.ritualArtifactExample}.`);
  lines.push(
    '',
    'To enable Ritual Cloud connected mode: `npm install -g @ritualai/cli` → `ritual init` → `ritual status`.',
  );
  return lines.join('\n');
}

function renderSkill(s) {
  const steps = s.recipe.map((r, i) => `${i + 1}. ${r}`).join('\n');
  const body = [
    frontmatter(s),
    '',
    `# ${s.title}`,
    '',
    `A standalone ${s.function} skill. ${s.summary} It works locally with the code or content you provide — **no Ritual connection required**.`,
    '',
    '## Run it (local, no setup)',
    '',
    'Work the steps below; you need nothing beyond the task in front of you.',
    '',
    steps,
    '',
    `**Done when:** ${s.doneCriteria}`,
    '',
    ...(s.examplePrompt
      ? ['## Example prompt', '', '```text', s.examplePrompt, '```', '']
      : []),
    '## Working principles',
    '',
    'Apply these throughout:',
    '',
    PRINCIPLES.map((p) => `- ${p}`).join('\n'),
    '',
    knowledgeCapture(s),
    '',
    upgradeFooter(s),
    '',
    '---',
    '',
    '*This skill is local-first and self-contained. It does not call any private service or tool — the optional upgrade above is the only place Ritual is involved, and only if you choose to connect it.*',
    '',
  ].join('\n');

  // Belt-and-suspenders: scrub internal authoring surface, then HARD-FAIL on any
  // forbidden public leak (private tool names, RITUAL_* tokens, internal paths).
  // tidy:false preserves YAML/nested-list indentation (the content is authored
  // clean, so the cosmetic whitespace collapse would only corrupt it).
  const scrubbed = scrubPublic(body, { tidy: false });
  const leaks = detectOpenclawLeaks(scrubbed);
  if (leaks.length) fail(`leak(s) in skill "${s.taskName}":\n  - ${leaks.join('\n  - ')}`);
  assertNoInternalTokens(scrubbed, s);
  return scrubbed;
}

// Tripwire for the internal jtbd id appearing publicly — EXCEPT when it's also
// this skill's own public task name (a job name like `add-tests` is the public
// label, not a leaked mapping key). jtbd slugs are distinctive hyphenated tokens,
// so substring-matching is safe here.
//
// Persona is NOT substring-checked: omission is STRUCTURAL (no renderer ever emits
// `s._internal`), and persona slugs/labels are common English words ("developer",
// "designer") that legitimately appear in section text — matching them would
// false-positive. If a renderer is ever changed to emit persona, that's a code
// review concern, not a string scan.
function assertNoInternalTokens(md, s) {
  const jtbd = s._internal?.jtbdId;
  if (jtbd && jtbd !== s.taskName && md.includes(jtbd)) {
    fail(`internal jtbd id "${jtbd}" leaked into "${s.taskName}".`);
  }
}

// A discovery skill has no authored standalone body yet — render a clearly-marked
// DRAFT (for inspection / authoring), never publish-eligible. Shows the job + what
// a full Ritual exploration produces (sections = capability, NOT persona).
function renderDraft(s) {
  const sections = (s.sections ?? []).map((x) => `- ${x}`).join('\n');
  const body = [
    '---',
    `name: ${s.taskName}`,
    `description: ${JSON.stringify(`DRAFT — ${s.title} (pending a standalone local workflow before publish).`)}`,
    `version: ${VERSION}`,
    `homepage: https://ritual.work`,
    'metadata:',
    '  ritual:',
    `    public_skill_key: ${s.publicSkillKey}`,
    '    status: draft',
    '---',
    '',
    `# ${s.title} — DRAFT (not in the v1 publish set)`,
    '',
    '> **Draft for inspection.** This skill does not yet have an authored, standalone',
    "> local workflow, so it is **not** publish-eligible. It's here as raw material:",
    '> the job, and what a full Ritual exploration produces. Author a standalone',
    '> local recipe (a real, useful-without-Ritual workflow) before promoting it to',
    `> the publish set.`,
    '',
    '## What a full exploration produces',
    '',
    s.deliverableTemplate ? `A **${s.deliverableTemplate}**. This lens contributes:` : 'This lens contributes:',
    '',
    sections || '- (sections pending)',
    '',
    s.composedSectionCount
      ? `*The full deliverable composes ${s.composedSectionCount} sections across every contributing lens.*`
      : '',
    '',
    '## Optional Ritual upgrade',
    '',
    'When this becomes a real decision, [Ritual](https://ritual.work) turns it into a structured exploration — problem → key questions → answers → a recommendation or decision-ready artifact.',
    '',
    'To enable Ritual Cloud: `npm install -g @ritualai/cli`, then `ritual init`, then `ritual status`.',
    '',
  ]
    .filter((l) => l !== '' || true) // keep blank lines for markdown
    .join('\n');
  const scrubbed = scrubPublic(body, { tidy: false });
  const leaks = detectOpenclawLeaks(scrubbed);
  if (leaks.length) fail(`leak(s) in draft "${s.taskName}":\n  - ${leaks.join('\n  - ')}`);
  assertNoInternalTokens(scrubbed, s);
  return scrubbed;
}

// --- generated indexes (human catalog.md + machine catalog.public.json) -----
// PUBLIC fields only: no _internal (jtbdId/persona). The artifact example doubles
// as the "when Ritual helps" reason.
function buildCatalogPublic(standalone, allow) {
  const entries = standalone.map((s) => ({
    name: s.taskName,
    title: s.title,
    category: FUNCTION_LABEL[s.function] ?? s.function,
    summary: s.summary,
    examplePrompt: s.examplePrompt ?? null,
    publicSkillKey: s.publicSkillKey,
    ritualUpgrade: s.ritualArtifactExample ?? null,
    publishStatus: allow.has(s.taskName) ? 'v1-allowlisted' : 'candidate',
  }));
  return JSON.stringify(
    {
      _generated: 'DO NOT EDIT — generated by scripts/generate-openclaw-skills.mjs. Public fields only.',
      count: entries.length,
      allowlisted: entries.filter((e) => e.publishStatus === 'v1-allowlisted').length,
      skills: entries,
    },
    null,
    2,
  ) + '\n';
}

function buildCatalogMd(standalone, allow) {
  const L = [];
  L.push('# Skill catalog', '');
  L.push('Every skill works locally with zero Ritual. Browse by what you need to do.', '');
  L.push('> Generated from the catalog — do not edit by hand.', '');
  // Start here = the v1 publish set.
  const starters = standalone.filter((s) => allow.has(s.taskName));
  if (starters.length) {
    L.push('## Start here', '', `The ${starters.length} skills we'd reach for first:`, '');
    for (const s of starters) L.push(`- **${s.taskName}** — ${s.summary}`);
    L.push('');
  }
  for (const fn of FUNCTION_ORDER) {
    const group = standalone.filter((s) => s.function === fn);
    if (!group.length) continue;
    L.push(`## ${FUNCTION_LABEL[fn] ?? fn}`, '');
    for (const s of group) {
      const star = allow.has(s.taskName) ? ' · ⭐ v1' : '';
      L.push(`### ${s.taskName}${star}`, '');
      L.push(s.summary, '');
      if (s.examplePrompt) L.push('**Example prompt**', '', '```text', s.examplePrompt, '```', '');
      if (s.ritualArtifactExample) L.push(`**When Ritual helps:** ${s.ritualArtifactExample}.`, '');
    }
  }
  return L.join('\n');
}

// --- render EVERYTHING (standalone -> skills/, discovery -> drafts/) ---------
const standalone = CATALOG.skills.filter((s) => s.mode === 'standalone').sort((a, b) => a.taskName.localeCompare(b.taskName));
const discovery = CATALOG.skills.filter((s) => s.mode === 'discovery').sort((a, b) => a.taskName.localeCompare(b.taskName));
const renderedSkills = standalone.map((s) => ({ taskName: s.taskName, md: renderSkill(s) }));
const renderedDrafts = discovery.map((s) => ({ taskName: s.taskName, md: renderDraft(s) }));

// --- publish-readiness gate (the ALLOWLIST) --------------------------------
// Every allowlisted skill MUST be a rendered standalone skill (full body, leak-
// clean). renderSkill already hard-fails on leak / missing upgrade copy, so being
// rendered IS the standalone-usefulness + no-leak + upgrade-copy gate.
const standaloneNames = new Set(standalone.map((s) => s.taskName));
for (const name of ALLOWLIST.skills) {
  if (!standaloneNames.has(name)) {
    fail(`v1-publish-allowlist names "${name}" but it is not a rendered standalone skill (publish stays blocked).`);
  }
}

function checkTree(dir, label, rendered) {
  let stale = 0;
  for (const r of rendered) {
    const p = join(dir, r.taskName, 'SKILL.md');
    const cur = existsSync(p) ? readFileSync(p, 'utf8') : '';
    if (cur !== r.md) { console.error(`  stale: ${label}/${r.taskName}/SKILL.md`); stale++; }
  }
  const onDisk = existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
    : [];
  const want = new Set(rendered.map((r) => r.taskName));
  for (const d of onDisk) if (!want.has(d)) { console.error(`  orphan: ${label}/${d}/`); stale++; }
  return stale;
}

const allow = new Set(ALLOWLIST.skills);
const catalogMd = buildCatalogMd(standalone, allow);
const catalogPublic = buildCatalogPublic(standalone, allow);

if (process.argv.includes('--check')) {
  let stale = checkTree(SKILLS_DIR, 'skills', renderedSkills) + checkTree(DRAFTS_DIR, 'drafts', renderedDrafts);
  for (const [p, want, label] of [[CATALOG_MD, catalogMd, 'catalog.md'], [CATALOG_PUBLIC, catalogPublic, 'canonical/catalog.public.json']]) {
    if ((existsSync(p) ? readFileSync(p, 'utf8') : '') !== want) { console.error(`  stale: ${label}`); stale++; }
  }
  if (stale) fail(`${stale} file(s) out of sync. Run: node scripts/generate-openclaw-skills.mjs`);
  console.log(
    `✓ in sync: ${renderedSkills.length} skills + ${renderedDrafts.length} drafts + indexes. Publish set: ${ALLOWLIST.skills.length} (gated).`,
  );
  process.exit(0);
}

// fresh render — clear both trees, then write
for (const [dir, rendered] of [[SKILLS_DIR, renderedSkills], [DRAFTS_DIR, renderedDrafts]]) {
  if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
  for (const r of rendered) {
    const d = join(dir, r.taskName);
    mkdirSync(d, { recursive: true });
    writeFileSync(join(d, 'SKILL.md'), r.md);
  }
}
writeFileSync(CATALOG_MD, catalogMd);
writeFileSync(CATALOG_PUBLIC, catalogPublic);
const sha = createHash('sha256')
  .update([...renderedSkills, ...renderedDrafts].map((r) => r.md).join('\0'))
  .digest('hex')
  .slice(0, 12);
console.log(
  `✓ generated ${renderedSkills.length} standalone skills + ${renderedDrafts.length} discovery drafts (sha ${sha}) from catalog ${CATALOG.sourceSha}.`,
);
console.log(`  publish set (${ALLOWLIST.skills.length}, gated): ${ALLOWLIST.skills.join(', ')}`);
