#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
PLUGIN_SLUG="wp-pdf-embed"
VERSION=$(sed -n 's/^ \* Version:[[:space:]]*//p' "$PROJECT_DIR/wp-pdf-embed.php" | head -n 1)
OUTPUT_DIR=${1:-"$PROJECT_DIR/dist"}

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z.-]+)?$ ]]; then
	echo "Could not read a valid plugin version from wp-pdf-embed.php" >&2
	exit 1
fi

mkdir -p "$OUTPUT_DIR"
OUTPUT_DIR=$(CDPATH= cd -- "$OUTPUT_DIR" && pwd)
ARCHIVE="$OUTPUT_DIR/$PLUGIN_SLUG-$VERSION.zip"
STAGING_ROOT=$(mktemp -d "${TMPDIR:-/tmp}/wp-pdf-embed-release.XXXXXX")
STAGING_DIR="$STAGING_ROOT/$PLUGIN_SLUG"

cleanup() {
	rm -rf -- "$STAGING_ROOT"
}
trap cleanup EXIT

mkdir -p "$STAGING_DIR"
rsync -a \
	--exclude='.git/' \
	--exclude='.gitignore' \
	--exclude='.DS_Store' \
	--exclude='dist/' \
	--exclude='docs/' \
	--exclude='node_modules/' \
	--exclude='scripts/' \
	--exclude='tests/' \
	--exclude='*.zip' \
	"$PROJECT_DIR/" "$STAGING_DIR/"

rm -f -- "$ARCHIVE"
(
	cd "$STAGING_ROOT"
	COPYFILE_DISABLE=1 zip -q -r "$ARCHIVE" "$PLUGIN_SLUG"
)

unzip -t "$ARCHIVE" >/dev/null
echo "$ARCHIVE"
