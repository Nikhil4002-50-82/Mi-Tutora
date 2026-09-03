# Mi-Tutora — Master Codebase Security & Bug Audit Report

**Date:** September 3, 2026  
**Audited Target:** Mi-Tutora Platform (`mushi/`)  
**Scope:** Firestore Security Rules, Cloud Storage Rules, Serverless API Routes (`web/src/app/api`), Client State Machine, Escrow & Automated Payout Engine, Referral & Quota Mechanics, Timezone & Scheduling Logic, Subscription Billing, Matchmaking Algorithm, and Cross-Document Architectural Verification (`docs/*.md`).

---

## Executive Summary

A comprehensive source code, architecture, and infrastructure configuration audit was performed on the Mi-Tutora codebase. The audit identified **24 total findings** categorized into four priority tiers:

- **Tier 1 (Critical - 5 findings):** Vulnerabilities presenting direct risks of unauthorized database record deletion, trial bypasses, financial fraud/double payouts, or live contract destruction via account deletion.
- **Tier 2 (High - 7 findings):** Lack of role authorization on sensitive endpoints, quota bypasses, timezone lockouts, unconsumed banked referral tokens, unenforced 5-offer queue limits, broken referral link generation, and self-referral abuse.
- **Tier 3 (Medium - 8 findings):** Subscription early renewal day erasure, Razorpay 0-rupee wallet checkout crash, review endpoint N+1 read storms, mock KYC OTP in production, 500-doc batch limits in payout cron, missing server webhook, and Karnataka PUC Class 1/2 pricing defects.
- **Tier 4 (Low - 4 findings):** Legacy dead code withdrawal modals, unused services, and open cloud storage rules.

---

## 🚨 Tier 1: Critical Severity (Direct Financial, Contract & Data Loss Vulnerabilities)

### 1. Insecure Firestore Rules on `referrals` (Direct Payout Manipulation)
* **Location:** `firestore.rules:L118-L121`
* **The Vulnerability:**
  In `firestore.rules`, the wildcard rule allows unauthenticated read and update access to collections not explicitly blocked:
  ```firestore
  match /{collection}/{document=**} {
    allow read, create, update: if collection != 'users' && collection != 'tutors' && collection != 'parents' && collection != 'applications' && collection != 'payments' && collection != 'tutor_payouts' && collection != 'reviews';
  }
  ```
  The `referrals` collection is **not** included in the blacklist.
* **Mechanism & Impact:**
  An unauthenticated client or bad actor can directly modify any referral document via the client SDK:
  ```javascript
  updateDoc(doc(db, 'referrals', id), {
    reward: 50000,
    rewardType: 'wallet_cash',
    payoutStatus: 'escrow_held',
    releaseEligibleAt: 0,
    payoutVpa: 'attacker@upi'
  });
  ```
  When the automated Day 30 payout runner (`/api/payouts/process`) executes, it queries all referrals where `payoutStatus: 'escrow_held'` and executes direct bank transfers via RazorpayX. A malicious user could fraudulently siphon platform funds directly to an arbitrary UPI ID.
* **Remediation:**
  Explicitly secure `referrals` in `firestore.rules`:
  ```firestore
  match /referrals/{referralId} {
    allow read: if request.auth != null;
    allow write: if false; // Only server-side Firebase Admin SDK can create/mutate
  }
  ```
  Apply the same backend-only write restriction to `marketplace_pricing`, `global_config`, and `pending_tuition_fees`.

---

### 2. Applications Unauthenticated Deletion
* **Location:** `firestore.rules:L61`
* **The Vulnerability:**
  ```firestore
  match /applications/{appId} {
    allow read, delete: if true;
  ```
  The rule explicitly allows `delete: if true;` without requiring authentication.
* **Mechanism & Impact:**
  Any anonymous internet actor can invoke `deleteDoc(doc(db, 'applications', appId))` across all applications. This allows malicious deletion of active tuition agreements, negotiation records, trial statuses, and schedules.
* **Remediation:**
  Change this rule to completely disallow client deletion:
  ```firestore
  allow delete: if false;
  ```
  Or restrict deletion strictly to authenticated administrators or the specific parent/tutor owning the document.

---

