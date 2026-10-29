#!/usr/bin/env node
import { execSync } from 'child_process';
import path from 'path';

/**
 * CI Guard: Enforces that no `.env` or local secret files are tracked in git.
 * Excludes `.env.example` which is required for contributor onboarding.
 */
function checkNoEnvCommitted() {
  try {
    // List all tracked files in git
    const stdout = execSync('git ls-files', { encoding: 'utf-8' });
    const trackedFiles = stdout.split('\n').map(f => f.trim()).filter(Boolean);

    const violations = [];

    for (const file of trackedFiles) {
      const base = path.basename(file);
      // Fail if filename is .env or starts with .env. (e.g. .env.local, .env.production)
      // but explicitly allow .env.example
      if (base === '.env' || (base.startsWith('.env.') && base !== '.env.example')) {
        violations.push(file);
      }
    }

    if (violations.length > 0) {
      console.error('❌ SECURITY FAILURE: Tracked environment file(s) detected in git:');
      for (const v of violations) {
        console.error(`   - ${v}`);
      }
      console.error('\nEnvironment files must NEVER be committed. Keep them in .gitignore.');
      process.exit(1);
    }

    console.log('✅ Check passed: No secret .env files are tracked in git (.env.example is preserved).');
    process.exit(0);
  } catch (err) {
    console.error('Error running check-no-env-committed:', err.message);
    process.exit(1);
  }
}

checkNoEnvCommitted();
