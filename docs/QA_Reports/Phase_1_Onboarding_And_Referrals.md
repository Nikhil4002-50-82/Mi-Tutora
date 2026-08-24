# QA Test Report: Phase 1 (Onboarding & Referrals)
**Date:** August 24, 2026
**Status:** PASS ✅

## 1. Teacher Onboarding & Profile Setup
- **Test Steps:** Sign up via Google Auth as a Teacher -> Complete the multi-step Profile form.
- **Expected Result:** Form submits successfully. Formal name is stored in the `tutors` collection and the `users` collection. A unique Referral Code is generated *only after* profile completion.
- **Actual Result:** PASS.

## 2. Student Onboarding & Profile Setup
- **Test Steps:** Sign up via Google Auth as a Student -> Complete the Parent/Student details form.
- **Expected Result:** Form mathematically correctly handles empty inputs (e.g., clearing the input box to 0). Form submits successfully. Formal name is stored. Referral code generated successfully.
- **Actual Result:** PASS. Bug involving crash on empty input box successfully resolved.

## 3. Referral Tracking & Identity Sync
- **Test Steps (Method A - Magic Link):** User A shares magic link URL -> User B clicks link and signs up via Google Auth.
- **Test Steps (Method B - Manual Entry):** User B signs up via Google Auth -> Manually enters User A's unique Referral Code in the popup modal.
- **Expected Result:** 
  1. For Method A, link is securely tracked in `localStorage`. For Method B, manual code is validated against the database.
  2. Pending ticket created in `referrals` collection upon Google Auth.
  3. When User B completes Profile Setup, the pending referral ticket retroactively updates to display User B's formal professional name.
- **Actual Result:** PASS. Both Magic Link and Manual Code Entry workflows successfully capture the referral. Identity sync works perfectly across all collections for both Teacher and Student referrers.

## 4. Real-Time Dashboard Updates
- **Test Steps:** User A keeps dashboard open -> User B completes signup using User A's code.
- **Expected Result:** User A's "Refer & Earn" tab instantly displays the new pending referral ticket without requiring a browser refresh.
- **Actual Result:** PASS. `onSnapshot` websocket listeners successfully implemented and verified for both Teacher and Student dashboards.