### 3. Concurrency Race Condition: Duplicate Escrow Creation on Double Payment Verification
* **Location:** `web/src/app/api/verify-payment/route.ts:L65-L115`
* **The Vulnerability:**
  `verify-payment` checks `if (paymentData.status === 'paid')` and then calls `processDatabaseUpdate()`, which uses a Firestore **`batch()`** write instead of an atomic **`runTransaction()`**.
* **Mechanism & Impact:**
  If a user double-clicks or their browser dispatches two concurrent verification calls at the exact same millisecond:
  1. Both requests read `status: 'created'` before either has committed `status: 'paid'`.
  2. Both requests succeed and execute `processDatabaseUpdate`.
  3. **Two separate `tutor_payouts` documents and two referral rewards are created for the same class!**
  4. On Day 30, the automated engine would execute **double payouts** (paying the tutor ₹7,200 instead of ₹3,600 and paying the referrer ₹1,200 instead of ₹600).
* **Remediation:**
  Wrap payment verification in `adminDb.runTransaction()` with an optimistic document lock on `payments/{orderId}`.

---

### 4. Past Date Scheduling Bypasses Demo Class Completion
* **Location:** `web/src/app/api/transactions/hire/route.ts:L50-L65` & `student/page.tsx:L822`
* **The Vulnerability:**
  Neither the client nor backend prevents proposing a demo date in the past (e.g. 2020-01-01).
  In `/api/transactions/hire`, the route only checks:
  ```typescript
  const demoEndTime = demoDateObj.getTime();
  if (Date.now() < demoEndTime) {
    return NextResponse.json({ error: 'Demo has not finished yet' }, { status: 403 });
  }
  ```
* **Mechanism & Impact:**
  If a student proposes a past date and the tutor accepts it, `Date.now() < demoEndTime` evaluates to `false` immediately. The parent can instantly click "Hire", completely bypassing the trial class, eliminating the teacher's completion mark, and locking the agreement prematurely.
* **Remediation:**
  Enforce that proposed demo dates must be strictly in the future (`>= Date.now() + 2 * 60 * 60 * 1000`), and require `appData.status === 'waiting_for_parent_decision'` (which requires the teacher to mark it finished) before allowing the parent to hire.

---

### 5. Active Tuition & Escrow Destruction via Account Deletion
* **Locations:**
  * `web/src/app/dashboard/student/page.tsx:L3224-L3229`
  * `web/src/app/dashboard/teacher/page.tsx:L3368-L3373`
* **The Vulnerability:**
  When a student or teacher clicks "Delete Account", the code executes an unconstrained loop deleting all their `applications` documents:
  ```typescript
  const appQ = query(collection(db, 'applications'), where('parentDocId', '==', uid));
  for (const d of appSnap.docs) {
    await deleteDoc(doc(db, 'applications', d.id));
  }
  ```
* **Mechanism & Impact:**
  There is zero validation check for active tuitions. If a student has already hired a teacher and paid the ₹6,000 fee (`status: 'tuition_started'`), either party can click "Delete Account", which permanently destroys the live tuition contract from the database. The counterpart is stranded, class history is lost, and the platform's Day 30 escrow ledger (`tutor_payouts`) is orphaned.
* **Remediation:**
  Block account deletion if `applications.some(a => a.status === 'tuition_started')` with an error: *"Cannot delete account while you have an active tuition agreement."*

---

## ⚠️ Tier 2: High Severity (Authorization, Quotas, State & Algorithmic Bypasses)

### 6. Admin Payout Endpoints Lack Admin RBAC Check
* **Locations:**
  * `web/src/app/api/admin/payouts/export-csv/route.ts:L17-L25`
  * `web/src/app/api/payouts/process/route.ts:L20-L30`
* **The Vulnerability:**
  Both endpoints verify that a bearer token is signed by Firebase Auth, but neither route checks whether `decodedToken.admin === true` or if `roles.includes('admin')`.
* **Mechanism & Impact:**
  Any authenticated regular student or teacher can submit their own standard Firebase auth token to `/api/admin/payouts/export-csv` to download the entire banking spreadsheet containing full tutor and student legal names, UPI IDs, payable amounts, and bank UTR numbers. They can also manually trigger `/api/payouts/process` on demand.
* **Remediation:**
  Verify that the caller has administrative privileges:
  ```typescript
  const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
  const roles = userDoc.data()?.roles || [];
  if (!roles.includes('admin')) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }
  ```

