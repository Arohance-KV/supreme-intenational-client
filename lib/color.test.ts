import { readableTextColor } from './color';

describe('readableTextColor', () => {
  it('returns white on a dark background', () => {
    expect(readableTextColor('#1F2937')).toBe('#ffffff');
    expect(readableTextColor('#000000')).toBe('#ffffff');
  });
  it('returns dark ink on a light background', () => {
    expect(readableTextColor('#FFFFFF')).toBe('#0f172a');
    expect(readableTextColor('#E8F7F4')).toBe('#0f172a');
  });
  it('falls back to dark ink for empty/invalid input', () => {
    expect(readableTextColor('')).toBe('#0f172a');
    expect(readableTextColor(undefined)).toBe('#0f172a');
    expect(readableTextColor('nothex')).toBe('#0f172a');
  });
  it('supports 3-digit hex', () => {
    expect(readableTextColor('#000')).toBe('#ffffff');
    expect(readableTextColor('#fff')).toBe('#0f172a');
  });
});
