#!/bin/sh
# Downloads FAU's official owl-head logo into the site at build time.
# Runs on Netlify (see netlify.toml) or locally: sh scripts/fetch-fau-logo.sh
# If the download fails, the page falls back to public/assets/fau-mark.svg.
set -u
DEST="$(dirname "$0")/../public/assets/fau-owl.png"
URL="https://www.fau.edu/images/homepage/owlhead-logo.png"

MAX_BYTES=2000000

# HTTPS only (no redirect to http), and only publish the file if it really is a PNG of sane size,
# so a hijacked or changed upstream can't slip other content into the site.
if curl -fsSL --proto '=https' --proto-redir '=https' --retry 3 --max-time 20 \
     --max-filesize "$MAX_BYTES" -o "$DEST.tmp" "$URL" \
   && [ "$(head -c 8 "$DEST.tmp" | od -An -tx1 | tr -d ' \n')" = "89504e470d0a1a0a" ]; then
  mv "$DEST.tmp" "$DEST"
  echo "Fetched FAU logo -> $DEST"
else
  rm -f "$DEST.tmp"
  echo "Could not fetch a valid FAU logo; the site will use the fallback mark." >&2
fi
exit 0
