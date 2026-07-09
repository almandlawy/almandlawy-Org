#!/usr/bin/env bash
# Process PGR bullion collection showcase video → MP4, WebM, poster WebP
# Usage: place source at public/videos/pgr-bullion-collection-source.mp4 (or .mp4) then run:
#   npm run video:process
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT/public/videos"
MP4="$OUT_DIR/pgr-bullion-collection.mp4"
WEBM="$OUT_DIR/pgr-bullion-collection.webm"
POSTER="$OUT_DIR/pgr-bullion-collection-poster.webp"
SOURCE="$OUT_DIR/pgr-bullion-collection-source.mp4"
POSTER_SRC="$ROOT/public/images/products/01-bullion-collection.webp"

mkdir -p "$OUT_DIR"

if [[ -f "$SOURCE" ]]; then
  echo "Processing uploaded source: $SOURCE"
  ffmpeg -y -i "$SOURCE" \
    -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -movflags +faststart -an -t 10 \
    "$MP4"
elif [[ -f "$MP4" ]] && [[ ! -f "$SOURCE" ]]; then
  echo "Using existing $MP4"
else
  echo "No source MP4 found — generating placeholder from bullion poster (replace with real upload via GitHub)"
  ffmpeg -y -loop 1 -framerate 24 -i "$POSTER_SRC" \
    -vf "scale=1280:-2,zoompan=z='1+0.0006*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=240:s=1280x720:fps=24" \
    -c:v libx264 -preset slow -crf 30 -t 10 -pix_fmt yuv420p -movflags +faststart -an \
    "$MP4"
fi

echo "Encoding WebM…"
ffmpeg -y -i "$MP4" -c:v libvpx-vp9 -crf 35 -b:v 0 -an -row-mt 1 "$WEBM"

echo "Extracting poster frame…"
ffmpeg -y -i "$MP4" -ss 00:00:00.5 -vframes 1 -c:v libwebp -quality 82 "$POSTER"

ls -lh "$MP4" "$WEBM" "$POSTER"
echo "Done. Target: each file under 2MB where possible."
