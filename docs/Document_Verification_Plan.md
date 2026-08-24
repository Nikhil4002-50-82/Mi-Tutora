# Teacher KYC Document Verification - Implementation Plan

This document outlines the proposed strategy for enforcing mandatory KYC (Know Your Customer) and educational document verification for teachers on the MiTutora platform.

## 1. The "Dynamic Document Map" Strategy
Currently, teachers select their "Highest Qualification" from a dropdown. This strategy involves dynamically spawning the exact file upload boxes required based on that selection.

**How it works:**
- **If they select "10th":** The UI spawns an upload box for `10th Marksheet`.
- **If they select "12th":** The UI spawns `10th Marksheet` AND `12th Marksheet`.
- **If they select "B.E / B.Tech":** The UI spawns `10th`, `12th`, and `B.E / B.Tech Degree`.
- **If they select "M.Sc":** The UI spawns `10th`, `12th`, `B.Sc Degree`, and `M.Sc Degree`.

## 2. File Restrictions & Security
To prevent abuse and maintain a professional database:
- The frontend file pickers will be strictly limited to accepting **PDF files only** (`accept="application/pdf"`).
- We will deploy secure **Firebase Storage Rules** to physically block any user from bypassing the frontend and uploading malicious files (e.g., JPG, PNG, or EXE scripts).
- Files will be capped at **5MB** to ensure Firebase Storage costs remain practically zero.

## 3. Strict Dashboard Enforcement (Option B)
Because existing teachers already have completed profiles, we need a way to force them to upload documents without deleting their accounts.

**The Solution:** 
We update the dashboard logic to check for a new field called `verificationStatus`. If an existing teacher logs in and the system detects they are missing this status, it will instantly pause their dashboard and spawn the `TeacherForm` popup. 
- All of their existing profile data will be perfectly pre-filled. 
- They simply need to scroll down, upload their PDFs, and click "Submit" to unlock their dashboard and continue sending offers.

## 4. Proposed Code Changes (For Developers)

### A. Enable Firebase Storage
- **File:** `web/src/utils/firebase/client.ts`
- **Action:** Import `getStorage` and export the `storage` instance.

### B. Dashboard Lockout Logic
- **File:** `web/src/app/dashboard/teacher/page.tsx`
- **Action:** Update the `hasProfile` condition to:
  `const hasProfile = !!data?.profile?.phone && !!data?.profile?.verificationStatus;`

### C. Dynamic UI & Upload Pipeline
- **File:** `web/src/components/TeacherForm.tsx`
- **Action:** 
  1. Add a `getRequiredDocs(qualification)` helper function.
  2. Inject `<input type="file" accept="application/pdf">` fields below the experience dropdown.
  3. In `handleSubmit()`, run a loop to upload all collected files to `firebase/storage` at the path: `tutor_documents/{tutorId}/{docName}.pdf`.
  4. Inject the retrieved download URLs into the Firestore payload as `verificationDocs: {}` and set `verificationStatus: 'pending'`.

### D. Security Rules
- **File:** `storage.rules`
- **Action:** Add the following strict rules:
  ```javascript
  match /tutor_documents/{userId}/{fileName} {
    allow read: if true; 
    allow write: if request.auth != null 
                 && request.auth.uid == userId 
                 && request.resource.contentType == 'application/pdf'
                 && request.resource.size < 5 * 1024 * 1024;
  }
  ```

## 5. Storage Pricing Note
Firebase Storage provides a generous **Spark (Free) Tier**:
- 5 GB of total storage.
- If we enforce a 5MB limit, the platform can store at least **1,000 max-sized documents** completely for free.
- Realistically, scanned PDFs are ~500KB, meaning the platform can likely store **10,000+ documents** before ever needing to upgrade to the Blaze (Pay-as-you-go) plan.
