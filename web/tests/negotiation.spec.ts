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
});
