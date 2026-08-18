import { test, expect } from '@playwright/test';
import { calculateSuitabilityScore, isStrictMatch } from '../src/utils/matching';

test.describe('Matchmaking & Ranking Algorithm (Ranking_System_Architecture.md)', () => {

  test.describe('Strict Filter (isStrictMatch)', () => {
    test('Returns false if Category does not match', () => {
      const student = { category: 'school' };
      const teacher = { category: 'programming' };
      expect(isStrictMatch(student, teacher)).toBe(false);
    });

    test('Returns false if Board does not match for school category', () => {
      const student = { category: 'school', board: 'CBSE' };
      const teacher = { category: 'school', boards: ['ICSE', 'State Board'] };
      expect(isStrictMatch(student, teacher)).toBe(false);
    });

    test('Returns false if Class does not match', () => {
      const student = { category: 'school', board: 'CBSE', classLevel: 'Class 10' };
      const teacher = { category: 'school', boards: ['CBSE'], classes: ['Class 12', 'Class 11'] };
      expect(isStrictMatch(student, teacher)).toBe(false);
    });

    test('Returns false if Gender Preference does not match', () => {
      const student = { category: 'school', board: 'CBSE', classLevel: 'Class 10', teacherGenderPreference: 'Female' };
      const teacher = { category: 'school', boards: ['CBSE'], classes: ['Class 10'], gender: 'Male' };
      expect(isStrictMatch(student, teacher)).toBe(false);
    });

    test('Returns false if teacher does not offer 100% of requested subjects', () => {
      const student = { category: 'school', board: 'CBSE', classLevel: 'Class 10', subjects: ['Mathematics', 'Science'] };
      const teacher = { category: 'school', boards: ['CBSE'], classes: ['Class 10'], subjects: ['Mathematics', 'English'] };
      expect(isStrictMatch(student, teacher)).toBe(false);
    });

    test('Returns true if all strict criteria are met', () => {
      const student = { category: 'school', board: 'CBSE', classLevel: 'Class 10', subjects: ['Mathematics', 'Science'] };
      const teacher = { category: 'school', boards: ['CBSE'], classes: ['Class 10'], subjects: ['Mathematics', 'Science', 'English'] };
      expect(isStrictMatch(student, teacher)).toBe(true);
    });
  });

  test.describe('Suitability Score Calculation', () => {
    test('Awards +50 points per matching subject', () => {
      const student = { category: 'school', subjects: ['Mathematics', 'Science', 'English'] };
      const teacher = { category: 'school', subjects: ['Mathematics', 'Physics', 'English'] };
      // Matches: Math (+50), English (+50) = 100 points
      const score = calculateSuitabilityScore(student, teacher);
      expect(score).toBe(100);
    });

    test('Awards +30 points for Class match', () => {
      const student = { category: 'school', classLevel: 'Class 10' };
      const teacher = { category: 'school', classes: ['Class 10', 'Class 12'] };
      const score = calculateSuitabilityScore(student, teacher);
      expect(score).toBe(30);
    });

    test('Awards +20 points for Board match', () => {
      const student = { category: 'school', board: 'CBSE' };
      const teacher = { category: 'school', boards: ['CBSE', 'ICSE'] };
      const score = calculateSuitabilityScore(student, teacher);
      expect(score).toBe(20);
    });

    test('Awards up to +30 points for perfect budget match', () => {
      const student = { category: 'school', budget: 1000 };
      const teacher = { category: 'school', feeRange: 1000 };
      const score = calculateSuitabilityScore(student, teacher);
      expect(score).toBe(30);
    });

    test('Awards partial points for close budget match', () => {
      const student = { category: 'school', budget: 800 };
      const teacher = { category: 'school', feeRange: 1000 };
      // diff = 200, diffRatio = 200/1000 = 0.2. 30 - (0.2*30) = 24
      const score = calculateSuitabilityScore(student, teacher);
      expect(score).toBe(24);
    });

    test('Awards 0 budget points if gap is huge', () => {
      const student = { category: 'school', budget: 1000 };
      const teacher = { category: 'school', feeRange: 100 };
      // diff = 900, diffRatio = 900/100 = 9. 30 - 270 < 0 -> 0
      const score = calculateSuitabilityScore(student, teacher);
      expect(score).toBe(0);
    });

    test('Combined perfect match awards maximum score', () => {
      const student = { 
        category: 'school',
        subjects: ['Mathematics', 'Science'], 
        classLevel: 'Class 10', 
        board: 'CBSE',
        budget: 1000
      };
      const teacher = { 
        category: 'school',
        subjects: ['Mathematics', 'Science'], 
        classes: ['Class 10'], 
        boards: ['CBSE'],
        feeRange: 1000
      };
      // 100 (2 Subjects) + 30 (Class) + 20 (Board) + 30 (Budget) = 180 points
      const score = calculateSuitabilityScore(student, teacher);
      expect(score).toBe(180);
    });
  });
});
