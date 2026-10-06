import { formatBalance } from './formatBalance';

describe('formatBalance', () => {
  it('formats a whole number without decimals', () => {
    expect(formatBalance('100.0000000')).toBe('100');
  });

  it('formats zero without decimal places', () => {
    expect(formatBalance(0)).toBe('0');
  });

  it('trims trailing zeros while keeping significant decimals', () => {
    expect(formatBalance('1234.5000000')).toBe('1,234.5');
  });

  it('formats a number with leading fractional zeroes', () => {
    expect(formatBalance('0.0012')).toBe('0.0012');
  });

  it('caps fraction digits to the given precision', () => {
    expect(formatBalance('10.123456', 2)).toBe('10.12');
  });

  it('keeps the requested precision when significant digits remain', () => {
    expect(formatBalance('10.123456', 5)).toBe('10.12346');
  });

  it('accepts numeric input', () => {
    expect(formatBalance(42)).toBe('42');
  });

  it('formats a negative numeric input', () => {
    expect(formatBalance(-42)).toBe('-42');
  });

  it('returns 0 for non-numeric input', () => {
    expect(formatBalance('not-a-number')).toBe('0');
  });

  it('returns 0 for an empty string', () => {
    expect(formatBalance('')).toBe('0');
  });

  it('returns 0 for NaN input', () => {
    expect(formatBalance(Number.NaN)).toBe('0');
  });

  it('returns 0 for an infinite input', () => {
    expect(formatBalance(Number.POSITIVE_INFINITY)).toBe('0');
  });
});
