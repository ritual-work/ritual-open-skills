#!/usr/bin/env node
/**
 * sync-catalog.mjs — pulls the PUBLIC-SAFE catalog from the Ritual monorepo into
 * canonical/openclaw-catalog.json (the single input to the skill generator).
 *
 * The monorepo's emit-openclaw-catalog.mjs writes the catalog WITH the internal
 * taxonomy (`resolverMap` + per-skill `_internal`: jtbdId / leadPersona). This repo
 * is public and its generator hard-fails on those, so the copy is not a plain `cp` —
 * the internal mapping has to be stripped on the way in. That strip is exactly what
 * this script does, deterministically, so a re-sync is one command instead of a
 * hand-edit that can silently leak the taxonomy.
 *
 * Source resolution (first that exists wins):
 *   --from=<path>          explicit path to the monorepo repo root OR the catalog json
 *   RITUAL_MONOREPO=<path> monorepo repo root
 *   ../ritual-enterprise   sibling checkout (the common local layout)
 *
 * Usage: node scripts/sync-catalog.mjs [--from=<path>] [--check]
 *   --check : exit 1 if canonical/ is behind the monorepo (local freshness guard;
 *             needs the monorepo checked out, so it is NOT part of public CI).
 *
 * After a sync, ALWAYS re-render: node scripts/generate-openclaw-skills.mjs
 */
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const DEST = join(ROOT, 'canonical', 'openclaw-catalog.json');
const CATALOG_IN_MONOREPO = join('packages', 'shared-types', 'src', 'generated', 'openclaw-catalog.json');

// Public-safe header + footer. The monorepo's own `_generated` string names internal
// files and the resolver, so it is replaced (not copied) on the way into this repo.
const GENERATED =
  'Generated from the Ritual catalog; consumed by scripts/generate-openclaw-skills.mjs. ' +
  'Public-safe: internal taxonomy + server resolver are stripped; published skills carry only the opaque public_skill_key.';
const NOTE =
  'PUBLIC-SAFE catalog. The internal job/persona mapping + server-side resolver are stripped ' +
  '(they never leave the Ritual backend). Synced from the monorepo for the generator; published ' +
  'skills carry only the opaque public_skill_key.';

function fail(msg) {
  console.error(`\n❌ sync-catalog: ${msg}\n`);
  process.exit(1);
}

// Accept either the monorepo root or the catalog json itself; null if absent.
function catalogAt(where) {
  const p = isAbsolute(where) ? where : resolve(process.cwd(), where);
  if (!existsSync(p)) return null;
  const file = statSync(p).isDirectory() ? join(p, CATALOG_IN_MONOREPO) : p;
  return existsSync(file) ? file : null;
}

const EMIT_HINT =
  'In the monorepo, build shared-types and run scripts/emit-openclaw-catalog.mjs first.';

function resolveSource() {
  // An EXPLICIT source must resolve. Never quietly fall back to the sibling default —
  // syncing a public catalog from a source other than the one asked for is worse than
  // not syncing at all.
  const arg = process.argv.find((a) => a.startsWith('--from='))?.slice('--from='.length);
  for (const [where, label] of [[arg, '--from'], [process.env.RITUAL_MONOREPO, 'RITUAL_MONOREPO']]) {
    if (!where) continue;
    const file = catalogAt(where);
    if (file) return file;
    fail(`${label}=${where} does not contain ${CATALOG_IN_MONOREPO}.\n${EMIT_HINT}`);
  }
  const fallback = join(ROOT, '..', 'ritual-enterprise');
  const file = catalogAt(fallback);
  if (file) return file;
  fail(
    `could not find the monorepo catalog at ${fallback}.\n` +
      `Pass --from=/path/to/ritual-enterprise or set RITUAL_MONOREPO.\n${EMIT_HINT}`,
  );
}

const SRC = resolveSource();
const src = JSON.parse(readFileSync(SRC, 'utf8'));

if (!Array.isArray(src.skills) || !src.skills.length) fail(`${SRC} has no skills[].`);
if (!src.sourceSha) fail(`${SRC} has no sourceSha — is it the emitted catalog?`);

