import { test, expect } from '@playwright/test';

test.describe('Cloud Scheduler & Time-Lock Architecture', () => {

  test.describe('Demo Meeting Link Time-Lock & IST Parsing', () => {
    function evaluateDemoLinkAccess(demoDate: string, demoTime: string, mockNowTimestamp: number) {
      if (!demoDate || !demoTime) {
        return { allowed: false, error: 'Demo date and time are not fully set' };
      }

      const cleanTime = demoTime.split('||')[0].trim();
      const formattedTime = cleanTime.length === 5 ? `${cleanTime}:00` : cleanTime;
      const demoDateObj = new Date(`${demoDate}T${formattedTime}+05:30`);

      if (isNaN(demoDateObj.getTime())) {
        return { allowed: false, error: 'Invalid demo date or time format' };
      }

      const allowedEntryTime = new Date(demoDateObj.getTime() - 5 * 60 * 1000);
      const lockExpiryTime = new Date(demoDateObj.getTime() + 90 * 60 * 1000);

      if (mockNowTimestamp < allowedEntryTime.getTime()) {
        return { allowed: false, error: 'Too early to join. The link will unlock 5 minutes before the scheduled time.' };
      }

      if (mockNowTimestamp > lockExpiryTime.getTime()) {
        return { allowed: false, error: 'Demo class time window has expired.' };
      }

      return { allowed: true };
    }

    test('Locks link when user attempts access 15 minutes before demo', () => {
      // Demo at 16:30 IST on 2026-09-10
      const demoDate = '2026-09-10';
      const demoTime = '16:30||4:30 PM';
      // 16:15 IST (15 minutes before)
      const mockNow = new Date('2026-09-10T16:15:00+05:30').getTime();

      const result = evaluateDemoLinkAccess(demoDate, demoTime, mockNow);
      expect(result.allowed).toBe(false);
      expect(result.error).toContain('Too early to join');
    });

    test('Unlocks link exactly 5 minutes before scheduled demo time', () => {
      const demoDate = '2026-09-10';
      const demoTime = '16:30||4:30 PM';
      // Exactly 16:25 IST (5 minutes before)
      const mockNow = new Date('2026-09-10T16:25:00+05:30').getTime();

      const result = evaluateDemoLinkAccess(demoDate, demoTime, mockNow);
      expect(result.allowed).toBe(true);
    });

    test('Allows access during class time (e.g. 20 minutes in)', () => {
      const demoDate = '2026-09-10';
      const demoTime = '16:30';
      // 16:50 IST (20 minutes into class)
      const mockNow = new Date('2026-09-10T16:50:00+05:30').getTime();

      const result = evaluateDemoLinkAccess(demoDate, demoTime, mockNow);
      expect(result.allowed).toBe(true);
    });

    test('Locks link after 90-minute window has elapsed', () => {
      const demoDate = '2026-09-10';
      const demoTime = '16:30';
      // 18:05 IST (95 minutes later)
      const mockNow = new Date('2026-09-10T18:05:00+05:30').getTime();

      const result = evaluateDemoLinkAccess(demoDate, demoTime, mockNow);
      expect(result.allowed).toBe(false);
      expect(result.error).toContain('time window has expired');
    });

    test('Correctly handles timezone conversions against UTC server time', () => {
      // 16:30 IST is 11:00 UTC
      const demoDate = '2026-09-10';
      const demoTime = '16:30';
      // Test at 10:56 UTC (which is 16:26 IST, 4 minutes before demo)
      const mockUtcNow = new Date('2026-09-10T10:56:00Z').getTime();

      const result = evaluateDemoLinkAccess(demoDate, demoTime, mockUtcNow);
      expect(result.allowed).toBe(true);
    });
  });

  test.describe('48-Hour Decision Window Expiry Engine', () => {
    const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

    function evaluateDecisionExpiry(completedAt: number, now: number) {
      if (!completedAt || completedAt <= 0) return { expired: false, remainingHours: 0 };
      const elapsed = now - completedAt;
      const isExpired = elapsed > FORTY_EIGHT_HOURS_MS;
      return {
        expired: isExpired,
        remainingHours: isExpired ? 0 : Math.max(0, (FORTY_EIGHT_HOURS_MS - elapsed) / (1000 * 60 * 60)),
      };
    }

    test('Leaves decision active when 24 hours have elapsed', () => {
      const completedAt = Date.now() - (24 * 60 * 60 * 1000);
      const res = evaluateDecisionExpiry(completedAt, Date.now());
      expect(res.expired).toBe(false);
      expect(res.remainingHours).toBeCloseTo(24, 0);
    });

    test('Leaves decision active at 47 hours and 50 minutes', () => {
      const completedAt = Date.now() - (47.83 * 60 * 60 * 1000);
      const res = evaluateDecisionExpiry(completedAt, Date.now());
      expect(res.expired).toBe(false);
      expect(res.remainingHours).toBeGreaterThan(0);
    });

    test('Marks decision expired when 48 hours and 1 minute have elapsed', () => {
      const completedAt = Date.now() - (48.02 * 60 * 60 * 1000);
      const res = evaluateDecisionExpiry(completedAt, Date.now());
      expect(res.expired).toBe(true);
      expect(res.remainingHours).toBe(0);
    });
  });

  test.describe('Firestore Escrow Batch Chunking Protection', () => {
    test('Chunks operations strictly into sub-400 batches to prevent 500-op limit failures', () => {
      const MAX_BATCH_SIZE = 400;
      const totalOperations = 950;
      const batches: number[] = [];

      let currentBatchCount = 0;
      for (let i = 0; i < totalOperations; i++) {
        currentBatchCount++;
        if (currentBatchCount >= MAX_BATCH_SIZE) {
          batches.push(currentBatchCount);
          currentBatchCount = 0;
        }
      }
      if (currentBatchCount > 0) {
        batches.push(currentBatchCount);
      }

      expect(batches.length).toBe(3);
      expect(batches[0]).toBe(400);
      expect(batches[1]).toBe(400);
      expect(batches[2]).toBe(150);
      expect(batches.every((b) => b <= 400)).toBe(true);
    });
  });

  test.describe('Weekly Token Quota Monday Rollover Timing', () => {
    function getWeekStartDate(date: Date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${dayStr}`;
    }

    test('Identifies the exact Monday for any weekday in the week', () => {
      // 2026-09-03 is a Thursday
      const thursday = new Date('2026-09-03T12:00:00Z');
      expect(getWeekStartDate(thursday)).toBe('2026-08-31');

      // 2026-09-06 is a Sunday
      const sunday = new Date('2026-09-06T12:00:00Z');
      expect(getWeekStartDate(sunday)).toBe('2026-08-31');

      // 2026-09-07 is the next Monday
      const nextMonday = new Date('2026-09-07T00:00:00Z');
      expect(getWeekStartDate(nextMonday)).toBe('2026-09-07');
    });
  });
});
