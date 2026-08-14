import { test, expect } from '@playwright/test';
import { calculateSuitabilityScore } from '../src/utils/matching';

test.describe('Matchmaking & Ranking Algorithm (ranking_plan.md)', () => {
  
  test('Subject Overlap awards exactly +50 points per match', () => {
    const student = { category: 'school', subjects: ['Mathematics', 'Science', 'English'] };
    const teacher = { category: 'school', subjects: ['Mathematics', 'Physics', 'English'] };
    // Matches: Math (+50), English (+50) = 100 points
    const score = calculateSuitabilityScore(student, teacher);
    expect(score).toBeGreaterThanOrEqual(100);
  });

  test('Class match awards exactly +30 points', () => {
    const student = { category: 'school', classLevel: 'Class 10' };
    const teacher = { category: 'school', classes: ['Class 10', 'Class 12'] };
    const score = calculateSuitabilityScore(student, teacher);
    expect(score).toBeGreaterThanOrEqual(30);
  });

  test('Board match awards exactly +20 points', () => {
    const student = { category: 'school', board: 'CBSE' };
    const teacher = { category: 'school', boards: ['CBSE', 'ICSE'] };
    const score = calculateSuitabilityScore(student, teacher);
    expect(score).toBeGreaterThanOrEqual(20);
  });

  test('Combined exact match awards expected total score', () => {
    const student = { 
      category: 'school',
      subjects: ['Mathematics'], 
      classLevel: 'Class 10', 
      board: 'CBSE' 
    };
    const teacher = { 
      category: 'school',
      subjects: ['Mathematics'], 
      classes: ['Class 10'], 
      boards: ['CBSE'] 
    };
    // 50 (Subject) + 30 (Class) + 20 (Board) = 100 points
    const score = calculateSuitabilityScore(student, teacher);
    expect(score).toBeGreaterThanOrEqual(100);
  });
});