// --- jtbd leak tripwire ------------------------------------------------------
// This check HAS to live here, not in the generator. The generator's copy read
// `s._internal?.jtbdId` from the already-stripped catalog, so the id was always
// undefined and the check no-opped on every skill — a guard that could never fire
// (and could never fire by construction: an unstripped catalog hard-fails at load
// there instead). Sync is the only step that sees both sides, so it is the only
// place the mapping can actually be checked.
//
// What leaks: for most publishable skills the internal jtbdId DIFFERS from the
// public task name (api-change-review -> build-backend-service), and those ids are
// separately public as discovery task names. So the id string is not the secret —
// the PAIRING is. A body that names its own jtbdId hands over one row of the
// internal map.
//
// Checking the public payload (rather than rendered markdown, which does not exist
// yet at sync time) is equivalent coverage: every rendered body is composed from
// these fields plus generator-owned templates, and the templates never see a jtbd.
// Catching it here also fails the sync instead of shipping a bad catalog first.
//
// Persona is deliberately NOT substring-checked: slugs and labels are ordinary
// English ("developer", "product manager") that legitimately appears in titles and
// section text, so it false-positives. Its omission is structural — nothing outside
// `_internal` ever carries it, and the strip below is asserted.
if (!src.skills.some((s) => s._internal?.jtbdId)) {
  fail(
    `${SRC} carries no _internal.jtbdId, so the jtbd-leak tripwire cannot run.\n` +
      `Sync from the monorepo's emitted catalog (it is stripped on the way in here) — ` +
      `syncing an already-public catalog would silently skip the check.`,
  );
}
for (const s of src.skills) {
  const jtbd = s._internal?.jtbdId;
  // A jtbd that IS the public task name is the skill's own label, not a mapping.
  if (!jtbd || jtbd === s.taskName) continue;
  const { _internal, ...pub } = s;
  if (JSON.stringify(pub).includes(jtbd)) {
    fail(
      `internal jtbd id "${jtbd}" appears in the PUBLIC fields of "${s.taskName}" — ` +
        `that leaks one row of the jtbd mapping. Fix the recipe in the monorepo, re-emit, then re-sync.`,
    );
  }
}

// The strip. Deleting `_internal` per skill preserves the remaining key order, so the
// synced file stays byte-stable across re-syncs that change nothing.
const { resolverMap: _drop, _generated: _drop2, ...rest } = src;
const publicCatalog = {
  ...rest,
  _generated: GENERATED,
  skills: src.skills.map(({ _internal, ...s }) => s),
  _note: NOTE,
};
// Key order the generator's readers expect: header, counts, skills, footer note.
const ordered = {
  _generated: publicCatalog._generated,
  sourceSha: publicCatalog.sourceSha,
  skillCount: publicCatalog.skillCount,
  standaloneCount: publicCatalog.standaloneCount,
  discoveryCount: publicCatalog.discoveryCount,
  byFunction: publicCatalog.byFunction,
  skills: publicCatalog.skills,
  _note: publicCatalog._note,
};

// Belt-and-braces: never write a file that still carries the internal taxonomy.
const serialized = JSON.stringify(ordered, null, 2) + '\n';
if (/"_internal"|"resolverMap"|"jtbdId"|"leadPersona"/.test(serialized)) {
  fail('the stripped catalog still contains internal fields — refusing to write to a public repo.');
}

const current = existsSync(DEST) ? readFileSync(DEST, 'utf8') : '';
const currentSha = current ? (JSON.parse(current).sourceSha ?? '(none)') : '(absent)';

if (process.argv.includes('--check')) {
  if (current === serialized) {
    console.log(`✓ canonical/openclaw-catalog.json is current with the monorepo (sourceSha ${ordered.sourceSha}).`);
    process.exit(0);
  }
  fail(
    `canonical/openclaw-catalog.json is behind the monorepo.\n` +
      `  canonical: sourceSha ${currentSha}\n` +
      `  monorepo : sourceSha ${ordered.sourceSha} (${SRC})\n` +
      `Run: npm run resync`,
  );
}

if (current === serialized) {
  console.log(`✓ already current with the monorepo (sourceSha ${ordered.sourceSha}) — nothing to sync.`);
  process.exit(0);
}

writeFileSync(DEST, serialized);
console.log(
  `✓ synced canonical/openclaw-catalog.json from ${SRC}\n` +
    `  sourceSha ${currentSha} → ${ordered.sourceSha}\n` +
    `  ${ordered.skillCount} skills (${ordered.standaloneCount} standalone, ${ordered.discoveryCount} discovery).`,
);
console.log('  next: node scripts/generate-openclaw-skills.mjs   (rendered output is now stale)');
