# Teacher Educational Document Verification Architecture

This document outlines the business rules, security configurations, database schemas, and frontend integration for the **Compulsory Educational Document Verification Feature** built into the Mi-Tutora Teacher Portal.

---

## 1. System Overview

To establish maximum trust and safety between educators and parents, every teacher on the Mi-Tutora platform must provide official educational certificates/marksheets in **PDF format**. 

The documents required from each teacher are determined dynamically based on their selected **Highest Qualification**. Teachers cannot submit proposals (`make_offer` or `handleDirectRequestDemo`) without first submitting all required certificates.

```mermaid
flowchart TD
    A[Teacher Selects Highest Qualification] --> B[Dynamic Document Mapping]
    B --> C[Teacher Selects Required PDF Documents]
    C --> D{Strict Client Validation: PDF & <= 5MB?}
    D -- No --> E[Reject File & Alert User]
    D -- Yes --> F[Stage File in UI]
    F --> G[Teacher Clicks Save Profile]
    G --> H{All Required Docs Present?}
    H -- No --> I[Block Submission & Display Error]
    H -- Yes --> J[Upload to Firebase Storage: /tutor_documents/{userId}/...]
    J --> K[Obtain Download URLs]
    K --> L[Update Firestore: tutors.verificationDocs & status: 'pending']
    L --> M[Tuition Proposal Sending Unlocked]
```

---

## 2. Dynamic Qualification Document Mapping

The document matrix is dynamically resolved via `getRequiredDocuments(qualification)` in [`web/src/utils/documentVerification.ts`](../web/src/utils/documentVerification.ts). Every qualification strictly enforces the prerequisite marksheets:

| Qualification | Required Documents | Description |
| :--- | :--- | :--- |
| **`10th`** | • 10th Standard Marksheet | Class 10 / SSLC / Matriculation marksheet or passing certificate |
| **`12th`** | • 10th Standard Marksheet<br>• 12th / PUC Marksheet | Class 12 / PUC / Intermediate / Diploma marksheet |
| **`B.E / B.Tech`** | • 10th Standard Marksheet<br>• 12th / PUC Marksheet<br>• B.E / B.Tech Degree Certificate | Engineering degree certificate, provisional certificate, or consolidated marksheet |
| **`B.Sc`** | • 10th Standard Marksheet<br>• 12th / PUC Marksheet<br>• B.Sc Degree Certificate | Bachelor of Science degree certificate or final marksheet |
| **`B.A`** | • 10th Standard Marksheet<br>• 12th / PUC Marksheet<br>• B.A Degree Certificate | Bachelor of Arts degree certificate or final marksheet |
| **`B.Com`** | • 10th Standard Marksheet<br>• 12th / PUC Marksheet<br>• B.Com Degree Certificate | Bachelor of Commerce degree certificate or final marksheet |
| **`M.Sc`** | • 10th Standard Marksheet<br>• 12th / PUC Marksheet<br>• Bachelor Degree Certificate<br>• M.Sc Degree Certificate | Master of Science degree certificate or final consolidated marksheet |
| **`M.A`** | • 10th Standard Marksheet<br>• 12th / PUC Marksheet<br>• Bachelor Degree Certificate<br>• M.A Degree Certificate | Master of Arts degree certificate or final consolidated marksheet |
| **`PhD`** | • 10th Standard Marksheet<br>• 12th / PUC Marksheet<br>• Master Degree Certificate<br>• Doctorate / PhD Certificate | Doctoral degree certificate or official provisional notification |
| **`Other`** | • 10th Standard Marksheet<br>• 12th / PUC Marksheet<br>• Highest Qualification Certificate | Official degree, diploma, or marksheet for highest qualification |

---

## 3. File Restrictions & Security Enforcements

To prevent storage abuse, prevent script injection, and ensure platform security:

1. **Strict Format Validation:** Only PDF documents (`.pdf`, `application/pdf`) are accepted. Image formats (`.jpg`, `.png`), Word documents (`.docx`), and executables (`.exe`) are strictly rejected by both client and storage rules.
2. **Strict Size Limit:** Every file is limited to a maximum of **5MB** (`MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024`).
3. **Safe File Sanitization:** Uploaded file names are sanitized to prevent path traversal attacks:
   ```typescript
   const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
   ```