---

### 7. Client-Side Token Redemption Without Lower-Bound Checks
* **Location:** `web/src/app/dashboard/teacher/page.tsx:L400-L415`
* **The Vulnerability:**
  Token redemption is handled entirely in the browser client:
  ```typescript
  await updateDoc(tutorRef, {
    bankedTokens: increment(-1),
    'weeklyQuota.tokensUsed': increment(-1)
  });
  ```
  Neither the client code nor `firestore.rules:L31` checks if `bankedTokens > 0` or if `weeklyQuota.tokensUsed >= 0` (it only enforces `<= 5` or `<= 15`).
* **Mechanism & Impact:**
  A teacher can invoke this function repeatedly or manually dispatch updates with negative token counts (e.g., `tokensUsed: -100`). Since `-100 <= 5` satisfies the rule, a teacher can gain infinite proposal requests without referring teachers or purchasing Pro subscriptions.
* **Remediation:**
  Move token redemption to a dedicated server endpoint (`/api/tutors/redeem-token`) using an atomic transaction that verifies `bankedTokens > 0` and decrements both values safely.

---

### 8. `transactions/request` Never Consumes `bankedTokens` (Feature Bug)
* **Location:** `web/src/app/api/transactions/request/route.ts:L142-L144`
* **The Bug:**
  When a teacher sends a proposal/offer, the backend verifies:
  ```typescript
  if (currentTokens >= teacherLimit) {
    return NextResponse.json({ success: false, error: 'WEEKLY_QUOTA_EXCEEDED' }, { status: 403 });
  }
  ```
  The endpoint never checks whether the tutor has available `bankedTokens`.
* **Mechanism & Impact:**
  Teachers who legitimately earned Banked Tokens by referring other teachers are blocked once their weekly limit (5 tokens) is hit, rendering their referral rewards unusable in the proposal workflow.
* **Remediation:**
  If `currentTokens >= teacherLimit` and `tutorData.bankedTokens > 0`, deduct 1 from `bankedTokens` and allow the transaction batch to succeed.

---

### 9. Student Queue 5-Concurrent Limit Not Enforced in Backend
* **Location:** `web/src/app/api/transactions/request/route.ts:L120-L150`
* **The Bug:**
  `docs/Student_Queue_Architecture.md` specifies that a student group can have a maximum of 5 concurrent pending offers.
  However, in `/api/transactions/request`, when a teacher sends an offer, the server checks only the teacher's quota, never verifying how many pending offers the target student group already has.
* **Mechanism & Impact:**
  A single student group can receive 30 or 50 simultaneous offers from teachers, bypassing the queue rules and spamming the parent's dashboard.
* **Remediation:**
  Add a count query in `/api/transactions/request` verifying that the target group has `< 5` pending applications before allowing the offer.

---

### 10. Timezone Lockout & String Formatting Bug in Demo Link Unlock
* **Location:** `web/src/app/api/get-demo-link/route.ts:L58-L65`
* **The Bug:**
  1. The route parses `demoDateTimeStr = ${appData.demoDate}T${appData.demoTime}:00` on Vercel serverless (which runs in UTC). Because it lacks the `+05:30` IST offset, Indian users are locked out of their demo classes for 5.5 hours after the class time has already passed!
  2. If `demoTime` contains the display label format (`"16:30||4:30 PM"`), `new Date()` produces `Invalid Date (NaN)`, which evaluates `now < NaN` to `false`, accidentally unlocking the link immediately for anyone!
* **Remediation:**
  Sanitize `demoTime.split('||')[0]` and explicitly append `+05:30` for Indian Standard Time:
  ```typescript
  const cleanTime = appData.demoTime.split('||')[0].trim();
  const demoDateObj = new Date(`${appData.demoDate}T${cleanTime}:00+05:30`);
  ```

---

### 11. Email Registration Omits `referralCode` Generation
* **Location:** `web/src/app/signup/page.tsx:L85-L93`
* **The Bug:**
  When a user registers via standard Email & Password, `userPayload` writes `id`, `email`, `name`, `roles`, and `referredBy`, but **never calls `generateReferralCode()`**.
