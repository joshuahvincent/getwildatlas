#!/usr/bin/env bash
# Regenerate the partner-page PDFs from their HTML sources using headless Chrome.
#   assets/downloads/wild-atlas-partner-one-pager.pdf  <- print-sources/partners-one-pager.html
#   assets/downloads/riverbend-puzzle-book.pdf         <- riverbend-puzzle-book.html (print CSS)
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
render() { "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="$2" "file://$PWD/$1" >/dev/null 2>&1; echo "wrote $2"; }
render print-sources/partners-one-pager.html assets/downloads/wild-atlas-partner-one-pager.pdf
render riverbend-puzzle-book.html assets/downloads/riverbend-puzzle-book.pdf
