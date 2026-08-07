#!/usr/bin/env bash
# Post-deploy smoke check. Every canonical must return 200, not a redirect —
# a canonical pointing at a 3xx undoes the SEO work it exists to support.
set -u
HOST="${1:-https://seetorealty.vercel.app}"
fail=0
echo "Smoke checking $HOST"
while read -r path; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$HOST$path")
  if [ "$code" != "200" ]; then printf '  FAIL %-42s %s\n' "$path" "$code"; fail=1;
  else printf '  ok   %-42s %s\n' "$path" "$code"; fi
done < <(grep -o '<loc>[^<]*</loc>' sitemap.xml | sed 's|<loc>||;s|</loc>||' | sed "s|^https\?://[^/]*||")
code=$(curl -s -o /dev/null -w '%{http_code}' "$HOST/definitely-not-a-page")
[ "$code" = "404" ] && printf '  ok   %-42s %s\n' "(404 handling)" "$code" || { printf '  FAIL %-42s %s\n' "(404 handling)" "$code"; fail=1; }
for leak in PLACEHOLDER_CONTENT.md package.json data/site.json docs/; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$HOST/$leak")
  [ "$code" = "404" ] && printf '  ok   %-42s %s\n' "/$leak blocked" "$code" || { printf '  LEAK %-42s %s\n' "/$leak" "$code"; fail=1; }
done
exit $fail
