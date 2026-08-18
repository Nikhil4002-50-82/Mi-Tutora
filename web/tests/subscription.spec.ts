import { test, expect } from '@playwright/test';

// These tests validate the architectural limits for Subscriptions and Tokens.

function canTeacherSendOffer(subscriptionPlan: string, isSubscribed: boolean, currentTokensUsed: number) {
  const isPro = subscriptionPlan === 'pro' || isSubscribed;
  const weeklyLimit = isPro ? 15 : 5;
  return currentTokensUsed < weeklyLimit;
}

test.describe('Subscription & Token Architecture', () => {

  test.describe('Token Quotas', () => {
    test('Free tier teacher is blocked after 5 tokens', () => {
      // 4 tokens used
      expect(canTeacherSendOffer('free', false, 4)).toBe(true);
      // 5 tokens used (Limit reached)
      expect(canTeacherSendOffer('free', false, 5)).toBe(false);
      // 6 tokens used
      expect(canTeacherSendOffer('free', false, 6)).toBe(false);
    });

    test('Pro tier teacher is allowed up to 15 tokens', () => {
      // 5 tokens used (Free limit, but Pro should pass)
      expect(canTeacherSendOffer('pro', true, 5)).toBe(true);
      // 14 tokens used
      expect(canTeacherSendOffer('pro', true, 14)).toBe(true);
      // 15 tokens used (Limit reached)
      expect(canTeacherSendOffer('pro', true, 15)).toBe(false);
    });

    test('Legacy isSubscribed flag correctly grants Pro limits', () => {
      // isSubscribed = true, but plan string is missing or old
      expect(canTeacherSendOffer('', true, 10)).toBe(true);
      expect(canTeacherSendOffer('legacy_plan', true, 14)).toBe(true);
      expect(canTeacherSendOffer('legacy_plan', true, 15)).toBe(false);
    });
  });
});
