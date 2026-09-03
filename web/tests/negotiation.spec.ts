import { test, expect } from '@playwright/test';

// The business logic requires mathematical floors and ceilings on negotiation boundaries.
// The tests here verify the boundaries defined in negotiation_plan.md

function calculateStudentBounds(tutorPrice: number, offerPrice: number) {
  const initialBudget = tutorPrice > 0 ? tutorPrice : offerPrice;
  const absoluteMin = tutorPrice > 0 ? Math.ceil(tutorPrice * 0.6) : Math.ceil(offerPrice * 0.6);
  const absoluteMax = tutorPrice > 0 ? tutorPrice : offerPrice;
  return { initialBudget, absoluteMin, absoluteMax };
}

function calculateTeacherBounds(studentBudget: number, offerPrice: number) {
  const initialBudget = studentBudget || offerPrice;
  const absoluteMin = studentBudget || offerPrice;
  const absoluteMax = studentBudget ? Math.floor(studentBudget * 1.4) : Math.floor(offerPrice * 1.4);
  return { initialBudget, absoluteMin, absoluteMax };
}

test.describe('Negotiation Boundary Rules (negotiation_plan.md)', () => {

  test('Student offering to tutor establishes 60% hard floor', () => {
    const tutorPrice = 1000;
    const offerPrice = 700; // Offer doesn't matter for the bounds if tutor price exists
    const bounds = calculateStudentBounds(tutorPrice, offerPrice);
    
    expect(bounds.initialBudget).toBe(1000);
    expect(bounds.absoluteMin).toBe(600); // 60% of 1000
    expect(bounds.absoluteMax).toBe(1000); 
  });

  test('Teacher offering to student establishes 140% hard ceiling', () => {
    const studentBudget = 1000;
    const offerPrice = 1200; 
    const bounds = calculateTeacherBounds(studentBudget, offerPrice);
    
    expect(bounds.initialBudget).toBe(1000);
    expect(bounds.absoluteMin).toBe(1000);
    expect(bounds.absoluteMax).toBe(1400); // 140% of 1000
  });

  test.describe('Counter-Offer Validation', () => {
    function isCounterOfferAllowed(counterOffer: number, min: number, max: number) {
      return counterOffer >= min && counterOffer <= max;
    }

    test('Accepts counter-offer strictly within [absoluteMin, absoluteMax]', () => {
      const min = 600;
      const max = 1000;
      expect(isCounterOfferAllowed(600, min, max)).toBe(true);
      expect(isCounterOfferAllowed(800, min, max)).toBe(true);
      expect(isCounterOfferAllowed(1000, min, max)).toBe(true);
    });

    test('Rejects counter-offer below absoluteMin (less than 60%)', () => {
      const min = 600;
      const max = 1000;
      expect(isCounterOfferAllowed(599, min, max)).toBe(false);
      expect(isCounterOfferAllowed(400, min, max)).toBe(false);
    });

    test('Rejects counter-offer above absoluteMax (more than 140%)', () => {
      const min = 1000;
      const max = 1400;
      expect(isCounterOfferAllowed(1401, min, max)).toBe(false);
      expect(isCounterOfferAllowed(1600, min, max)).toBe(false);
    });
  });

  test.describe('Negotiation Status Progression', () => {
    const IMMUTABLE_STATUSES = [
      'accepted',
      'tuition_started',
      'demo_booking_phase',
      'demo_scheduled',
      'waiting_for_parent_decision'
    ];

    function canModifyPrice(status: string) {
      return !IMMUTABLE_STATUSES.includes(status);
    }

    test('Allows price updates during active negotiation', () => {
      expect(canModifyPrice('negotiating')).toBe(true);
      expect(canModifyPrice('pending')).toBe(true);
    });

    test('Locks price updates once negotiation reaches booking, scheduling, or tuition', () => {
      expect(canModifyPrice('accepted')).toBe(false);
      expect(canModifyPrice('demo_booking_phase')).toBe(false);
      expect(canModifyPrice('demo_scheduled')).toBe(false);
      expect(canModifyPrice('tuition_started')).toBe(false);
    });
  });
});
