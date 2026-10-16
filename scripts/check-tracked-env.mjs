#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

export function findDisallowedTrackedEnvFiles(trackedPaths) {
  return trackedPaths.filter((filePath) => {
    const normalized = filePath.replace(/\\/g, '/').trim();
    if (!normalized) return false;
    const base = normalized.split('/').pop() ?? '';
    if (base === '.env.example') return false;
    return base === '.env' || base.startsWith('.env.');
  });
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  const output = execFileSync('git', ['ls-files', '--cached'], {
    encoding: 'utf8',
  });
  const tracked = output.split(/\r?\n/).filter(Boolean);
  const offending = findDisallowedTrackedEnvFiles(tracked);

  if (offending.length > 0) {
    for (const file of offending) {
      console.error(
        `::error file=${file}::Committed environment file is forbidden: ${file}`
      );
    }
    console.error(
      'Only .env.example may be tracked in git. Remove committed .env files and rotate any exposed values.'
    );
    process.exit(1);
  }

  console.log('Verified no .env files are tracked in git.');
}
