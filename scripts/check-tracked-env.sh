#!/usr/bin/env bash
set -euo pipefail

# Inspect Git's tracked index rather than the (normally ignored) local filesystem.
# A tracked .env leaks potentially sensitive values even when .gitignore matches it.
invalid=0
while IFS= read -r -d '' file; do
  base="${file##*/}"
  if [[ "$base" == ".env.example" ]]; then
    continue
  fi
  if [[ "$base" == ".env" || "$base" == .env.* ]]; then
    printf '::error file=%s::Tracked environment file is forbidden: %s\n' "$file" "$file"
    invalid=1
  fi
done < <(git ls-files -z --cached)

if (( invalid )); then
  echo 'Commit only .env.example; remove secrets from Git and rotate exposed credentials.'
  exit 1
fi
echo 'No prohibited tracked .env files.'
