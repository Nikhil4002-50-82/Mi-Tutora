import { test, expect } from '@playwright/test';

test.describe('Aadhar KYC Verification Architecture (Aadhar_Verification_Badge.md)', () => {

  function validateAndCleanAadhar(input: string) {
    if (!input) return { valid: false, clean: '' };
    const clean = input.replace(/\s+/g, '');
    const valid = /^\d{12}$/.test(clean);
    return { valid, clean };
  }

  function maskAadhar(cleanAadhar: string): string {
    const last4 = cleanAadhar.slice(-4);
    return `XXXX-XXXX-${last4}`;
  }

  function verifyMockOtp(otp: string, cleanAadhar: string) {
    if (otp === '123456') {
      return {
        success: true,
        aadharVerified: true,
        maskedAadhar: maskAadhar(cleanAadhar)
      };
    }
    return {
      success: false,
      error: 'Invalid OTP. For mock testing, use 123456.'
    };
  }

  test.describe('12-Digit Format Validation', () => {
    test('Accepts valid 12-digit numbers with or without spaces', () => {
      expect(validateAndCleanAadhar('123456789012')).toEqual({ valid: true, clean: '123456789012' });
      expect(validateAndCleanAadhar('1234 5678 9012')).toEqual({ valid: true, clean: '123456789012' });
      expect(validateAndCleanAadhar('  1234   5678  9012  ')).toEqual({ valid: true, clean: '123456789012' });
    });

    test('Rejects invalid formats (letters, symbols, wrong length)', () => {
      expect(validateAndCleanAadhar('12345678901')).toEqual({ valid: false, clean: '12345678901' }); // 11 digits
      expect(validateAndCleanAadhar('1234567890123')).toEqual({ valid: false, clean: '1234567890123' }); // 13 digits
      expect(validateAndCleanAadhar('1234abcd5678')).toEqual({ valid: false, clean: '1234abcd5678' }); // Letters
      expect(validateAndCleanAadhar('')).toEqual({ valid: false, clean: '' });
    });
  });

  test.describe('Data Masking', () => {
    test('Securely masks first 8 digits and exposes only last 4', () => {
      expect(maskAadhar('123456789012')).toBe('XXXX-XXXX-9012');
      expect(maskAadhar('999988887777')).toBe('XXXX-XXXX-7777');
    });
  });

  test.describe('Mock OTP Flow & Badging State', () => {
    test('Verifies with mock OTP 123456 and activates badge', () => {
      const aadhar = '555566667777';
      const result = verifyMockOtp('123456', aadhar);

      expect(result.success).toBe(true);
      expect(result.aadharVerified).toBe(true);
      expect(result.maskedAadhar).toBe('XXXX-XXXX-7777');
    });

    test('Rejects incorrect OTP', () => {
      const aadhar = '555566667777';
      const result = verifyMockOtp('000000', aadhar);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid OTP');
    });
  });
});
