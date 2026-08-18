import { test, expect } from '@playwright/test';
import { generateReferralCode } from '../src/utils/referral';

test.describe('Referral System Logic', () => {

  test('Generates code with exactly 4 letters of name and 6 chars of UID', () => {
    const name = 'John Doe';
    const uid = 'abc123def456ghi789jkl012mno3';
    
    const code = generateReferralCode(name, uid);
    
    // Expected: JOHN-23DEF4
    expect(code).toBe('JOHN-23DEF4');
  });

  test('Pads short names with X', () => {
    const name = 'Jo';
    const uid = 'abc123def456ghi789jkl012mno3';
    
    const code = generateReferralCode(name, uid);
    
    // Expected: JOXX-23DEF4
    expect(code).toBe('JOXX-23DEF4');
  });

  test('Handles empty names by falling back to USER', () => {
    const name = '';
    const uid = 'abc123def456ghi789jkl012mno3';
    
    const code = generateReferralCode(name, uid);
    
    expect(code.startsWith('USER-')).toBe(true);
  });

  test('Strips non-alphabetical characters from names', () => {
    const name = 'J@hn_123!';
    const uid = 'abc123def456ghi789jkl012mno3';
    
    const code = generateReferralCode(name, uid);
    
    expect(code.startsWith('JHNX-')).toBe(true);
  });

  test('Handles missing UID safely by generating random fallback', () => {
    const name = 'Sarah';
    const code = generateReferralCode(name, '');
    
    expect(code.startsWith('SARA-')).toBe(true);
    expect(code.length).toBeGreaterThan(8); // Fallback generates a random 4-6 char suffix
  });
});
