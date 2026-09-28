#!/usr/bin/env bash
# Workshop reproduction for the catalog minimum-rating filter report.
# RED (exit 1) while the defect is present, GREEN (exit 0) once it is fixed.
# Cross-platform alternative: node .github/skills/diagnosing-bugs/scripts/feedback-loop.mjs --runs 3 -- npm run test:filter-bug
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
exec node .github/skills/diagnosing-bugs/scripts/feedback-loop.mjs --runs "${RUNS:-3}" -- npm run --silent test:filter-bug
