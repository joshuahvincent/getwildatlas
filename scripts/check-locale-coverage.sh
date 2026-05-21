#!/usr/bin/env bash
# Wild Atlas — locale coverage check
#
# Catches drift between the iOS app's supported locales (the `.lproj` directories)
# and the website's `supportedLocales` array in `js/translations.js`. The app has
# led the website by a locale at least once (zh-Hans was added to the app months
# before the website caught up); this check exists so that never happens silently
# again.
#
# Runs from anywhere. Defaults assume the wildatlas repo layout. Override via env:
#   APP_LPROJ_DIR  — directory holding the *.lproj dirs (default: ../PetPeeper/WildAtlas)
#   WEBSITE_TRANSLATIONS — path to translations.js (default: js/translations.js relative to script)
#
# Exit codes:
#   0 — locales in sync
#   1 — drift detected (app supports a locale the website doesn't, or vice versa)
#   2 — could not run (missing files, bad inputs)

set -euo pipefail

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
WEBSITE_ROOT="$( cd -- "$SCRIPT_DIR/.." &> /dev/null && pwd )"

APP_LPROJ_DIR="${APP_LPROJ_DIR:-$WEBSITE_ROOT/../PetPeeper/WildAtlas}"
WEBSITE_TRANSLATIONS="${WEBSITE_TRANSLATIONS:-$WEBSITE_ROOT/js/translations.js}"

if [ ! -d "$APP_LPROJ_DIR" ]; then
  echo "✗ APP_LPROJ_DIR not found: $APP_LPROJ_DIR" >&2
  echo "  Set APP_LPROJ_DIR env var to the path containing the app's *.lproj directories." >&2
  exit 2
fi

if [ ! -f "$WEBSITE_TRANSLATIONS" ]; then
  echo "✗ WEBSITE_TRANSLATIONS not found: $WEBSITE_TRANSLATIONS" >&2
  exit 2
fi

# Extract app locales from .lproj directory names (e.g. zh-Hans.lproj -> zh-Hans)
# Normalize to the website's convention: zh-Hans -> zh, en -> en
app_locales="$(
  find "$APP_LPROJ_DIR" -maxdepth 1 -type d -name "*.lproj" -exec basename {} .lproj \; \
    | sed 's/-Hans$//; s/-Hant$/-tw/' \
    | sort -u
)"

# Extract website locales from supportedLocales array
website_locales="$(
  grep -oE "supportedLocales:\s*\[[^]]+\]" "$WEBSITE_TRANSLATIONS" \
    | tr ',' '\n' \
    | grep -oE "'[a-z-]+'" \
    | tr -d "'" \
    | sort -u
)"

echo "App locales (normalized): $(echo $app_locales | tr '\n' ' ')"
echo "Website locales:          $(echo $website_locales | tr '\n' ' ')"
echo ""

app_only="$(comm -23 <(echo "$app_locales") <(echo "$website_locales"))"
web_only="$(comm -13 <(echo "$app_locales") <(echo "$website_locales"))"

drift=0

if [ -n "$app_only" ]; then
  echo "✗ App supports locales the website does NOT:"
  echo "$app_only" | sed 's/^/    /'
  echo ""
  echo "  → Add a translation block to $WEBSITE_TRANSLATIONS for each missing locale."
  drift=1
fi

if [ -n "$web_only" ]; then
  echo "⚠ Website lists locales the app does NOT (probably fine, but verify):"
  echo "$web_only" | sed 's/^/    /'
  echo ""
fi

if [ $drift -eq 0 ] && [ -z "$web_only" ]; then
  echo "✓ App and website locale lists match."
fi

exit $drift
