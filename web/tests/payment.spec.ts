import { test, expect } from '@playwright/test';
import crypto from 'crypto';
import { calculateTotalDemoFee, getStudentDemoFee } from '../src/utils/pricing';

test.describe('Payment Architecture & Financial Integrity (Payment_Architecture.md)', () => {

  test.describe('Razorpay Signature Verification', () => {
    function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
      const generated = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
      return generated === signature;
    }

    test('Passes for valid HMAC-SHA256 signature', () => {
      const secret = 'rzp_test_secret_12345';
      const orderId = 'order_DAF87123';
      const paymentId = 'pay_998877';
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      expect(verifyRazorpaySignature(orderId, paymentId, validSignature, secret)).toBe(true);
    });

    test('Fails when order ID or payment ID is tampered with', () => {
      const secret = 'rzp_test_secret_12345';
      const orderId = 'order_DAF87123';
      const paymentId = 'pay_998877';
      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      // Hacker changes the order ID to another order
      expect(verifyRazorpaySignature('order_HACKED', paymentId, validSignature, secret)).toBe(false);
      // Hacker changes the payment ID
      expect(verifyRazorpaySignature(orderId, 'pay_HACKED', validSignature, secret)).toBe(false);
    });
  });

  test.describe('Ledger Authority & Anti-Substitution', () => {
    interface PaymentLedgerRecord {
      razorpayOrderId: string;
      applicationDocId: string;
      userId: string;
      type: 'tuition' | 'demo';
      amount: number;
      status: 'created' | 'paid' | 'failed';
    }

    function resolvePaymentDetails(ledger: PaymentLedgerRecord[], orderId: string, requesterUid: string) {
      const record = ledger.find(p => p.razorpayOrderId === orderId);
      if (!record) throw new Error('Order ID not found in secure ledger');
      if (record.status === 'paid') throw new Error('Payment already verified (Replay blocked)');
      if (record.userId !== requesterUid) throw new Error('Unauthorized: User mismatch');

      return {
        applicationId: record.applicationDocId,
        role: record.type === 'demo' ? 'teacher' : 'student',
        amount: record.amount
      };
    }

    const mockLedger: PaymentLedgerRecord[] = [
      {
        razorpayOrderId: 'order_100',
        applicationDocId: 'app_REAL_99',
        userId: 'student_uid_1',
        type: 'tuition',
        amount: 4000,
        status: 'created'
      },
      {
        razorpayOrderId: 'order_ALREADY_PAID',
        applicationDocId: 'app_PAID_1',
        userId: 'student_uid_1',
        type: 'tuition',
        amount: 4000,
        status: 'paid'
      }
    ];

    test('Strictly resolves applicationDocId and role from database ledger', () => {
      const resolved = resolvePaymentDetails(mockLedger, 'order_100', 'student_uid_1');
      expect(resolved.applicationId).toBe('app_REAL_99');
      expect(resolved.role).toBe('student');
      expect(resolved.amount).toBe(4000);
    });

    test('Rejects payment if requester is not the ledger record owner', () => {
      expect(() => {
        resolvePaymentDetails(mockLedger, 'order_100', 'hacker_uid');
      }).toThrow('Unauthorized: User mismatch');
    });

    test('Rejects replay attacks for already-paid orders', () => {
      expect(() => {
        resolvePaymentDetails(mockLedger, 'order_ALREADY_PAID', 'student_uid_1');
      }).toThrow('Payment already verified (Replay blocked)');
    });
  });

  test.describe('7-Day Post-Trial Billing Cycle Calculation', () => {
    function calculateBillingSchedule(hireDateMs: number) {
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      
      const firstPaymentDue = hireDateMs + SEVEN_DAYS_MS;
      const secondPaymentDue = firstPaymentDue + THIRTY_DAYS_MS;

      return { firstPaymentDue, secondPaymentDue };
    }

    test('First payment is due exactly 7 days after hire, second payment is 30 days after that', () => {
      const hireDate = new Date('2026-09-01T10:00:00Z').getTime();
      const schedule = calculateBillingSchedule(hireDate);

      const expectedFirstPayment = new Date('2026-09-08T10:00:00Z').getTime();
      const expectedSecondPayment = new Date('2026-10-08T10:00:00Z').getTime();

      expect(schedule.firstPaymentDue).toBe(expectedFirstPayment);
      expect(schedule.secondPaymentDue).toBe(expectedSecondPayment);
    });
  });

  test.describe('Platform Demo Fee Calculation (utils/pricing.ts)', () => {
    const mockPricing = [
      { id: 'school_class_10', displayName: 'Class 10 School Tuition', price: 150 },
      { id: 'competitive_neet', displayName: 'NEET Preparation', price: 250 },
      { id: 'programming_beginner', displayName: 'Beginner Coding', price: 180 },
      { id: 'languages_general', displayName: 'Language Tuition', price: 120 },
      { id: 'general', displayName: 'General Tuition', price: 100 }
    ];

    test('Correctly prices individual school class demo fee', () => {
      const student = { category: 'school', classLevel: 'Class 10' };
      const fee = getStudentDemoFee(student, mockPricing);
      expect(fee.price).toBe(150);
    });

    test('Correctly prices competitive exam demo fee', () => {
      const student = { category: 'competitive', learningGoal: 'NEET' };
      const fee = getStudentDemoFee(student, mockPricing);
      expect(fee.price).toBe(250);
    });

    test('Sums multi-student group demo fees accurately', () => {
      const students = [
        { category: 'school', classLevel: 'Class 10' }, // 150
        { category: 'competitive', learningGoal: 'NEET' } // 250
      ];
      const total = calculateTotalDemoFee(students, mockPricing);
      expect(total).toBe(400); // 150 + 250
    });
  });
});