# Aadhar Verification Badge Architecture

This document outlines the technical architecture, database fields, and UI integration for the Aadhar Verification feature built into the MiTutora platform. This system allows teachers to verify their identity, earning a trust badge and a matchmaking algorithm boost.

---

## 1. The Big Picture: User Flow

1. **Input Phase:** A teacher opens their Profile Settings and enters a 12-digit Aadhar number.
2. **OTP Generation:** The frontend hits the `/api/kyc/generate-otp` endpoint, which securely triggers the third-party KYC provider (e.g., PowerAPI) or falls back to our internal "Mock Mode" if no API key is present.
3. **OTP Verification:** The teacher receives a 6-digit OTP on their linked mobile number and submits it to `/api/kyc/verify-otp`.
4. **Database Lock-in:** The backend validates the OTP. If successful, it securely masks the Aadhar (e.g., `XXXX-XXXX-1234`), saves it to the `tutors` collection in Firestore, and sets the teacher's verification status to `true`.
5. **Reward:** The teacher instantly receives a green "Identity Verified" badge across the platform (headers, profile cards, modals) and an organic `+20 points` boost in the matchmaking algorithm.

---

## 2. Database Schema (Firestore)

To keep database reads incredibly fast (O(1) complexity) and avoid expensive sub-collection queries, the verification status is saved directly on the root document of the `tutors` collection.

**Collection:** `tutors`

| Field | Type | Description | Legal & Privacy Strategy |
| :--- | :--- | :--- | :--- |
| `aadharVerified` | Boolean | `true` if the OTP was verified successfully. | Used for UI badge rendering and matchmaking. |
| `maskedAadhar` | String | e.g., `"XXXX-XXXX-9999"`. | We **never** store raw 12-digit Aadhar numbers. Storing only the masked version bypasses the legal requirement of acquiring a government Aadhaar Data Vault license, keeping the platform legally safe. |

---

## 3. Backend API Routes (Next.js Edge)

> **⚠️ TECHNICAL DEBT WARNING:** Both of these routes currently feature a "Mock Mode" fallback for testing purposes. Once the official **PowerAPI** integration is purchased and built, you MUST strip out the mock code blocks from these files to prevent users from bypassing KYC using the dummy `123456` OTP.

The backend exposes two specialized routes for KYC.

### A. `POST /api/kyc/generate-otp`
- **Payload:** `{ aadharNumber: string }`
- **Logic:** Calls the external provider to generate an OTP. 
- **Mock Mode Strategy:** If `process.env.POWERAPI_KEY` is missing, this API intercepts the request, waits 1 second to simulate network latency, and returns a dummy `reference_id` along with the masked string. 

### B. `POST /api/kyc/verify-otp`
- **Payload:** `{ reference_id: string, otp: string, tutorDocId: string, _mockAadhar: string }`
- **Logic:** Validates the OTP against the provider. 
- **Mock Mode Strategy:** It strictly checks if the input is `123456`. If it is, the verification succeeds.
- **Database Update:** The API runs a secure Admin SDK write to `db.collection('tutors').doc(tutorDocId)` and updates `{ aadharVerified: true, maskedAadhar: '...' }`.

---

## 4. Frontend UI Integration

The verification badge and process are deeply integrated into multiple portals:

### A. Teacher Portal
- **Profile Settings (`teacher/page.tsx`):** The primary UI block where teachers input their Aadhar and OTP. Once verified, this block transforms into a permanent green "Identity Verified" success state showing their masked number and Advertising their `+20 Match Points`.
- **Top Navigation (`DashboardHeader.tsx`):** A sleek `ShieldCheck` icon (from Lucide React) is dynamically rendered over their circular avatar and directly next to their name in the profile dropdown menu.

### B. Student Portal (Visibility)
- **Teacher Cards (`student/page.tsx`):** When a student is browsing teachers in the "All" or "Recommended" tabs, a green `ShieldCheck` icon appears right next to the teacher's name.
- **Expanded Profile (`TutorViewModal.tsx`):** If a student clicks on a teacher to read their full bio, an "Identity Verified" badge is displayed alongside their experience and qualifications, boosting parent trust.

---

## 5. Matchmaking Algorithm Impact

Because trust and safety are paramount, verified teachers receive an algorithmic advantage over unverified teachers.

- **File:** `web/src/utils/matching.ts`
- **Logic:** `if (teacher.aadharVerified === true) { score += 20; }`
- **Philosophy:** This provides an "organic nudge". It means a free, unverified teacher who is a perfect 100% academic match for a student (e.g., matches both Math and Science perfectly) can still outrank a verified teacher who is a poor academic match. However, if two teachers are academically identical, the verified teacher will always win the tie-breaker and appear higher on the parent's screen.
