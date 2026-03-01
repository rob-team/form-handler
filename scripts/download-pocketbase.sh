#!/usr/bin/env bash
set -euo pipefail

# Downloads the PocketBase binary for the current OS/arch into backend/pocketbase.
# Idempotent: skips download if the binary already exists at the target version.

TARGET_VERSION="${POCKETBASE_VERSION:-0.36.5}"
DEST="$(dirname "$0")/../backend/pocketbase"
DEST="$(cd "$(dirname "$DEST")" && pwd)/$(basename "$DEST")"

if [[ -f "$DEST" ]]; then
  CURRENT_VERSION="$("$DEST" --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1 || echo "")"
  if [[ "$CURRENT_VERSION" == "$TARGET_VERSION" ]]; then
    echo "PocketBase $TARGET_VERSION already installed at $DEST — skipping."
    exit 0
  fi
  echo "Replacing PocketBase $CURRENT_VERSION with $TARGET_VERSION…"
fi

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$OS" in
  linux)  PB_OS="linux" ;;
  darwin) PB_OS="darwin" ;;
  *)      echo "Unsupported OS: $OS" >&2; exit 1 ;;
esac

case "$ARCH" in
  x86_64 | amd64)  PB_ARCH="amd64" ;;
  arm64  | aarch64) PB_ARCH="arm64" ;;
  *)                echo "Unsupported arch: $ARCH" >&2; exit 1 ;;
esac

ZIP_NAME="pocketbase_${TARGET_VERSION}_${PB_OS}_${PB_ARCH}.zip"
URL="https://github.com/pocketbase/pocketbase/releases/download/v${TARGET_VERSION}/${ZIP_NAME}"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Downloading PocketBase $TARGET_VERSION for ${PB_OS}/${PB_ARCH}…"
curl -fsSL "$URL" -o "$TMP_DIR/$ZIP_NAME"
unzip -q "$TMP_DIR/$ZIP_NAME" pocketbase -d "$TMP_DIR"
mv "$TMP_DIR/pocketbase" "$DEST"
chmod +x "$DEST"

echo "PocketBase $TARGET_VERSION installed at $DEST"
