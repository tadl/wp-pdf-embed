#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
NEW_VERSION=${1:-}
MAIN_FILE="$PROJECT_DIR/wp-pdf-embed.php"
BLOCK_FILE="$PROJECT_DIR/block/block.json"
ASSET_FILE="$PROJECT_DIR/block/editor.asset.php"
README_FILE="$PROJECT_DIR/readme.txt"

if [[ ! "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z.-]+)?$ ]]; then
	echo "Usage: $0 VERSION" >&2
	echo "Example: $0 1.0.1" >&2
	exit 1
fi

CURRENT_VERSION=$(sed -n 's/^ \* Version:[[:space:]]*//p' "$MAIN_FILE" | head -n 1)
if [[ -z "$CURRENT_VERSION" ]]; then
	echo "Could not read the current version from wp-pdf-embed.php" >&2
	exit 1
fi

CONSTANT_VERSION=$(sed -n "s/^define( 'WP_PDF_EMBED_VERSION', '\([^']*\)' );/\1/p" "$MAIN_FILE")
BLOCK_VERSION=$(sed -n 's/^[[:space:]]*"version":[[:space:]]*"\([^"]*\)".*/\1/p' "$BLOCK_FILE")
ASSET_VERSION=$(sed -n "s/^[[:space:]]*'version'[[:space:]]*=>[[:space:]]*'\([^']*\)'.*/\1/p" "$ASSET_FILE")
STABLE_VERSION=$(sed -n 's/^Stable tag:[[:space:]]*//p' "$README_FILE")

if [[ "$CONSTANT_VERSION" != "$CURRENT_VERSION" || "$BLOCK_VERSION" != "$CURRENT_VERSION" || "$ASSET_VERSION" != "$CURRENT_VERSION" || "$STABLE_VERSION" != "$CURRENT_VERSION" ]]; then
	echo "Version fields are inconsistent; update them manually before running this script." >&2
	exit 1
fi

if [[ "$NEW_VERSION" == "$CURRENT_VERSION" ]]; then
	echo "Version is already $NEW_VERSION" >&2
	exit 1
fi

CURRENT_VERSION="$CURRENT_VERSION" NEW_VERSION="$NEW_VERSION" perl -pi -e '
	s/(^ \* Version:\s*)\Q$ENV{CURRENT_VERSION}\E$/$1$ENV{NEW_VERSION}/;
	s/(define\( '\''WP_PDF_EMBED_VERSION'\'', '\'')\Q$ENV{CURRENT_VERSION}\E('\'' \);)/$1$ENV{NEW_VERSION}$2/;
' "$MAIN_FILE"

CURRENT_VERSION="$CURRENT_VERSION" NEW_VERSION="$NEW_VERSION" perl -pi -e '
	s/("version"\s*:\s*")\Q$ENV{CURRENT_VERSION}\E(")/$1$ENV{NEW_VERSION}$2/;
' "$BLOCK_FILE"

CURRENT_VERSION="$CURRENT_VERSION" NEW_VERSION="$NEW_VERSION" perl -pi -e '
	s/('\''version'\''\s*=>\s*'\'')\Q$ENV{CURRENT_VERSION}\E('\'')/$1$ENV{NEW_VERSION}$2/;
' "$ASSET_FILE"

CURRENT_VERSION="$CURRENT_VERSION" NEW_VERSION="$NEW_VERSION" perl -pi -e '
	s/(^Stable tag:\s*)\Q$ENV{CURRENT_VERSION}\E$/$1$ENV{NEW_VERSION}/;
' "$README_FILE"

echo "Updated version from $CURRENT_VERSION to $NEW_VERSION"
