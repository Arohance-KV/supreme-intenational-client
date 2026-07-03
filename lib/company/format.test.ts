import { formatLakh, formatIN, initials, parsePointsInput } from './format';

describe('formatLakh', () => {
  test('shortens values >= 1L to one decimal with an L suffix', () => {
    expect(formatLakh(2980000)).toBe('29.8L');
    expect(formatLakh(100000)).toBe('1.0L');
  });

  test('formats sub-lakh values with Indian thousands separators', () => {
    expect(formatLakh(45000)).toBe('45,000');
    expect(formatLakh(0)).toBe('0');
  });

  test('returns em-dash for non-numeric input', () => {
    expect(formatLakh(undefined)).toBe('—');
    expect(formatLakh(NaN)).toBe('—');
  });
});

describe('formatIN', () => {
  test('formats with Indian thousands separators', () => {
    expect(formatIN(1000000)).toBe('10,00,000');
  });

  test('returns em-dash for non-numeric input', () => {
    expect(formatIN(null)).toBe('—');
  });
});

describe('initials', () => {
  test('takes first and last name initials', () => {
    expect(initials('Priya Sharma')).toBe('PS');
  });

  test('falls back to a single initial for one-word names', () => {
    expect(initials('Ravi')).toBe('R');
  });

  test('returns a placeholder for empty input', () => {
    expect(initials('')).toBe('?');
    expect(initials(undefined)).toBe('?');
  });
});

describe('parsePointsInput', () => {
  test('rejects blank or whitespace-only input', () => {
    expect(parsePointsInput('')).toBeNull();
    expect(parsePointsInput('   ')).toBeNull();
  });

  test('rejects negative numbers', () => {
    expect(parsePointsInput('-5')).toBeNull();
  });

  test('rejects non-numeric input', () => {
    expect(parsePointsInput('abc')).toBeNull();
  });

  test('accepts and rounds valid non-negative numbers', () => {
    expect(parsePointsInput('120')).toBe(120);
    expect(parsePointsInput('120.6')).toBe(121);
    expect(parsePointsInput('0')).toBe(0);
  });
});
