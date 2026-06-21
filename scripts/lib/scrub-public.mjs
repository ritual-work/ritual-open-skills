/**
 * scrubPublic — public-hygiene scrub shared by every PUBLIC skill/catalog emitter
 * (the agent-skill bundler in apps/mcp/scripts/build-agent-skills.mjs AND the
 * OpenClaw/ClawHub catalog generator).
 *
 * The canonical skill + authored recipes may carry internal authoring context (CI
 * markers, dated postmortems, private-doc pointers, codenames) that is valuable
 * in-repo but must NOT ship to a PUBLIC artifact. This strips that surface while
 * preserving the agent-runtime contract. Conservative by design: when unsure,
 * neutralize the leak token rather than rewrite the sentence.
 *
 * NOTE: this does NOT strip `mcp__ritual__*` tool names (load-bearing for the
 * private `ritual` skill). The OpenClaw generator layers an ADDITIONAL public-copy
 * allowlist on top (no jtbd_id / persona / RITUAL_* / mcp__ritual__ — see
 * detectOpenclawLeaks) because those skills must be fully self-contained.
 *
 * `opts.tidy` (default true) runs a cosmetic whitespace collapse that is SAFE for
 * prose but CORRUPTS significant indentation (YAML frontmatter, nested markdown
 * lists). Generated, already-clean skills pass `{ tidy: false }` to preserve it.
 */
export function scrubPublic(md, { tidy = true } = {}) {
	let out = md;
	// 1. Internal CI / authoring HTML comments — invisible to agents, but carry
	//    dates, PR refs, change history.
	out = out.replace(/<!--[\s\S]*?-->[ \t]*\n?/g, '');
	// 2. Pointers to PRIVATE internal architecture docs — dead links in public,
	//    and they leak the monorepo's doc structure.
	out = out.replace(
		/`?documents\/architecture\/[A-Za-z0-9._/-]*`?/g,
		"Ritual's internal architecture notes",
	);
	out = out.replace(
		/\(?\b(?:audit-suite|okf-grounding-policy|selection-cursor-pattern|loud-fallback-escalation|unchosen-options-discovery-worktrees)\.md\b[^)\n]*\)?/g,
		'internal Ritual docs',
	);
	// 3. Internal tooling/guard scripts.
	out = out.replace(/`?scripts\/[A-Za-z0-9._-]+\.(?:mjs|js|ts)`?/g, 'an internal guard');
	// 4. Internal monorepo source paths.
	out = out.replace(/`?apps\/(?:cli|api|mcp)\/[A-Za-z0-9._/-]*`?/g, 'the Ritual monorepo');
	// 5. Internal codename for the web surface → public name.
	out = out
		.replace(/\bthe Spark UI\b/g, 'the Ritual web app')
		.replace(/\bSpark UI\b/g, 'the Ritual web app')
		.replace(/\bSpark\b/g, 'the Ritual web app')
		.replace(/\bthe the Ritual web app\b/g, 'the Ritual web app')
		.replace(/\bthe Ritual web app UI\b/g, 'the Ritual web app');
	// 6. Internal person / workspace names from postmortems.
	out = out.replace(/\bEiman\b/g, 'a user').replace(/`?\bnebula\b`?/g, 'a workspace');
	// 7. Date-stamped postmortem tags.
	out = out.replace(
		/\s*\((?:observed |as of |since |added |fixed |shipped )?20\d{2}-\d{2}-\d{2}[^)]*\)/g,
		'',
	);
	out = out.replace(/\s+\b(?:before|after|on|since|as of|in)\s+20\d{2}-\d{2}-\d{2}\b/g, '');
	out = out.replace(/\s*\b20\d{2}-\d{2}-\d{2}\b/g, '');
	out = out.replace(/\bPR #\d+\b/g, 'an earlier change');
	// 8. Generic-ize an internal-flavored example; expand an internal abbreviation.
	out = out.replace(/Reduce T2 churn in Q3/g, 'Add CSV export to the reports page');
	out = out.replace(/\bKG\b/g, 'knowledge graph');
	// tidy artifacts from removals — cosmetic only, and UNSAFE for significant
	// whitespace (YAML / nested lists), so opt-out for structured generated docs.
	if (tidy) out = out.replace(/[ \t]{2,}/g, ' ').replace(/ +([.,;:])/g, '$1');
	return out;
}

/**
 * scrubOpenclaw — the ADDITIONAL public-copy allowlist for ClawHub skills, run
 * AFTER scrubPublic. ClawHub skills must be fully self-contained + token-free, so
 * this also strips the private bridge identifiers that the `ritual` skill is
 * allowed to keep. The only Ritual identifier permitted in an emitted OpenClaw
 * SKILL.md is the opaque public_skill_key.
 *
 * Returns { md, leaks } — `leaks` is the list of forbidden tokens found (the
 * generator/CI fails when non-empty rather than silently neutralizing, because a
 * leak here means an authoring bug upstream).
 */
export function detectOpenclawLeaks(md) {
	const PATTERNS = [
		{ name: 'mcp__ritual__ tool name', re: /mcp__ritual__[A-Za-z0-9_]*/g },
		{ name: 'RITUAL_* env/token name', re: /\bRITUAL_[A-Z0-9_]+/g },
		{ name: 'internal monorepo path', re: /\bapps\/(?:cli|api|mcp)\//g },
	];
	const leaks = [];
	for (const p of PATTERNS) {
		const m = md.match(p.re);
		if (m) leaks.push(`${p.name}: ${[...new Set(m)].join(', ')}`);
	}
	return leaks;
}