* **Impact:** Every newly registered user's Firestore document is initialized with no `referralCode`. If they navigate directly to the Referrals tab, their invite link is broken and copies as `https://mitutora.com?ref=undefined`.
* **Fix:** In `signup/page.tsx`, import `generateReferralCode` and initialize `userPayload.referralCode = generateReferralCode(name, user.uid);`.

---

### 12. Lack of Self-Referral Validation on Account Registration
* **Locations:**
  * `web/src/app/signup/page.tsx:L63-L83`
  * `web/src/app/login/page.tsx:L117-L137`
* **The Bug:**
  When resolving a referral code during signup or Google sign-in modal, the code looks up `users.where('referralCode', '==', code)` and creates a referral ticket without checking if `referrerUser.id === user.uid`.
* **Impact:** A user can submit their own referral code, crediting themselves for their own account creation.
* **Fix:** Enforce `if (referrerUser.id === user.uid) throw new Error("You cannot refer yourself.");`.

---

## 🔍 Tier 3: Medium Severity (Operational, Pricing & Edge Cases)

### 13. `/api/create-order` Lacks `feePaid` Check for Teacher Removal
* **Location:** `web/src/app/api/create-order/route.ts:L78-L92`
* **The Bug:**
  When `isRemoval === true`, `/api/create-order` computes the fee and creates a Razorpay payment order without checking if `appData.feePaid === true`.
* **Impact:** If a parent who **already paid** the full tuition fee on Day 7 invokes this endpoint, the backend generates a new Razorpay order and **charges them a second time (double-charging)** just to disconnect the teacher.
* **Fix:** Check `if (appData.feePaid === true) return NextResponse.json({ error: 'Tuition already paid. Removal is free of charge.' }, { status: 400 });`.

---

### 14. Fuzzy String Inversion False Positives in `isStrictMatch`
* **Location:** `web/src/utils/matching.ts:L152`
* **The Bug:**
  To match subjects/languages, the algorithm evaluates:
  ```typescript
  normalizedOffers.some((offer) => offer.includes(normalizedNeed) || normalizedNeed.includes(offer))
  ```
* **Impact:** The bidirectional `.includes()` check causes severe false positive matches on short names:
  * A student requesting the **`C`** programming language matches a teacher who only knows **`CSS`**, **`React`**, or **`JavaScript`** (`"css".includes("c")` is `true`)!
  * The system marks the web developer as a **100% strict match** for low-level C programming and awards them +50 suitability points!
* **Fix:** Use exact token comparison (`offer === normalizedNeed`) or word boundary regex instead of bidirectional `.includes()`.

---

### 15. Karnataka 1st & 2nd PUC Students Billed as Class 1 & Class 2
* **Location:** `web/src/utils/pricing.ts:L12-L14`
* **The Bug:**
  The demo fee calculator extracts grade numbers using regex:
  ```typescript
  const match = cl.match(/\d+/);
  if (match) targetId = `school_class_${match[0]}`;
  ```
* **Impact:** In Karnataka (the primary market), 11th and 12th grade students are called **"1st PUC"** and **"2nd PUC"**. Because `match(/\d+/)` grabs the first number:
  * **1st PUC (Grade 11)** is mapped to `school_class_1` (First Standard demo fee)!
  * **2nd PUC (Grade 12)** is mapped to `school_class_2` (Second Standard demo fee)!
  Senior pre-university students are charged the low demo fee of a 6-year-old primary school child.
* **Fix:** Add explicit checks for `puc` or `pu` to map to `school_class_11` and `school_class_12`.

---

### 16. Subscription Early Renewal Wipes Out Remaining Active Days
* **Location:** `web/src/app/api/verify-subscription-payment/route.ts:L120-L122`
* **The Bug:**
  `expiryDate` is hardcoded as `Timestamp.now().toMillis() + (30 * 24 * 60 * 60 * 1000)`.
* **Mechanism & Impact:**
  If a teacher renews their subscription with 10 days remaining on their current month, their remaining 10 days are erased rather than extended to 40 days!
* **Remediation:**
  Calculate extension from current expiry:
  ```typescript
  const baseTime = (tutorData.subscriptionExpiry && tutorData.subscriptionExpiry > Date.now()) 
    ? tutorData.subscriptionExpiry 
    : Date.now();
  const expiryDate = baseTime + (30 * 24 * 60 * 60 * 1000);
  ```

---

