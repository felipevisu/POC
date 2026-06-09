#!/usr/bin/env bash
#
# Installs the poc-quiz Claude Code skill into ~/.claude/skills/poc-quiz
#
# Usage:
#   ./install.sh            # install for the current user
#   ./install.sh --uninstall
#
set -euo pipefail

SKILL_NAME="poc-quiz"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/skill"
DEST_DIR="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}/$SKILL_NAME"

if [[ "${1:-}" == "--uninstall" ]]; then
  if [[ -d "$DEST_DIR" ]]; then
    rm -rf "$DEST_DIR"
    echo "Removed $DEST_DIR"
  else
    echo "Nothing to remove at $DEST_DIR"
  fi
  exit 0
fi

if [[ ! -f "$SRC_DIR/SKILL.md" ]]; then
  echo "Error: $SRC_DIR/SKILL.md not found. Run this script from the repo root." >&2
  exit 1
fi

mkdir -p "$(dirname "$DEST_DIR")"
rm -rf "$DEST_DIR"
cp -R "$SRC_DIR" "$DEST_DIR"

echo "Installed '$SKILL_NAME' skill to $DEST_DIR"
echo "Restart Claude Code (or start a new session), then run /poc-quiz inside any POC folder."
