import { test, expect } from '@playwright/test';
import { calculateSuitabilityScore, isStrictMatch, calculateDistanceKm } from '../src/utils/matching';

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

    test('Returns false if Teacher is Online and Student is Offline', () => {
      const student = { category: 'school', board: 'CBSE', classLevel: 'Class 10', subjects: ['Mathematics', 'Science'], mode: 'Offline' };
      const teacher = { category: 'school', boards: ['CBSE'], classes: ['Class 10'], subjects: ['Mathematics', 'Science'], mode: 'Online' };
      expect(isStrictMatch(student, teacher)).toBe(false);
    });

    test('Returns false if Teacher is Offline and Student is Online', () => {
      const student = { category: 'school', board: 'CBSE', classLevel: 'Class 10', subjects: ['Mathematics', 'Science'], mode: 'Online' };
      const teacher = { category: 'school', boards: ['CBSE'], classes: ['Class 10'], subjects: ['Mathematics', 'Science'], mode: 'Offline' };
      expect(isStrictMatch(student, teacher)).toBe(false);
    });

    test('Returns true if both Teacher and Student are Online', () => {
      const student = { category: 'school', board: 'CBSE', classLevel: 'Class 10', subjects: ['Mathematics', 'Science'], mode: 'Online' };
      const teacher = { category: 'school', boards: ['CBSE'], classes: ['Class 10'], subjects: ['Mathematics', 'Science'], mode: 'Online' };
      expect(isStrictMatch(student, teacher)).toBe(true);
    });

    test('Returns true if both Teacher and Student are Offline', () => {
      const student = { category: 'school', board: 'CBSE', classLevel: 'Class 10', subjects: ['Mathematics', 'Science'], mode: 'Offline (Home Tuition)' };
      const teacher = { category: 'school', boards: ['CBSE'], classes: ['Class 10'], subjects: ['Mathematics', 'Science'], mode: 'Offline' };
      expect(isStrictMatch(student, teacher)).toBe(true);
    });

    test('Returns false if Teacher is Offline for programming student (forced online category)', () => {
      const student = { category: 'programming', technologies: ['Python'] };
      const teacher = { category: 'programming', technologies: ['Python'], mode: 'Offline' };
      expect(isStrictMatch(student, teacher)).toBe(false);
    });
  });

  test.describe('Haversine Distance (calculateDistanceKm)', () => {
    test('Returns Infinity if any coordinate is 0 or invalid', () => {
      expect(calculateDistanceKm(0, 0, 12.9716, 77.5946)).toBe(Infinity);
      expect(calculateDistanceKm(12.9716, 77.5946, 0, 0)).toBe(Infinity);
      expect(calculateDistanceKm(NaN, 77.5946, 12.9716, 77.5946)).toBe(Infinity);
    });

    test('Accurately computes distance between coordinates', () => {
      // Bangalore Center (12.9716, 77.5946) to Indiranagar (12.9784, 77.6408) is approx ~5.1 km
      const distance = calculateDistanceKm(12.9716, 77.5946, 12.9784, 77.6408);
      expect(distance).toBeGreaterThan(4.5);
      expect(distance).toBeLessThan(5.5);
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

    test('Awards +20 points for Aadhar Verification badge', () => {
      const student = { category: 'school' };
      const teacher = { category: 'school', aadharVerified: true };
      const score = calculateSuitabilityScore(student, teacher);
      expect(score).toBe(20);
    });

    test('Awards +20 points for Pro Subscription badge', () => {
      const student = { category: 'school' };
      const teacherPro = { 
        category: 'school', 
        subscriptionPlan: 'pro',
        subscriptionExpiry: Date.now() + 86400000 // Valid future expiry
      };
      const teacherSubscribed = { 
        category: 'school', 
        isSubscribed: true,
        subscriptionExpiry: Date.now() + 86400000 // Valid future expiry
      };
      
      expect(calculateSuitabilityScore(student, teacherPro)).toBe(20);
      expect(calculateSuitabilityScore(student, teacherSubscribed)).toBe(20);
    });

    test('Awards offline proximity points correctly', () => {
      // Base student in Koramangala
      const baseStudent = {
        category: 'school',
        mode: 'offline',
        latitude: 12.9352,
        longitude: 77.6245
      };

      // Teacher 1: ~1.5km away (<= 3km -> +30 points)
      const closeTeacher = {
        category: 'school',
        mode: 'offline',
        latitude: 12.9380,
        longitude: 77.6320
      };
      expect(calculateSuitabilityScore(baseStudent, closeTeacher)).toBe(30);

      // Teacher 2: ~5.1km away (> 3km && <= 6km -> +20 points)
      const midTeacher = {
        category: 'school',
        mode: 'offline',
        latitude: 12.9716,
        longitude: 77.5946
      };
      expect(calculateSuitabilityScore(baseStudent, midTeacher)).toBe(20);

      // Teacher 3: ~8.5km away (> 6km && <= 10km -> +10 points)
      const farTeacher = {
        category: 'school',
        mode: 'offline',
        latitude: 13.0068,
        longitude: 77.6006
      };
      expect(calculateSuitabilityScore(baseStudent, farTeacher)).toBe(10);

      // Teacher 4: ~25km away (> 10km -> +0 points)
      const veryFarTeacher = {
        category: 'school',
        mode: 'offline',
        latitude: 13.1986,
        longitude: 77.7066
      };
      expect(calculateSuitabilityScore(baseStudent, veryFarTeacher)).toBe(0);
    });

    test('Does not award proximity points for online mode', () => {
      const studentOnline = {
        category: 'school',
        mode: 'online',
        latitude: 12.9352,
        longitude: 77.6245
      };
      const closeTeacher = {
        category: 'school',
        mode: 'offline',
        latitude: 12.9380,
        longitude: 77.6320
      };
      expect(calculateSuitabilityScore(studentOnline, closeTeacher)).toBe(0);
    });

    test('Does not crash or award points when coordinates are missing or 0', () => {
      const student = { category: 'school', mode: 'offline', latitude: 0, longitude: 0 };
      const teacher = { category: 'school', mode: 'offline' };
      expect(calculateSuitabilityScore(student, teacher)).toBe(0);
    });

    test('Calculates scores for Programming category', () => {
      const student = { category: 'programming', technologies: ['Python', 'React'] };
      const teacher = { category: 'programming', technologies: ['Python', 'Node.js', 'React'] };
      // 2 matches: Python (+50), React (+50) = 100
      expect(calculateSuitabilityScore(student, teacher)).toBe(100);
    });

    test('Calculates scores for Languages category', () => {
      const student = { category: 'languages', languages: ['French', 'Spanish'] };
      const teacher = { category: 'languages', languagesTaught: ['French', 'German'] };
      // 1 match: French (+50) = 50
      expect(calculateSuitabilityScore(student, teacher)).toBe(50);
    });

    test('Combined perfect match awards maximum score including Aadhar and Pro boosts', () => {
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
        feeRange: 1000,
        aadharVerified: true,
        subscriptionPlan: 'pro',
        subscriptionExpiry: Date.now() + 86400000
      };
      // 100 (2 Subjects) + 30 (Class) + 20 (Board) + 30 (Budget) + 20 (Aadhar) + 20 (Pro) = 220 points
      const score = calculateSuitabilityScore(student, teacher);
      expect(score).toBe(220);
    });

    test('Prevents false positive matches for short tokens (e.g. C does not match CSS or React)', () => {
      const student = { category: 'programming', technologies: ['C'] };
      const teacher = { category: 'programming', technologies: ['CSS', 'React', 'JavaScript'] };
      expect(isStrictMatch(student, teacher)).toBe(false);
      expect(calculateSuitabilityScore(student, teacher)).toBe(0);
    });

    test('Prevents false positive match for Science vs Social Science', () => {
      const student = { category: 'school', board: 'CBSE', classLevel: 'Class 10', subjects: ['Science'] };
      const teacher = { category: 'school', boards: ['CBSE'], classes: ['Class 10'], subjects: ['Social Science'] };
      expect(isStrictMatch(student, teacher)).toBe(false);
      expect(calculateSuitabilityScore(student, teacher)).toBe(50); // Class (30) + Board (20) = 50, but 0 subject points
    });
  });
});

