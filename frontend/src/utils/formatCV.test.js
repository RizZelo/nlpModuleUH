/**
 * Tests for formatCV utility
 */
import { formatCVText, isValidCVText } from './formatCV';

describe('formatCVText', () => {
  test('formats empty text with default message', () => {
    const result = formatCVText('');
    expect(result).toContain('No CV content available');
  });

  test('formats plain text into HTML', () => {
    const input = 'John Doe\nSoftware Engineer\n2020-2023';
    const result = formatCVText(input);
    expect(result).toContain('<p');
    expect(result).toContain('John Doe');
  });

  test('detects and formats headers', () => {
    const input = 'EXPERIENCE\nSome experience details';
    const result = formatCVText(input);
    expect(result).toContain('<h2');
    expect(result).toContain('EXPERIENCE');
  });

  test('detects and formats bullet points', () => {
    const input = '• First bullet\n• Second bullet';
    const result = formatCVText(input);
    expect(result).toContain('<ul');
    expect(result).toContain('<li');
    expect(result).toContain('First bullet');
  });

  test('detects job titles', () => {
    const input = 'Senior Software Engineer';
    const result = formatCVText(input);
    expect(result).toContain('<h3');
  });

  test('detects date ranges', () => {
    const input = '2020-2023';
    const result = formatCVText(input);
    expect(result).toContain('font-style: italic');
  });
});

describe('isValidCVText', () => {
  test('returns false for empty text', () => {
    expect(isValidCVText('')).toBe(false);
  });

  test('returns false for null', () => {
    expect(isValidCVText(null)).toBe(false);
  });

  test('returns false for short text', () => {
    expect(isValidCVText('short')).toBe(false);
  });

  test('returns true for valid CV text', () => {
    const validText = 'A'.repeat(60);
    expect(isValidCVText(validText)).toBe(true);
  });
});