### 17. Razorpay Order Creation Crash on 100% Wallet Balance Payment
* **Location:** `web/src/app/api/create-order/route.ts:L99-L136`
* **The Bug:**
  When a parent uses their referral wallet credit to cover the full tuition fee, `totalToPay` becomes `0`, resulting in `amountInPaise = 0`. Passing `amount: 0` to Razorpay's `orders.create()` triggers an API rejection: `BAD_REQUEST_ERROR: Amount must be at least 100 paise`.
* **Mechanism & Impact:**
  Users with sufficient wallet credits cannot complete their payment, causing checkout failure.
* **Remediation:**
  If `totalToPay <= 0`, bypass Razorpay order creation entirely, atomically deduct the wallet balance, and immediately mark the fee as paid in the database.

---

### 18. Review Endpoint N+1 Firestore Read Storm
* **Location:** `web/src/app/api/reviews/route.ts:L28-L74`
* **The Vulnerability:**
  For every review returned, the route makes 4 individual Firestore reads (`users`, `applications`, `groups`, `students`) inside a `Promise.all` loop.
* **Mechanism & Impact:**
  For a tutor with 50 reviews, a single profile visit executes over 200 Firestore reads, causing database quota exhaustion, latency spikes, and potential serverless timeout.
* **Remediation:**
  Denormalize `parentName` and `studentNames` directly onto the `reviews` document at the time of review submission.

---

### 19. KYC Mock Mode Verification Active in Production
* **Location:** `web/src/app/api/kyc/verify-otp/route.ts:L38-L52`
* **The Vulnerability:**
  When `POWERAPI_KEY` is not present, the verification route falls back to mock mode: entering `123456` marks `aadharVerified: true`, generating a pseudo-masked Aadhar number and awarding a +20 matchmaking ranking boost.
* **Remediation:**
  Ensure mock mode is strictly disabled when `process.env.NODE_ENV === 'production'`.

---

### 20. Scalability Bottleneck: Payout Cron Batch 500-Doc Limit
* **Location:** `web/src/app/api/payouts/process/route.ts:L45`
* **The Risk:**
  All tutor payouts and referral payouts are accumulated into a single Firestore write batch (`const batch = adminDb.batch()`).
* **Mechanism & Impact:**
  Firestore enforces a strict hard limit of 500 write operations per batch. Once the platform grows beyond 500 total payouts/referrals on Day 30, `batch.commit()` will fail with `INVALID_ARGUMENT`, causing all automated payouts for the day to crash.
* **Remediation:**
  Implement batch chunking that commits every 400 operations and instantiates a new batch.

---

### 21. Missing Server-to-Server Razorpay Webhook Handler
* **Location:** Entire `web/src/app/api/` (no webhook route configured)
* **The Risk:**
  Payment verification currently depends entirely on the user's browser remaining open to call `/api/verify-payment` after completing the Razorpay modal.
* **Mechanism & Impact:**
  If the user's device powers off, connection drops, or browser tab closes immediately after card/UPI authorization, Razorpay captures the payment but the platform database is never notified. The class remains in an unpaid state, and escrow is never initialized.
* **Remediation:**
  Implement a dedicated webhook endpoint (`/api/webhooks/razorpay`) verifying `x-razorpay-signature` against a `RAZORPAY_WEBHOOK_SECRET` for `order.paid` events.

---

### 22. Missing Rate Limiting on SMS & OTP Generation
* **Location:** `web/src/app/api/kyc/generate-otp/route.ts` and `/login`
* **The Vulnerability:**
  There is no IP-based or device-based rate limiter on triggering OTP generation or password reset requests.
* **Remediation:**
  Implement sliding-window rate limiting on OTP and auth endpoints.

---

## 🛡️ Tier 4: Low Severity (Hardening & Dead Code)

### 23. Dead Code: Legacy WhatsApp Withdrawal Modal & Handlers Still Present
* **Location:** `web/src/app/dashboard/student/page.tsx:L1046-L1080` & `teacher/page.tsx:L909-L935`
* **The Finding:**
  The old `handleWithdrawSubmit` functions and modal UI (which require ₹1,000 and write to the deprecated `withdrawals` collection) were left behind in the DOM tree as dead code.
* **Remediation:**
  Clean up the unused modal components and state handlers.

---

