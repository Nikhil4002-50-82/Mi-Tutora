# Referral System Analysis

I have reviewed the codebase to understand how the referral system is implemented across the student/parent portal and teacher dashboard, as well as the database schema. Here is my analysis of the current state and potential areas that may need fixing or enhancement.

## 1. Database Schema
Based on `db_analyzer/schema_report.md`:
*   **`users` collection**: Contains `referralCode` (the user's unique code), `referredBy` (who referred them), and `walletBalance`.
*   **`referrals` collection**: Tracks individual referral events. Documents contain `referrerId`, `referredUserId`, `referralCode`, `status`, `estimatedReward`, `referralType`, and `createdAt`.

## 2. Code Generation (`utils/referral.ts`)
*   The referral code is generated using the first 4 alphabetical characters of the user's name (padded with 'X' if shorter) and a 6-character chunk from their UID.
*   **Format**: `NAME-UIDCHUN` (Always Uppercase).

## 3. Frontend Implementation & Flows
### A. Student & Parent Portal (`dashboard/student/page.tsx`)
*   **Auto-Generation**: A `useEffect` hook checks if the user has a `referralCode` (or `referralcode`). If not, it generates one on the fly and updates the Firestore `users` document.
*   **Silent Demo Submission**: If a user comes from a landing page and submits a demo form, the portal silently processes it and assigns a referral code. If a parent name isn't provided, it falls back to the student's name or `"Unknown Parent"` (which could generate an odd code like `UNKN-XXXXXX`).
*   **UI Display**: The "Referrals" tab shows the generated code with a copy-to-clipboard button and lists any referrals found where `referrerId == user.uid`. It displays a message: *"Earn 25% of the initial company margin... when your friend books their first class!"*

*(Note: The student and parent portal are essentially the same page in this architecture, utilizing parent IDs and student profiles within the same dashboard).*

### B. Teacher Portal (`dashboard/teacher/page.tsx`)
*   Very similar implementation to the student portal. Auto-generates the code if missing and displays it under a dedicated "Referrals" tab.

### C. Signup Flow (`signup/page.tsx`)
*   The signup page captures the `?ref=` parameter from the URL.
*   During registration, it queries the `users` collection for `where('referralCode', '==', referralCode.trim().toUpperCase())`.
*   If a match is found, it adds a new document to the `referrals` collection with `status: 'pending'` and `estimatedReward: 0`. It also tags the new user document with `referredBy`.

## 4. Identified Issues & Potential Fixes

1.  **Field Naming Inconsistencies**: 
    The codebase checks for both `referralCode` and `referralcode` (lowercase 'c') when displaying the code: `data?.userData?.referralCode || data?.userData?.referralcode`. 
    *Issue*: Firestore queries are case-sensitive. If a user's code was accidentally saved under the key `referralcode`, the query during signup (`where('referralCode', '==', ...)`) will fail to find the referrer, and they won't get credit.
2.  **Missing Reward Distribution Logic**:
    Currently, new referrals are inserted with `status: 'pending'` and `estimatedReward: 0`. There doesn't appear to be any frontend logic (or visible backend logic in this repo) that detects when a referred student "books their first class" to update the referral status to "successful" and add funds to the referrer's `walletBalance`.
3.  **Silent Submission Edge Cases**: 
    When generating codes for silently submitted forms, the fallback `fullName` could result in weird referral codes. It might be better to strictly rely on the authenticated user's profile data.
4.  **No "Parent Specific" Referral View**: 
    Although you mentioned "student and parent portal", they share the exact same UI tab. If parents are supposed to have different referral incentives or a different view from the students, that distinction is currently missing.

---

**Next Steps:**
I am ready for your instructions! Please let me know what specific changes or fixes you'd like to implement based on this analysis.
