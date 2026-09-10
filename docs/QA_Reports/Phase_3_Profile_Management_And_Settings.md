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

## 5. Teacher Resume & Optional Educational Document Verification
- **Test Steps:**
  1. Open `TeacherForm` profile setup/edit modal; verify compulsory Resume/CV upload is enforced (`.pdf`, `.doc`, `.docx` up to 5MB).
  2. Select highest qualification (e.g., "12th Pass", "Post Graduate", etc.) and verify dynamic optional document slots appear for supplementary certificates.
  3. Attempt uploading non-PDF files or files > 5MB for educational certificates to test validation rejections.
  4. Verify form submission succeeds when Resume is present, even if optional educational certificates are omitted (`required: false`).
  5. Upload optional certificates, submit form, and verify Firebase Storage upload under `tutor_documents/{uid}/...` and Firestore `tutors` document updates (`resume`, `resumeUrl`, `verificationDocs`, `verificationStatus: 'pending'`, `verificationSubmittedAt`).
  6. Verify proposal gating in Teacher Dashboard (`handleMakeOffer`, `handleDirectRequestDemo`) requires a completed profile with Resume on file.
- **Expected Result:** Resume is compulsory for proposal unlocking; educational certificates adapt to qualification as optional attachments; PDF format and 5MB size limits enforced; uploads store cleanly in Firebase Storage; proposal buttons enforce resume completeness.
- **Actual Result:** PASS ✅ (Validated with Playwright automated suite `web/tests/document-verification.spec.ts` - 18/18 tests passing).

