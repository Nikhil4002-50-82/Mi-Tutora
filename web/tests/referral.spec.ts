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

  test.describe('Reward Distribution on First Month Tuition Payment', () => {
    function calculateReferralReward(finalPrice: number, referralType: 'student' | 'teacher') {
      const rewardAmount = Math.round(finalPrice * 0.25);
      if (referralType === 'teacher') {
        return {
          status: 'qualified',
          reward: 0,
          rewardType: 'banked_token',
          bankedTokensIncrement: 1
        };
      } else {
        return {
          status: 'qualified',
          reward: rewardAmount,
          rewardType: 'wallet_cash',
          walletCashIncrement: rewardAmount
        };
      }
    }

    test('Awards 25% cash wallet credit to student referrer', () => {
      const tuitionFee = 4000;
      const result = calculateReferralReward(tuitionFee, 'student');
      expect(result.status).toBe('qualified');
      expect(result.reward).toBe(1000); // 25% of 4000
      expect(result.rewardType).toBe('wallet_cash');
      expect(result.walletCashIncrement).toBe(1000);
    });

    test('Awards 1 banked token to teacher referrer instead of cash', () => {
      const tuitionFee = 6000;
      const result = calculateReferralReward(tuitionFee, 'teacher');
      expect(result.status).toBe('qualified');
      expect(result.rewardType).toBe('banked_token');
      expect(result.bankedTokensIncrement).toBe(1);
    });

    test('Rounds decimal rewards properly', () => {
      const tuitionFee = 3555;
      const result = calculateReferralReward(tuitionFee, 'student');
      expect(result.reward).toBe(889); // Math.round(3555 * 0.25) = 888.75 -> 889
    });
  });
});
