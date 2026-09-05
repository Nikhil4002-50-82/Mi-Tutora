# QA Test Report: Phase 3 (Profile Management & Settings)
**Date:** August 24, 2026
**Status:** PASS ✅

## 1. Onboarding Forms & Data Sync
- **Test Steps:** Complete the multi-step `TeacherForm` and `DemoForm` (Student/Parent), ensuring referral codes, identity verification, and base profile structures are generated.
- **Expected Result:** Database `users`, `tutors`, and `parents` collections are fully synchronized with correct roles and metadata.
- **Actual Result:** PASS.

## 2. Profile Completeness Metrics
- **Test Steps:** Observe the "Profile Completeness" dashboard card. Add/remove information (e.g., bio, subjects, availability).
- **Expected Result:** The metric accurately calculates missing fields and dynamically updates the UI percentage gauge in real time.
- **Actual Result:** PASS.

## 3. Account Deletion (Single-Role)
- **Test Steps:** Log into a single-role account (e.g., only a Student). Navigate to Account Settings and click "Permanently Delete".
- **Expected Result:** The system fully deletes all associated Firebase Firestore collections (`parents`, `students`, `requests`), deletes the main `users` document, AND successfully executes `deleteUser(auth.currentUser)` to wipe the email/password from the Firebase Authentication tab.
- **Actual Result:** PASS.

## 4. Account Deletion (Dual-Role)
- **Test Steps:** Log into a dual-role account (e.g., both Teacher and Student). Attempt to delete the Teacher profile.
- **Expected Result:** The system deletes Teacher-specific sub-documents and removes the "teacher" flag from the `roles` array. Crucially, it does *not* delete the Firebase Authentication record, and safely redirects the user to their remaining Student dashboard.
- **Actual Result:** PASS.

## 5. Educational Document Verification (Compulsory Onboarding & Proposal Gating)
- **Test Steps:**
  1. Open `TeacherForm` profile setup/edit modal and select highest qualification (e.g., "12th Pass", "Post Graduate", etc.).
  2. Verify dynamic document slots appear requiring specific PDF certificates (e.g., 10th + 12th Marks Card for 12th Pass, Master's + Bachelor's + 12th + 10th for Post Graduate).
  3. Attempt uploading non-PDF files or files > 5MB to test validation rejections.
  4. Attempt form submission without all required documents uploaded; verify blocking error toast and visual indicators.
  5. Complete full uploads, submit form, and verify Firebase Storage upload under `verification_docs/{uid}/{docKey}_{timestamp}.pdf` and Firestore `tutors` document updates (`verificationDocs`, `verificationStatus: 'pending'`, `verificationSubmittedAt`).
  6. Verify proposal gating in Teacher Dashboard (`handleMakeOffer`, `handleDirectRequestDemo`) blocks proposals if verification is incomplete or rejected.
- **Expected Result:** Dynamic document upload slots accurately adapt to highest qualification; PDF format and 5MB size limits enforced; uploads store cleanly in Firebase Storage; Firestore records `verificationDocs` and `verificationStatus`; proposal buttons enforce document completeness.
- **Actual Result:** PASS ✅ (Validated with Playwright automated suite `web/tests/document-verification.spec.ts` - 6/6 tests passing).

