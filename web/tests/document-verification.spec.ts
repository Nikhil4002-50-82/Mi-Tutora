import { test, expect } from '@playwright/test';
import {
  getRequiredDocuments,
  validatePdfFile,
  isVerificationComplete,
  MAX_DOCUMENT_SIZE_BYTES,
} from '../src/utils/documentVerification';

test.describe('Teacher Document Verification Architecture', () => {

  test.describe('Dynamic Qualification Document Mapping', () => {
    test('10th Qualification requires 10th marksheet only', () => {
      const docs = getRequiredDocuments('10th');
      expect(docs.length).toBe(1);
      expect(docs.map((d) => d.id)).toEqual(['marksheet_10th']);
      expect(docs[0].required).toBe(true);
    });

    test('12th Qualification requires 10th and 12th marksheets', () => {
      const docs = getRequiredDocuments('12th');
      expect(docs.length).toBe(2);
      expect(docs.map((d) => d.id)).toEqual(['marksheet_10th', 'marksheet_12th']);
      expect(docs.every((d) => d.required)).toBe(true);
    });

    test('B.E / B.Tech requires 10th, 12th, and Engineering Degree Certificate', () => {
      const docs = getRequiredDocuments('B.E / B.Tech');
      expect(docs.length).toBe(3);
      expect(docs.map((d) => d.id)).toEqual(['marksheet_10th', 'marksheet_12th', 'degree_certificate']);
      expect(docs[2].label).toContain('B.E / B.Tech');
    });

    test('Bachelor degrees (B.Sc, B.A, B.Com) require 10th, 12th, and Degree Certificate', () => {
      for (const qual of ['B.Sc', 'B.A', 'B.Com']) {
        const docs = getRequiredDocuments(qual);
        expect(docs.length).toBe(3);
        expect(docs.map((d) => d.id)).toEqual(['marksheet_10th', 'marksheet_12th', 'degree_certificate']);
        expect(docs[2].label).toContain(qual);
      }
    });

    test('Master degrees (M.Sc, M.A) require 10th, 12th, Bachelor, and Master Certificates', () => {
      for (const qual of ['M.Sc', 'M.A']) {
        const docs = getRequiredDocuments(qual);
        expect(docs.length).toBe(4);
        expect(docs.map((d) => d.id)).toEqual([
          'marksheet_10th',
          'marksheet_12th',
          'degree_certificate',
          'master_certificate',
        ]);
        expect(docs[3].label).toContain(qual);
      }
    });

    test('PhD requires 10th, 12th, Master, and PhD Degree Certificates', () => {
      const docs = getRequiredDocuments('PhD');
      expect(docs.length).toBe(4);
      expect(docs.map((d) => d.id)).toEqual([
        'marksheet_10th',
        'marksheet_12th',
        'master_certificate',
        'phd_certificate',
      ]);
    });

    test('Other qualification requires 10th, 12th, and highest qualification certificate', () => {
      const docs = getRequiredDocuments('Other');
      expect(docs.length).toBe(3);
      expect(docs.map((d) => d.id)).toEqual([
        'marksheet_10th',
        'marksheet_12th',
        'other_certificate',
      ]);
    });

    test('Invalid or empty qualification returns empty requirements', () => {
      expect(getRequiredDocuments('')).toEqual([]);
      expect(getRequiredDocuments(null as any)).toEqual([]);
      expect(getRequiredDocuments(undefined as any)).toEqual([]);
    });
  });

  test.describe('Strict PDF File Validation', () => {
    test('Accepts valid PDF files under 5MB', () => {
      const validPdf = { name: '10th_marksheet.pdf', size: 1024 * 1024 }; // 1MB
      expect(validatePdfFile(validPdf)).toEqual({ valid: true });

      const uppercasePdf = { name: 'DEGREE_CERTIFICATE.PDF', size: 4.9 * 1024 * 1024 };
      expect(validatePdfFile(uppercasePdf)).toEqual({ valid: true });
    });

    test('Rejects non-PDF files', () => {
      const docx = { name: 'resume.docx', size: 500 * 1024 };
      const resDocx = validatePdfFile(docx);
      expect(resDocx.valid).toBe(false);
      expect(resDocx.error).toContain('Only PDF documents (.pdf) are allowed.');

      const png = { name: 'marksheet.png', size: 2 * 1024 * 1024 };
      expect(validatePdfFile(png).valid).toBe(false);

      const exe = { name: 'malware.exe', size: 100 * 1024 };
      expect(validatePdfFile(exe).valid).toBe(false);
    });

    test('Rejects files exceeding 5MB limit', () => {
      const largePdf = { name: 'marksheet.pdf', size: MAX_DOCUMENT_SIZE_BYTES + 1024 }; // 5.001MB
      const res = validatePdfFile(largePdf);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('exceeds the maximum 5MB limit');
    });

    test('Rejects null or undefined files gracefully', () => {
      expect(validatePdfFile(null as any).valid).toBe(false);
    });
  });

  test.describe('Completeness Checker (isVerificationComplete)', () => {
    test('Returns false if qualification is not selected', () => {
      expect(isVerificationComplete('', {}, {})).toBe(false);
    });

    test('Returns false if required documents are missing', () => {
      // 12th requires 10th and 12th marksheets
      const existing = {
        marksheet_10th: { url: 'https://storage.googleapis.com/doc1.pdf' },
      };
      expect(isVerificationComplete('12th', existing, {})).toBe(false);
    });

    test('Returns true when all documents are present in pending staging', () => {
      const staged = {
        marksheet_10th: { name: '10th.pdf', size: 1024 },
        marksheet_12th: { name: '12th.pdf', size: 1024 },
      };
      expect(isVerificationComplete('12th', {}, staged)).toBe(true);
    });

    test('Returns true when all documents are present in existingDocs', () => {
      const existing = {
        marksheet_10th: { url: 'https://storage.googleapis.com/doc1.pdf' },
        marksheet_12th: { url: 'https://storage.googleapis.com/doc2.pdf' },
      };
      expect(isVerificationComplete('12th', existing, {})).toBe(true);
    });

    test('Returns true for hybrid mix of existing and newly staged documents', () => {
      const existing = {
        marksheet_10th: { url: 'https://storage.googleapis.com/doc1.pdf' },
      };
      const staged = {
        marksheet_12th: { name: '12th.pdf', size: 1024 },
      };
      expect(isVerificationComplete('12th', existing, staged)).toBe(true);
    });

    test('Detects missing degree certificate when upgrading qualification to B.E / B.Tech', () => {
      const existing = {
        marksheet_10th: { url: 'https://storage.googleapis.com/doc1.pdf' },
        marksheet_12th: { url: 'https://storage.googleapis.com/doc2.pdf' },
      };
      // Complete for 12th
      expect(isVerificationComplete('12th', existing, {})).toBe(true);
      // Incomplete for B.E / B.Tech
      expect(isVerificationComplete('B.E / B.Tech', existing, {})).toBe(false);
    });
  });

  test.describe('Proposal Gating & Verification Status Checks', () => {
    function canSendTuitionProposal(profile: any): boolean {
      const hasProfile = !!profile?.phone || !!profile?.category || !!profile?.subjects;
      if (!hasProfile) return false;

      const status = profile?.verificationStatus;
      const hasSubmittedVerification = status === 'pending' || status === 'verified';
      return hasSubmittedVerification;
    }

    test('Blocks proposals if teacher has no profile', () => {
      expect(canSendTuitionProposal(null)).toBe(false);
      expect(canSendTuitionProposal({})).toBe(false);
    });

    test('Blocks proposals if verificationStatus is missing/undefined', () => {
      const profile = {
        phone: '9876543210',
        category: 'school',
        subjects: ['Mathematics'],
        // verificationStatus undefined
      };
      expect(canSendTuitionProposal(profile)).toBe(false);
    });

    test('Blocks proposals if verificationStatus is unsubmitted', () => {
      const profile = {
        phone: '9876543210',
        category: 'school',
        subjects: ['Mathematics'],
        verificationStatus: 'unsubmitted',
      };
      expect(canSendTuitionProposal(profile)).toBe(false);
    });

    test('Blocks proposals if verificationStatus is rejected', () => {
      const profile = {
        phone: '9876543210',
        category: 'school',
        subjects: ['Mathematics'],
        verificationStatus: 'rejected',
      };
      expect(canSendTuitionProposal(profile)).toBe(false);
    });

    test('Allows proposals if verificationStatus is pending (documents submitted)', () => {
      const profile = {
        phone: '9876543210',
        category: 'school',
        subjects: ['Mathematics'],
        verificationStatus: 'pending',
      };
      expect(canSendTuitionProposal(profile)).toBe(true);
    });

    test('Allows proposals if verificationStatus is verified', () => {
      const profile = {
        phone: '9876543210',
        category: 'school',
        subjects: ['Mathematics'],
        verificationStatus: 'verified',
      };
      expect(canSendTuitionProposal(profile)).toBe(true);
    });
  });
});