---

## 4. Firebase Storage Architecture & Security Rules

### Storage Path Scheme
Uploaded documents are isolated per authenticated tutor in Firebase Storage:
```
tutor_documents/{userId}/{docId}_{timestamp}_{safeFileName}
```
*Example:* `tutor_documents/abc123xyz/marksheet_10th_1788640000000_10th_marksheet.pdf`

### Storage Security Rules ([`storage.rules`](../storage.rules))
The bucket rules enforce authenticated ownership, MIME type verification, and file size limits server-side:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /tutor_documents/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && request.auth.uid == userId 
                   && request.resource.contentType == 'application/pdf'
                   && request.resource.size <= 5 * 1024 * 1024;
    }
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 5. Database Schema (Firestore)

The educational document records and review states are stored directly on the tutor's root document in the `tutors` collection:

**Collection:** `tutors`

| Field Name | Type | Expected Values | Description & Purpose |
| :--- | :--- | :--- | :--- |
| `verificationDocs` | `map` | `Record<string, DocumentRecord>` | Map keyed by document ID (`marksheet_10th`, `marksheet_12th`, etc.) containing download URL, original file name, and upload timestamp. |
| `verificationStatus` | `string` | `'pending'` \| `'verified'` \| `'rejected'` | Review lifecycle status. Set to `'pending'` when documents are uploaded. Updated by admin to `'verified'` or `'rejected'`. |
| `verificationSubmittedAt` | `number` | Epoch timestamp in ms | Millisecond timestamp when documents were submitted. |

### Document Record Schema (`verificationDocs[docId]`)
```typescript
interface DocumentRecord {
  url: string;        // Firebase Storage download URL
  fileName: string;   // Original uploaded file name
  uploadedAt: number; // Date.now() timestamp
}
```

---

## 6. Frontend UI & Proposal Gating

### A. Profile Form Integration ([`TeacherForm.tsx`](../web/src/components/TeacherForm.tsx))
- **Dynamic File Picker Grid:** Renders compulsory upload cards based on the selected `formData.qualification`.
- **Live State Badging:**
  - **Staged File:** Shows file name, size in MB, "Ready to upload" badge, and a remove button.
  - **Uploaded File:** Shows "✓ Uploaded", a "View" link opening the PDF in a new tab, and a "Replace" button.
- **Form Submission Lock:** `isVerificationComplete()` blocks form submission if any required certificate for the active qualification is missing.
- **Progress Feedback:** Submit button displays animated loader and live upload status (`Uploading [filename]...`).
- **Read-Only Profile Card:** Displays an Educational Verification Documents summary card with status badges (`Verified`, `Pending Verification`, `Action Required`) and "View PDF" links.

### B. Proposal Gating ([`dashboard/teacher/page.tsx`](../web/src/app/dashboard/teacher/page.tsx))
Sending tuition proposals is gated strictly by document verification:
```typescript
const verificationStatus = data?.profile?.verificationStatus;
const hasSubmittedVerification = verificationStatus === 'pending' || verificationStatus === 'verified';
```
- In `handleMakeOffer`: If `!hasSubmittedVerification`, the proposal is blocked, an error toast is shown, and the teacher is redirected to their profile.
- In `handleDirectRequestDemo`: If `!hasSubmittedVerification`, the demo request is blocked, an error toast is shown, and the teacher is redirected to their profile.

---

## 7. Automated Test Coverage

The feature is protected by 24 automated unit and integration tests in [`web/tests/document-verification.spec.ts`](../web/tests/document-verification.spec.ts):
1. **Dynamic Mapping Suite:** Tests requirement resolution for all 10 qualification categories.
2. **Strict PDF Validation Suite:** Tests rejection of non-PDFs, rejection of files > 5MB, and acceptance of valid PDFs.
3. **Completeness Checker Suite:** Tests `isVerificationComplete()` across staged, existing, hybrid, and upgraded qualification scenarios.
4. **Proposal Gating Suite:** Tests proposal blocking for missing, unsubmitted, and rejected statuses, and permission for pending and verified states.