### 24. Open Firebase Storage Write Rules
* **Location:** `storage.rules:L4-L7`
* **The Risk:**
  The current rule allows any authenticated user to write to any storage location:
  ```firestore
  match /{allPaths=**} {
    allow read: if true;
    allow write: if request.auth != null;
  }
  ```
* **Remediation:**
  Scope paths strictly (`/avatars/{userId}/{fileName}`), limit file size (`< 5MB`), and restrict to image MIME types.

---

## Complete 24-Point Audit Summary Table

| # | Vulnerability / Bug | Severity | Category | Remediation |
| :-: | :--- | :---: | :--- | :--- |
| **1** | Open Firestore rules on `referrals` | **CRITICAL** | Financial / Fraud | Restrict `referrals` to backend-only writes |
| **2** | Unauthenticated `allow delete: if true` on `applications` | **CRITICAL** | Data Loss | Change to `allow delete: if false` |
| **3** | Payment Verification Race Condition (Double Payouts) | **CRITICAL** | Concurrency / Double Spend | Use Firestore `runTransaction()` |
| **4** | Past Date Scheduling Bypasses Demo Completion | **CRITICAL** | Business Logic Bypass | Enforce future dates & `waiting_for_parent_decision` status |
| **5** | Active Contract Destruction via Account Deletion | **CRITICAL** | Contract Integrity | Block deletion if `tuition_started` exists |
| **6** | Missing Admin RBAC check on Payout routes | **HIGH** | Information Leak / RBAC | Verify `roles.includes('admin')` |
| **7** | Client-side Token Redemption with no bounds | **HIGH** | Quota Bypass | Move to secure server API with `>= 0` checks |
| **8** | Banked Tokens never consumed in `transactions/request` | **HIGH** | Functional Bug | Consume banked tokens when weekly limit hit |
| **9** | Student Queue 5-Concurrent Limit Not Enforced | **HIGH** | Anti-Spam Gap | Add pending count query before sending offer |
| **10**| Timezone Lockout (UTC vs IST) in Demo Link Unlock | **HIGH** | Core UX / Timezone Bug | Append `+05:30` IST and sanitize `||` in `demoTime` |
| **11**| Missing `referralCode` on Email Registration | **HIGH** | User Experience / Growth | Call `generateReferralCode()` during signup |
| **12**| Lack of Self-Referral Validation on Account Registration | **HIGH** | Referral Abuse | Disallow `referrerUser.id === user.uid` |
| **13**| `/api/create-order` Lacks `feePaid` Check for Removal | **MEDIUM** | Financial / Double Charge | Check `feePaid === true` before opening order |
| **14**| Fuzzy String Inversion False Positives in Matchmaking | **MEDIUM** | Algorithmic Match Flaw | Tokenize subject matching instead of `.includes()` |
| **15**| Karnataka PUC Class 1/2 Demo Fee Miscalculation | **MEDIUM** | Pricing Defect | Map `1st PUC` and `2nd PUC` to Classes 11 & 12 |
| **16**| Subscription Early Renewal Wipes Out Remaining Days | **MEDIUM** | Billing Logic | Extend from current expiry date |
| **17**| Razorpay crash on 100% wallet payments | **MEDIUM** | Payment Failure | Bypass Razorpay if `totalToPay <= 0` |
| **18**| Review Endpoint N+1 Firestore Read Storm | **MEDIUM** | Performance / Quotas | Denormalize reviewer names onto review docs |
| **19**| Mock OTP `123456` in KYC verification | **MEDIUM** | Trust & Safety | Disable mock OTP in production |
| **20**| Single batch 500-doc limit in `/api/payouts/process` | **MEDIUM** | Scalability | Implement 400-doc batch chunking |
| **21**| Lack of Server-to-Server Razorpay Webhook | **MEDIUM** | Payment Reconciliation | Add `/api/webhooks/razorpay` |
| **22**| Missing Rate Limiting on OTP Endpoints | **MEDIUM** | Cost / Anti-Spam | Add sliding-window rate limiters |
| **23**| Dead code: Legacy withdrawal modal and handlers | **LOW** | Code Cleanliness | Remove deprecated state and modal JSX |
| **24**| Open Cloud Storage write rules | **LOW** | Storage Hardening | Enforce path scoping, MIME types, and 5MB limits |
