# Payment Security & Integration Architecture

This document maps out the highly secure, server-side verified payment architecture designed to integrate seamlessly with Razorpay. It ensures that hackers cannot bypass payments by modifying frontend variables or manipulating database requests.

## 1. The Core Philosophy (Plug-and-Play)
The system operates dynamically based on environment variables. 
*   **Simulation Mode:** If `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are missing, the backend APIs will instantly simulate a successful payment.
*   **Live Mode:** The moment the keys are added to the `.env` file, the backend will automatically route real transactions to Razorpay and cryptographically verify the signatures.

## 2. Database Architecture (The `payments` Ledger)
To ensure absolute financial integrity and auditing, we do not store payment transaction histories inside the `applications` document. Instead, we use a dedicated `payments` collection.

*   **The Ledger (`payments` collection):** Every time a user clicks "Pay", a permanent record is created here containing the `razorpayOrderId`, `amount`, `userId`, `status`, `type` (e.g., 'application' or 'subscription') and strictly the raw Firestore Document references. If a payment fails and they retry, a new ledger entry is created. 
*   **The Application (`applications` collection):** Once a tuition or demo payment is securely verified, the backend simply flips `feePaid: true` or `demoPaymentPaid: true` on the application so the frontend UI can update instantly.
*   **The Tutor Profile (`tutors` collection):** Once a subscription payment is securely verified, the backend upgrades the tutor's profile to `pro` and sets a strict 30-day server timestamp for `subscriptionExpiry`.

## 3. Server-Side Routes (Next.js API)
All payment calculations and verifications happen securely on the backend.

### A. Order Creation (`/api/create-order`)
*   **Purpose:** Securely calculates the true price for tuitions/demos and generates a Razorpay Order ID.
*   **Input:** `applicationDocId`, `userId`, `role` ('student' or 'teacher'), `useWallet`.
*   **Security Check:** The backend ignores any price sent by the frontend. If `role` is 'student', it queries the application's `finalPrice`. If `role` is 'teacher', it fetches the `marketplace_pricing` matrix and recalculates the specific platform demo fee natively on the server.
*   **Output:** `order_id`, `amount`, `currency`.

### B. Payment Verification (`/api/verify-payment`)
*   **Purpose:** Verifies the cryptographic signature from Razorpay for tuitions/demos.
*   **Input:** `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `applicationDocId`, `role`.
*   **Security Check:** The backend hashes the data using the Razorpay Secret Key. If the hash matches the signature, the payment is authentic. It also independently re-runs the pricing logic (including `marketplace_pricing` for teachers) to securely calculate wallet balance deductions.
*   **Database Execution:** The backend uses the `firebase-admin` SDK (which bypasses frontend rules) to update the application status and mark it as paid.

### C. Subscription Order Creation (`/api/create-subscription-order`)
*   **Purpose:** Securely generates a Razorpay Order ID specifically for Pro Plan upgrades.
*   **Input:** `userId` (the teacher's ID).
*   **Security Check:** The backend hardcodes the price to exactly ₹299. It ignores any pricing data sent by the frontend, ensuring hackers cannot alter the subscription price.
*   **Output:** `order_id`, `amount`, `currency`.

### D. Subscription Payment Verification (`/api/verify-subscription-payment`)
*   **Purpose:** Verifies the cryptographic signature from Razorpay for subscriptions.
*   **Input:** `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `userId`.
*   **Security Check:** Hashes the data using the Razorpay Secret Key. If authentic, it uses the `firebase-admin` SDK to update the `tutors` document (`subscriptionPlan: 'pro'`, `isSubscribed: true`). 
*   **Time-Tamper Proofing:** It strictly calculates the 30-day `subscriptionExpiry` lock on the backend using the Admin SDK's `Timestamp.now()`. This makes it 100% immune to client-side clock tampering (e.g., a hacker changing their browser console time).

### E. Referral Reward Distribution (Backend Embedded)
*   **Purpose:** Ensures referrers are only rewarded upon a fully completed and verified transaction.
*   **Mechanism:** When a student successfully pays for the first month of tuition (Day 7 payment), the `/api/verify-payment` route automatically intercepts this success state. It checks if the student was referred, and if so, securely calculates the 25% reward from the `finalPrice` and updates the referrer's `walletBalance`. By embedding this in the backend verification block rather than the frontend UI, the platform is protected from 7-day cancellation refund leakage.

## 4. Frontend Integration Points

The existing dummy `handlePaymentSubmit` functions will be replaced with a Razorpay SDK flow.

### A. Student Portal (`web/src/app/dashboard/student/page.tsx`)
*   **Trigger:** Paying the tuition fee.
*   **Flow:** 
    1. Call `/api/create-order`.
    2. Open Razorpay Widget.
    3. On success callback, send signature to `/api/verify-payment`.
    4. Upon successful backend verification, the UI refreshes to show `tuition_started`.

### B. Teacher Portal (`web/src/app/dashboard/teacher/page.tsx`)
*   **Trigger:** Paying the demo/platform fee.
*   **Flow:** 
    1. Call `/api/create-order`.
    2. Open Razorpay Widget.
    3. On success, send signature to `/api/verify-payment`.
    4. Upon successful backend verification, UI refreshes to show `demo_booking_phase` and the contact popup.

### C. Teacher Portal (Subscription Upgrade)
*   **Trigger:** Clicking "Confirm & Pay" on the Upgrade to Pro modal.
*   **Flow:** 
    1. Call `/api/create-subscription-order`.
    2. Open Razorpay Widget.
    3. On success callback, send signature to `/api/verify-subscription-payment`.
    4. Upon successful backend verification, the UI refreshes to show "Active Plan" and instantly grants the 15 tokens quota.

## 5. Firestore Security Rules (The Firewall)
The `firestore.rules` file is updated to physically block frontend tampering.

**Rule Changes:**
*   Users **cannot** manually update the `status` field to `tuition_started` or `demo_booking_phase`.
*   Users **cannot** manually set `feePaid: true` or `demoPaymentPaid: true`.
*   Only the backend (via `firebase-admin`) has the authority to make these specific field changes.

## 6. The "Go-Live" Checklist (Moving out of Simulation Mode)
Currently, the codebase is configured with a built-in "Simulation/Testing Mode" so the platform continues to function without real Razorpay credentials. 

When you are ready to launch the real payment system, you **must** complete the following steps:

1. **Add Credentials:** Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to your `.env` file.
2. **Delete Backend Mock Code:** In `/api/create-order/route.ts`, `/api/verify-payment/route.ts`, `/api/create-subscription-order/route.ts`, and `/api/verify-subscription-payment/route.ts`, locate and delete the `if (!process.env.RAZORPAY_KEY_ID)` simulation blocks. The backend should *only* process real transactions.
3. **Delete Frontend Mock Code:** In both `student/page.tsx` and `teacher/page.tsx` (across tuition, demo, and subscription payment flows), locate and delete the `if (order.mockMode)` bypass blocks.
4. **Turn on the Database Firewall:** Open `firestore.rules` in your Firebase Console, locate the `// ⚠️ FUTURE RAZORPAY LOCKDOWN` section under `applications`, and **uncomment** the strict rules to permanently lock out frontend hackers.
