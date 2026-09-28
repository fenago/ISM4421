#!/bin/sh
# Downloads FAU's official owl-head logo into the site at build time.
# Runs on Netlify (see netlify.toml) or locally: sh scripts/fetch-fau-logo.sh
# If the download fails, the page falls back to public/assets/fau-mark.svg.
set -u
DEST="$(dirname "$0")/../public/assets/fau-owl.png"
URL="https://www.fau.edu/images/homepage/owlhead-logo.png"

if curl -fsSL --retry 3 --max-time 20 -o "$DEST.tmp" "$URL"; then
  mv "$DEST.tmp" "$DEST"
  echo "Fetched FAU logo -> $DEST"
else
  rm -f "$DEST.tmp"
  echo "Could not fetch FAU logo; the site will use the fallback mark." >&2
fi
exit 0
