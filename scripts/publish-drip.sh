#!/usr/bin/env bash
# publish-drip.sh — publish the v1 allowlist to ClawHub, respecting the
# "max 5 new skills / hour" registry cap.
#
# Idempotent + self-draining: skips any skill already live under the org, so it
# never re-versions; publishes the rest until the hourly cap, and the remainder
# simply retry on the next run. Once every allowlisted skill is live, every run
# is a fast no-op — unload the launchd job then (see README).
#
# Requires: node >=22 on PATH, the `clawhub` CLI, and a prior `clawhub login`.
set -uo pipefail

export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:$PATH"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO" || exit 1

OWNER="ritual"
echo "=== publish-drip $(date -u +%FT%TZ) (owner=$OWNER) ==="

command -v clawhub >/dev/null 2>&1 || { echo "ERROR: clawhub not on PATH"; exit 1; }
clawhub whoami >/dev/null 2>&1 || { echo "ERROR: not logged in — run \`clawhub login\` once"; exit 1; }

owner_of() { # prints the owner handle of a published slug, or empty
  clawhub inspect "$1" --json 2>/dev/null \
    | node -pe "try{JSON.parse(require('fs').readFileSync(0,'utf8')).owner?.handle||''}catch(e){''}" 2>/dev/null
}

allow="$(node -p "require('./canonical/v1-publish-allowlist.json').skills.join('\n')")"
todo=0; done=0; limited=0
for s in $allow; do
  if [ "$(owner_of "$s")" = "$OWNER" ]; then
    echo "[$s] already live under $OWNER — skip"; done=$((done + 1)); continue
  fi
  todo=$((todo + 1))
  out="$(clawhub publish "skills/$s" --owner "$OWNER" 2>&1)"
  # show the meaningful line (published / already / rate limit), not a stack tail
  line="$(echo "$out" | grep -ioE 'published [^ ]+@[0-9.]+|already published|max 5 new skills per hour' | head -1)"
  echo "[$s] ${line:-$(echo "$out" | tail -1)}"
  echo "$out" | grep -qi 'rate limit' && limited=$((limited + 1))
done

echo "summary: live=$done attempted=$todo rate-limited=$limited"
[ "$limited" -gt 0 ] && echo "rate-limited — will retry next run." \
  || echo "nothing pending — all allowlisted skills are live; safe to unload the job."
