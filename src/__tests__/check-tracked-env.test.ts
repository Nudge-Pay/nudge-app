import { findDisallowedTrackedEnvFiles } from '../../scripts/check-tracked-env.mjs';

describe('CI guard against committed .env files (#45)', () => {
  it('allows .env.example and regular repository files', () => {
    expect(
      findDisallowedTrackedEnvFiles([
        '.env.example',
        'package.json',
        'src/app/index.tsx',
      ])
    ).toEqual([]);
  });

  it('flags .env and .env.* files with their exact paths', () => {
    expect(
      findDisallowedTrackedEnvFiles([
        '.env',
        '.env.local',
        'apps/client/.env.production',
        '.env.example',
      ])
    ).toEqual(['.env', '.env.local', 'apps/client/.env.production']);
  });
});
