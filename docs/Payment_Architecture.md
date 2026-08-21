# Payment Security & Integration Architecture

This document maps out the highly secure, server-side verified payment architecture designed to integrate seamlessly with Razorpay. It ensures that hackers cannot bypass payments by modifying frontend variables or manipulating database requests.

## 1. The Core Philosophy (Plug-and-Play)
The system operates dynamically based on environment variables. 
*   **Simulation Mode:** If `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are missing, the backend APIs will instantly simulate a successful payment.
*   **Live Mode:** The moment the keys are added to the `.env` file, the backend will automatically route real transactions to Razorpay and cryptographically verify the signatures.

## 2. Database Architecture (The `payments` Ledger)
To ensure absolute financial integrity and auditing, we do not store payment transaction histories inside the `applications` document. Instead, we use a dedicated `payments` collection.

*   **The Ledger (`payments` collection):** Every time a user clicks "Pay", a permanent record is created here containing the `razorpayOrderId`, `amount`, `userId`, and `status`. If a payment fails and they retry, a new ledger entry is created. 
*   **The Application (`applications` collection):** Once a payment is securely verified, the backend simply flips `feePaid: true` or `demoPaymentPaid: true` on the application so the frontend UI can update instantly.

## 3. Server-Side Routes (Next.js API)
All payment calculations and verifications happen securely on the backend.

### A. Order Creation (`/api/create-order`)
*   **Purpose:** Securely calculates the true price and generates a Razorpay Order ID.
*   **Input:** `applicationId`, `userId`, `role` ('student' or 'teacher').
*   **Security Check:** The backend queries Firestore directly to find the `finalPrice` or `budget`. It ignores any price sent by the frontend.
*   **Output:** `order_id`, `amount`, `currency`.

### B. Payment Verification (`/api/verify-payment`)
*   **Purpose:** Verifies the cryptographic signature from Razorpay.
*   **Input:** `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `applicationId`, `role`.
*   **Security Check:** The backend hashes the data using the Razorpay Secret Key. If the hash matches the signature, the payment is authentic.
*   **Database Execution:** The backend uses the `firebase-admin` SDK (which bypasses frontend rules) to update the application status and mark it as paid.

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
2. **Delete Backend Mock Code:** In both `/api/create-order/route.ts` and `/api/verify-payment/route.ts`, locate and delete the `if (!process.env.RAZORPAY_KEY_ID)` simulation blocks. The backend should *only* process real transactions.
3. **Delete Frontend Mock Code:** In both `student/page.tsx` and `teacher/page.tsx`, locate and delete the `if (order.mockMode)` bypass blocks.
4. **Turn on the Database Firewall:** Open `firestore.rules` in your Firebase Console, locate the `// ⚠️ FUTURE RAZORPAY LOCKDOWN` section under `applications`, and **uncomment** the strict rules to permanently lock out frontend hackers.
