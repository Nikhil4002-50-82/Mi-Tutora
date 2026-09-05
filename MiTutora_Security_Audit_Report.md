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

### Resolution Status (As of September 6, 2026)
Following the implementation of **Firebase Cloud Functions (2nd Gen)**, **Server-Side Ranking Engine**, **deterministic escrow keys**, **batch chunking**, and **auth triggers**:
- ✅ **Fully Resolved:** 9 findings (#2, #3, #5, #7, #10, #11, #12, #20, #21)
- 🟡 **Partially Mitigated:** 4 findings (#4, #8, #9, #18)
- ⏳ **Pending / Open:** 11 findings (#1, #6, #13, #14, #15, #16, #17, #19, #22, #23, #24)

---

## 🚨 Tier 1: Critical Severity (Direct Financial, Contract & Data Loss Vulnerabilities)

### 1. Insecure Firestore Rules on `referrals` (Direct Payout Manipulation)
* **Current Status:** ⏳ **PENDING**
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
* **Current Status:** ✅ **RESOLVED**
* **Resolution Details:** Updated [`firestore.rules:L66`](file:///c:/Users/Dell/Desktop/mushi/firestore.rules#L66) to `allow delete: if false;`. Application contracts and agreements are physically protected by the database firewall; only the server Admin SDK can delete records.
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
* **Current Status:** ✅ **RESOLVED**
* **Resolution Details:** Resolved in [`functions/src/webhooks/razorpayWebhook.ts`](file:///c:/Users/Dell/Desktop/mushi/functions/src/webhooks/razorpayWebhook.ts) and [`web/src/app/api/webhooks/razorpay/route.ts`](file:///c:/Users/Dell/Desktop/mushi/web/src/app/api/webhooks/razorpay/route.ts) with atomic `runTransaction()` locking on `payments/{orderId}`, alongside **deterministic escrow document IDs** (`payout_${applicationId}`) across webhook and verification routes.
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
* **Current Status:** 🟡 **PARTIALLY MITIGATED**
* **Resolution Details:** State transitions are now governed by the hourly Cloud Scheduler cron runner [`expireDemosAndDecisions`](file:///c:/Users/Dell/Desktop/mushi/functions/src/scheduled/expireDemos.ts), ensuring automated tracking. Adding an explicit future date enforcement (`>= Date.now() + 2h`) in `/api/transactions/hire` remains to be finalized.
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
* **Current Status:** ✅ **RESOLVED**
* **Resolution Details:** Implemented in [`functions/src/callable/deleteAccount.ts`](file:///c:/Users/Dell/Desktop/mushi/functions/src/callable/deleteAccount.ts) and [`web/src/app/api/auth/delete-account/route.ts`](file:///c:/Users/Dell/Desktop/mushi/web/src/app/api/auth/delete-account/route.ts). Before deleting, the server queries all user applications. If an active tuition (`status === 'tuition_started'`) exists, deletion is rejected with `failed-precondition`, protecting contracts and Day 30 escrow custody.
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
* **Current Status:** ⏳ **PENDING**
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
* **Current Status:** ✅ **RESOLVED**
* **Resolution Details:** Moved token redemption to the secure serverless callable Cloud Function [`redeemBankedToken`](file:///c:/Users/Dell/Desktop/mushi/functions/src/callable/redeemToken.ts) and [`/api/tutors/redeem-token`](file:///c:/Users/Dell/Desktop/mushi/web/src/app/api/tutors/redeem-token/route.ts), executing an atomic Firestore transaction that verifies `bankedTokens > 0` and `tokensUsed > 0`. Client-side direct writes to `bankedTokens` are blocked by [`firestore.rules:28`](file:///c:/Users/Dell/Desktop/mushi/firestore.rules#L28).
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
* **Current Status:** 🟡 **PARTIALLY MITIGATED**
* **Resolution Details:** Teachers can now convert referral-earned banked tokens into usable proposal tokens at any time via the [`redeemBankedToken`](file:///c:/Users/Dell/Desktop/mushi/functions/src/callable/redeemToken.ts) endpoint. Automatic consumption directly within the `/api/transactions/request` submission flow remains an optional quality-of-life addition.
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
* **Current Status:** 🟡 **PARTIALLY MITIGATED**
* **Resolution Details:** The reactive Cloud Function [`onApplicationWritten`](file:///c:/Users/Dell/Desktop/mushi/functions/src/triggers/onApplicationWritten.ts) now auto-prunes queues upon hiring by declining all competing offers and updating teacher queues. Adding a backend check in `/api/transactions/request` to reject inbound teacher offers if a group already has $\ge 5$ pending requests is still open.
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
* **Current Status:** ✅ **RESOLVED**
* **Resolution Details:** Fully fixed in [`web/src/app/api/get-demo-link/route.ts`](file:///c:/Users/Dell/Desktop/mushi/web/src/app/api/get-demo-link/route.ts#L55-L68) with sanitized display time parsing (`split('||')[0].trim()`), explicit `+05:30` IST timezone formatting, and server-side `[T-5m, T+90m]` window checking.
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
* **Current Status:** ✅ **RESOLVED**
* **Resolution Details:** Resolved in [`web/src/app/signup/page.tsx:94`](file:///c:/Users/Dell/Desktop/mushi/web/src/app/signup/page.tsx#L94) by generating `referralCode: generateReferralCode(name, user.uid)`, and backed up by the 2nd Gen Auth trigger [`onUserCreated.ts`](file:///c:/Users/Dell/Desktop/mushi/functions/src/triggers/onUserCreated.ts) to guarantee every account possesses a valid referral code.
* **Location:** `web/src/app/signup/page.tsx:L85-L93`
* **The Bug:**
  When a user registers via standard Email & Password, `userPayload` writes `id`, `email`, `name`, `roles`, and `referredBy`, but **never calls `generateReferralCode()`**.
* **Impact:** Every newly registered user's Firestore document is initialized with no `referralCode`. If they navigate directly to the Referrals tab, their invite link is broken and copies as `https://mitutora.com?ref=undefined`.
* **Fix:** In `signup/page.tsx`, import `generateReferralCode` and initialize `userPayload.referralCode = generateReferralCode(name, user.uid);`.

---

### 12. Lack of Self-Referral Validation on Account Registration
* **Current Status:** ✅ **RESOLVED**
* **Resolution Details:** Resolved in [`web/src/app/signup/page.tsx:70`](file:///c:/Users/Dell/Desktop/mushi/web/src/app/signup/page.tsx#L70) with `if (referrerUser.id !== user.uid)`, and enforced in the serverless Auth trigger [`onUserCreated.ts`](file:///c:/Users/Dell/Desktop/mushi/functions/src/triggers/onUserCreated.ts) preventing self-referrals.
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
* **Current Status:** ⏳ **PENDING**
* **Location:** `web/src/app/api/create-order/route.ts:L78-L92`
* **The Bug:**
  When `isRemoval === true`, `/api/create-order` computes the fee and creates a Razorpay payment order without checking if `appData.feePaid === true`.
* **Impact:** If a parent who **already paid** the full tuition fee on Day 7 invokes this endpoint, the backend generates a new Razorpay order and **charges them a second time (double-charging)** just to disconnect the teacher.
* **Fix:** Check `if (appData.feePaid === true) return NextResponse.json({ error: 'Tuition already paid. Removal is free of charge.' }, { status: 400 });`.

---

### 14. Fuzzy String Inversion False Positives in `isStrictMatch`
* **Current Status:** ⏳ **PENDING**
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
* **Current Status:** ⏳ **PENDING**
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
* **Current Status:** ⏳ **PENDING**
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
* **Current Status:** ⏳ **PENDING**
* **Location:** `web/src/app/api/create-order/route.ts:L99-L136`
* **The Bug:**
  When a parent uses their referral wallet credit to cover the full tuition fee, `totalToPay` becomes `0`, resulting in `amountInPaise = 0`. Passing `amount: 0` to Razorpay's `orders.create()` triggers an API rejection: `BAD_REQUEST_ERROR: Amount must be at least 100 paise`.
* **Mechanism & Impact:**
  Users with sufficient wallet credits cannot complete their payment, causing checkout failure.
* **Remediation:**
  If `totalToPay <= 0`, bypass Razorpay order creation entirely, atomically deduct the wallet balance, and immediately mark the fee as paid in the database.

---

### 18. Review Endpoint N+1 Firestore Read Storm
* **Current Status:** 🟡 **PARTIALLY MITIGATED**
* **Resolution Details:** Discovery and tutor cards no longer query the `reviews` collection because the reactive trigger [`onReviewCreated`](file:///c:/Users/Dell/Desktop/mushi/functions/src/triggers/onReviewCreated.ts) computes rolling star ratings and review counts directly onto the `tutors/{id}` document. Denormalizing reviewer names on the review document itself to speed up the profile modal review list remains open.
* **Location:** `web/src/app/api/reviews/route.ts:L28-L74`
* **The Vulnerability:**
  For every review returned, the route makes 4 individual Firestore reads (`users`, `applications`, `groups`, `students`) inside a `Promise.all` loop.
* **Mechanism & Impact:**
  For a tutor with 50 reviews, a single profile visit executes over 200 Firestore reads, causing database quota exhaustion, latency spikes, and potential serverless timeout.
* **Remediation:**
  Denormalize `parentName` and `studentNames` directly onto the `reviews` document at the time of review submission.

---

### 19. KYC Mock Mode Verification Active in Production
* **Current Status:** ⏳ **PENDING**
* **Location:** `web/src/app/api/kyc/verify-otp/route.ts:L38-L52`
* **The Vulnerability:**
  When `POWERAPI_KEY` is not present, the verification route falls back to mock mode: entering `123456` marks `aadharVerified: true`, generating a pseudo-masked Aadhar number and awarding a +20 matchmaking ranking boost.
* **Remediation:**
  Ensure mock mode is strictly disabled when `process.env.NODE_ENV === 'production'`.

---

### 20. Scalability Bottleneck: Payout Cron Batch 500-Doc Limit
* **Current Status:** ✅ **RESOLVED**
* **Resolution Details:** Resolved in both [`functions/src/scheduled/dailyPayouts.ts`](file:///c:/Users/Dell/Desktop/mushi/functions/src/scheduled/dailyPayouts.ts#L20-L38) and [`web/src/app/api/payouts/process/route.ts`](file:///c:/Users/Dell/Desktop/mushi/web/src/app/api/payouts/process/route.ts#L45-L57) via a custom `BatchManager` that commits writes in safe chunks of 400 operations, preventing Firestore batch limit crashes at scale.
* **Location:** `web/src/app/api/payouts/process/route.ts:L45`
* **The Risk:**
  All tutor payouts and referral payouts are accumulated into a single Firestore write batch (`const batch = adminDb.batch()`).
* **Mechanism & Impact:**
  Firestore enforces a strict hard limit of 500 write operations per batch. Once the platform grows beyond 500 total payouts/referrals on Day 30, `batch.commit()` will fail with `INVALID_ARGUMENT`, causing all automated payouts for the day to crash.
* **Remediation:**
  Implement batch chunking that commits every 400 operations and instantiates a new batch.

---

### 21. Missing Server-to-Server Razorpay Webhook Handler
* **Current Status:** ✅ **RESOLVED**
* **Resolution Details:** Fully implemented both as a 2nd Gen Cloud Function ([`functions/src/webhooks/razorpayWebhook.ts`](file:///c:/Users/Dell/Desktop/mushi/functions/src/webhooks/razorpayWebhook.ts)) and Next.js server route ([`web/src/app/api/webhooks/razorpay/route.ts`](file:///c:/Users/Dell/Desktop/mushi/web/src/app/api/webhooks/razorpay/route.ts)). Verifies HMAC SHA-256 signatures, applies optimistic concurrency locks, and processes `order.paid` / `payment.captured` asynchronously.
* **Location:** Entire `web/src/app/api/` (no webhook route configured)
* **The Risk:**
  Payment verification currently depends entirely on the user's browser remaining open to call `/api/verify-payment` after completing the Razorpay modal.
* **Mechanism & Impact:**
  If the user's device powers off, connection drops, or browser tab closes immediately after card/UPI authorization, Razorpay captures the payment but the platform database is never notified. The class remains in an unpaid state, and escrow is never initialized.
* **Remediation:**
  Implement a dedicated webhook endpoint (`/api/webhooks/razorpay`) verifying `x-razorpay-signature` against a `RAZORPAY_WEBHOOK_SECRET` for `order.paid` events.

---

### 22. Missing Rate Limiting on SMS & OTP Generation
* **Current Status:** ⏳ **PENDING**
* **Location:** `web/src/app/api/kyc/generate-otp/route.ts` and `/login`
* **The Vulnerability:**
  There is no IP-based or device-based rate limiter on triggering OTP generation or password reset requests.
* **Remediation:**
  Implement sliding-window rate limiting on OTP and auth endpoints.

---

## 🛡️ Tier 4: Low Severity (Hardening & Dead Code)

### 23. Dead Code: Legacy WhatsApp Withdrawal Modal & Handlers Still Present
* **Current Status:** ⏳ **PENDING**
* **Location:** `web/src/app/dashboard/student/page.tsx:L1046-L1080` & `teacher/page.tsx:L909-L935`
* **The Finding:**
  The old `handleWithdrawSubmit` functions and modal UI (which require ₹1,000 and write to the deprecated `withdrawals` collection) were left behind in the DOM tree as dead code.
* **Remediation:**
  Clean up the unused modal components and state handlers.

---

### 24. Open Firebase Storage Write Rules
* **Current Status:** ⏳ **PENDING**
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

| # | Status | Vulnerability / Bug | Severity | Category | Remediation / Current State |
| :-: | :---: | :--- | :---: | :--- | :--- |
| **1** | ⏳ **Pending** | Insecure Firestore rules on `referrals` | **CRITICAL** | Financial / Fraud | Restrict `referrals` to backend-only writes |
| **2** | ✅ **Resolved** | Unauthenticated `allow delete: if true` on `applications` | **CRITICAL** | Data Loss | Protected with `allow delete: if false;` in `firestore.rules:66` |
| **3** | ✅ **Resolved** | Payment Verification Race Condition (Double Payouts) | **CRITICAL** | Concurrency / Double Spend | Atomic `runTransaction()` lock & deterministic escrow IDs (`payout_${applicationId}`) |
| **4** | 🟡 **Partially Mitigated** | Past Date Scheduling Bypasses Demo Completion | **CRITICAL** | Business Logic Bypass | State managed by `expireDemosAndDecisions` cron; future date pre-check in `/api/transactions/hire` pending |
| **5** | ✅ **Resolved** | Active Contract Destruction via Account Deletion | **CRITICAL** | Contract Integrity | Blocked with `failed-precondition` if `tuition_started` exists in `deleteAccount` Cloud Function and API |
| **6** | ⏳ **Pending** | Missing Admin RBAC check on Payout routes | **HIGH** | Information Leak / RBAC | Verify `roles.includes('admin')` in `/api/admin/payouts/export-csv` and `/api/payouts/process` |
| **7** | ✅ **Resolved** | Client-side Token Redemption with no bounds | **HIGH** | Quota Bypass | Secured in callable `redeemBankedToken` (`runTransaction()`); client writes blocked in `firestore.rules:28` |
| **8** | 🟡 **Partially Mitigated** | Banked Tokens never consumed in `transactions/request` | **HIGH** | Functional Bug | Callable `redeemBankedToken` converts banked tokens; auto-consumption in `transactions/request` pending |
| **9** | 🟡 **Partially Mitigated** | Student Queue 5-Concurrent Limit Not Enforced | **HIGH** | Anti-Spam Gap | `onApplicationWritten` Cloud Function auto-prunes queues upon hire; pre-check on `< 5` in `transactions/request` pending |
| **10**| ✅ **Resolved** | Timezone Lockout (UTC vs IST) in Demo Link Unlock | **HIGH** | Core UX / Timezone Bug | Sanitized `split('||')[0]` and explicit `+05:30` IST offset + `[T-5m, T+90m]` window in `/api/get-demo-link` |
| **11**| ✅ **Resolved** | Missing `referralCode` on Email Registration | **HIGH** | User Experience / Growth | Generated via `generateReferralCode()` in `signup/page.tsx:94` and `onUserCreated` Auth trigger |
| **12**| ✅ **Resolved** | Lack of Self-Referral Validation on Account Registration | **HIGH** | Referral Abuse | Enforced `referrerUser.id !== user.uid` in `signup/page.tsx:70` and `onUserCreated` Auth trigger |
| **13**| ⏳ **Pending** | `/api/create-order` Lacks `feePaid` Check for Removal | **MEDIUM** | Financial / Double Charge | Check `feePaid === true` before opening order in `/api/create-order` |
| **14**| ⏳ **Pending** | Fuzzy String Inversion False Positives in Matchmaking | **MEDIUM** | Algorithmic Match Flaw | Tokenize subject matching instead of `.includes()` for short string tokens |
| **15**| ⏳ **Pending** | Karnataka PUC Class 1/2 Demo Fee Miscalculation | **MEDIUM** | Pricing Defect | Map `1st PUC` and `2nd PUC` to Classes 11 & 12 in `feeCalculator.ts` |
| **16**| ⏳ **Pending** | Subscription Early Renewal Wipes Out Remaining Days | **MEDIUM** | Billing Logic | Extend subscription duration from current `subscriptionExpiry` rather than resetting |
| **17**| ⏳ **Pending** | Razorpay crash on 100% wallet payments | **MEDIUM** | Payment Failure | Bypass Razorpay order creation when `totalToPay <= 0` (100% wallet payment) |
| **18**| 🟡 **Partially Mitigated** | Review Endpoint N+1 Firestore Read Storm | **MEDIUM** | Performance / Quotas | Discovery cards read pre-aggregated `averageRating` from `onReviewCreated` trigger; profile modal review detail still joins |
| **19**| ⏳ **Pending** | Mock OTP `123456` in KYC verification | **MEDIUM** | Trust & Safety | Disable mock OTP `123456` in production (`process.env.NODE_ENV === 'production'`) |
| **20**| ✅ **Resolved** | Single batch 500-doc limit in `/api/payouts/process` | **MEDIUM** | Scalability | Implemented `BatchManager` chunking writes at 400 operations in `dailyPayouts.ts` and `/api/payouts/process` |
| **21**| ✅ **Resolved** | Lack of Server-to-Server Razorpay Webhook | **MEDIUM** | Payment Reconciliation | Added HMAC SHA-256 verified webhook in `functions/src/webhooks/razorpayWebhook.ts` and `/api/webhooks/razorpay` |
| **22**| ⏳ **Pending** | Missing Rate Limiting on OTP Endpoints | **MEDIUM** | Cost / Anti-Spam | Implement sliding-window rate limiting on OTP and auth endpoints |
| **23**| ⏳ **Pending** | Dead code: Legacy withdrawal modal and handlers | **LOW** | Code Cleanliness | Clean up unused legacy WhatsApp withdrawal modal and state handlers in student/teacher dashboards |
| **24**| ⏳ **Pending** | Open Cloud Storage write rules | **LOW** | Storage Hardening | Enforce path scoping (`/avatars/{userId}/{fileName}`), restrict to images < 5MB in `storage.rules` |
