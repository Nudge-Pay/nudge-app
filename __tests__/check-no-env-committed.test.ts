import path from 'path';

describe('check-no-env-committed logic', () => {
  function isViolation(file: string): boolean {
    const base = path.basename(file);
    return base === '.env' || (base.startsWith('.env.') && base !== '.env.example');
  }

  it('allows .env.example', () => {
    expect(isViolation('.env.example')).toBe(false);
    expect(isViolation('packages/app/.env.example')).toBe(false);
  });

  it('rejects raw .env files', () => {
    expect(isViolation('.env')).toBe(true);
    expect(isViolation('apps/mobile/.env')).toBe(true);
  });

  it('rejects local and staging environment variants', () => {
    expect(isViolation('.env.local')).toBe(true);
    expect(isViolation('.env.production')).toBe(true);
    expect(isViolation('.env.development.local')).toBe(true);
  });

  it('allows regular non-env files', () => {
    expect(isViolation('package.json')).toBe(false);
    expect(isViolation('README.md')).toBe(false);
    expect(isViolation('src/config.ts')).toBe(false);
  });
});
