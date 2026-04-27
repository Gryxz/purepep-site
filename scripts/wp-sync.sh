#!/usr/bin/env bash
#
# scripts/wp-sync.sh — deploy purepep-child/ to purepep.shop
#
# One-way sync of the PurePep WordPress child theme from this repo to the
# managed WordPress instance at purepep.shop. Runs rsync over the SSH/SFTP
# transport that the host exposes, with the password sourced from the
# PUREPEP_SFTP_PASSWORD environment variable (never an argument, never a
# committed file).
#
# Usage:
#   PUREPEP_SFTP_PASSWORD='...' scripts/wp-sync.sh             # live deploy
#   PUREPEP_SFTP_PASSWORD='...' scripts/wp-sync.sh --dry-run   # preview only
#   scripts/wp-sync.sh --help                                  # this banner
#
# Requirements: bash 4+, rsync, ssh, sshpass.
#
# Notes:
#  - The host (Cloudways managed WordPress) accepts the same credentials over
#    SSH and SFTP. rsync uses the SSH transport; "via SFTP" in the brief
#    refers to the password-auth path, not the wire protocol.
#  - .git, node_modules, and .DS_Store are always excluded.
#  - --delete is intentionally NOT used. Files removed locally do not get
#    purged from the host. Pass --delete via WP_SYNC_EXTRA_FLAGS if you want
#    strict mirror semantics.

set -euo pipefail

# ---------- Target -----------------------------------------------------------

readonly PP_HOST='134.209.168.98'
readonly PP_USER='master_huuvbkqrgr'
readonly PP_REMOTE='/home/master/applications/bzxzssuwrd/public_html/wp-content/themes/purepep-child/'

readonly REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly LOCAL_PATH="${REPO_ROOT}/purepep-child/"

# ---------- Argument parsing -------------------------------------------------

DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --dry-run|-n)
      DRY_RUN=1
      ;;
    -h|--help)
      sed -n '2,28p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      printf 'wp-sync: unknown argument: %s\n' "$arg" >&2
      printf 'usage: %s [--dry-run]\n' "$0" >&2
      exit 2
      ;;
  esac
done

# ---------- Preflight --------------------------------------------------------

if [[ ! -d "$LOCAL_PATH" ]]; then
  printf 'wp-sync: source directory does not exist: %s\n' "$LOCAL_PATH" >&2
  exit 1
fi

if [[ -z "${PUREPEP_SFTP_PASSWORD:-}" ]]; then
  cat >&2 <<'EOF'
wp-sync: PUREPEP_SFTP_PASSWORD is not set.

Export the deployment password before running this script. Never hardcode it
or commit it to the repo. Examples:

    export PUREPEP_SFTP_PASSWORD='...'                         # current shell
    PUREPEP_SFTP_PASSWORD="$(pass purepep/sftp)" scripts/wp-sync.sh   # pass(1)
    PUREPEP_SFTP_PASSWORD="$(op read op://...)" scripts/wp-sync.sh    # 1Password

EOF
  exit 1
fi

for cmd in rsync ssh sshpass; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    printf 'wp-sync: required command not installed: %s\n' "$cmd" >&2
    printf 'wp-sync: install with your package manager (apt/brew/dnf) and retry.\n' >&2
    exit 1
  fi
done

# ---------- Build flag list --------------------------------------------------

rsync_flags=(
  --archive
  --human-readable
  --itemize-changes
  --verbose
  --exclude='.git'
  --exclude='.git/**'
  --exclude='node_modules'
  --exclude='node_modules/**'
  --exclude='.DS_Store'
  --exclude='**/.DS_Store'
)

if (( DRY_RUN )); then
  rsync_flags+=(--dry-run)
fi

# Allow opt-in extras (e.g. --delete) through an env var so the default flag
# set stays safe.
if [[ -n "${WP_SYNC_EXTRA_FLAGS:-}" ]]; then
  # shellcheck disable=SC2206
  extra=( ${WP_SYNC_EXTRA_FLAGS} )
  rsync_flags+=( "${extra[@]}" )
fi

# ---------- Banner -----------------------------------------------------------

printf '\n'
if (( DRY_RUN )); then
  printf '=== DRY RUN — no remote changes will be made ===\n'
fi
printf 'source : %s\n' "$LOCAL_PATH"
printf 'target : %s@%s:%s\n' "$PP_USER" "$PP_HOST" "$PP_REMOTE"
printf '\n'

# ---------- Sync -------------------------------------------------------------
#
# sshpass -e reads from the SSHPASS env var, which keeps the password off the
# argument list (and therefore out of `ps`, history, and core dumps).

SSHPASS="$PUREPEP_SFTP_PASSWORD" rsync \
  "${rsync_flags[@]}" \
  -e 'sshpass -e ssh -o StrictHostKeyChecking=accept-new -o LogLevel=ERROR' \
  "$LOCAL_PATH" \
  "${PP_USER}@${PP_HOST}:${PP_REMOTE}"

printf '\n'
if (( DRY_RUN )); then
  printf '=== dry run complete — re-run without --dry-run to deploy ===\n'
else
  printf 'wp-sync: deploy complete.\n'
fi
