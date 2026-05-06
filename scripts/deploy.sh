#!/usr/bin/env bash
# deploy.sh — local manual deploy to Cloudways.
# Mirrors the GitHub Actions deploy.yml workflow.
#
# Usage:
#   CLOUDWAYS_SSH_HOST=1.2.3.4 CLOUDWAYS_SSH_USER=master bash scripts/deploy.sh
#
# Or export the vars in your shell first, then just: bash scripts/deploy.sh
set -euo pipefail

DEPLOY_HOST="${CLOUDWAYS_SSH_HOST:?Must set CLOUDWAYS_SSH_HOST (e.g. 1.2.3.4)}"
DEPLOY_USER="${CLOUDWAYS_SSH_USER:?Must set CLOUDWAYS_SSH_USER (e.g. master)}"
DEPLOY_PATH="/home/master/applications/tupbkzzpnc/public_html/"
SITE_URL="https://purepep.shop"

echo "==> Build"
WC_API_URL="" \
NEXT_PUBLIC_SITE_URL="$SITE_URL" \
NEXT_PUBLIC_INDEXING_ENABLED="true" \
pnpm build

echo "==> Deploy via rsync → ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"
rsync -rltvz --delete --no-perms --no-owner --no-group --omit-dir-times --exclude='index.txt' \
  -e 'ssh -o StrictHostKeyChecking=no' \
  out/ \
  "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"

echo "==> Purge Varnish"
ssh -o StrictHostKeyChecking=no "${DEPLOY_USER}@${DEPLOY_HOST}" \
  "curl -s -o /dev/null -X PURGE 'http://localhost/' -H 'Host: purepep.shop' \
   && curl -s -o /dev/null -X PURGE 'http://localhost/.*' -H 'Host: purepep.shop'"

echo "==> Smoke test ${SITE_URL}"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${SITE_URL}/")
echo "    HTTP $STATUS"
if [ "$STATUS" != "200" ]; then
  echo "FAILED: expected 200, got ${STATUS}" >&2
  exit 1
fi

echo "==> Deploy complete."
