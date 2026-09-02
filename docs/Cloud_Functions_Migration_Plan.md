# Cloud Functions Migration Plan

As the MiTutora platform scales, certain heavy operations, security-critical transactions, and time-based automations must be moved off the frontend (React/Browser) and Next.js Edge APIs, and directly into Firebase Cloud Functions.

This document outlines the complete architectural roadmap for creating a pure Firebase backend.

---

## 1. Matchmaking & Ranking Engine (Scalability)

### The Problem
Currently, when a student opens their dashboard, the Next.js API/Frontend fetches a massive list of teachers and evaluates `calculateSuitabilityScore()` and `isStrictMatch()` directly in the React client. If the platform scales to 10,000+ teachers, this will cause severe performance degradation, high battery drain on mobile devices, and excessive Firestore read costs.

### The Cloud Function Solution
- **Type:** HTTP Callable Function (`getRankedTutors`)
- **Execution:** When the student loads the "Recommended" tab, the frontend sends the student's `groupDocId` and `budget` to this Cloud Function.
- **Logic:** 
  1. The Cloud Function queries the database securely.
  2. It runs the strict filters and scores every teacher internally on Google's high-speed servers.
  3. It sorts the array.
  4. It returns **only the top 20** results to the frontend.
- **Benefit:** Drops database reads by 99% and ensures the app loads instantly even on older phones.

---

## 2. Time-Based Automations (Cron Jobs)

### The Problem
Time-sensitive rules—like the 48-hour auto-decline after a demo, or checking if a 7-day trial has expired—are currently evaluated "lazily". They only trigger if a user happens to log in and the Next.js API processes their dashboard payload.

### The Cloud Function Solution
- **Type:** Scheduled Functions (`onSchedule`)
- **Functions Needed:**
  1. **`cron_checkDemoTimeouts` (Runs every 1 hour):** 
     - Scans the `applications` collection for any document in `waiting_for_parent_decision`.
     - Compares the `demoDate` and `demoTime` to the current server time.
     - If > 48 hours have elapsed, automatically updates the status to `declined` and frees up both users.
  2. **`cron_subscriptionExpiries` (Runs every 24 hours at midnight):** 
     - Scans the `tutors` collection for users where `subscriptionPlan === 'pro'` but `subscriptionExpiry < Date.now()`.
     - Automatically downgrades them to `'basic'` and resets their weekly token quotas.

---

## 3. Database Triggers (Automated Side-Effects)

### The Problem
Right now, complex multi-document updates (like the referral system) require the frontend or Next.js APIs to manually coordinate "Batch Writes". If the network drops halfway through, or a user closes the app, it can lead to orphaned data.

### The Cloud Function Solution
- **Type:** Firestore Triggers (`onDocumentCreated`, `onDocumentUpdated`)
- **Functions Needed:**
  1. **`trigger_referralRewards`:** 
     - Listens to `pending_tuition_fees` documents.
     - When a fee document status changes from `pending` to `paid`, this function wakes up.
     - It checks if the student was referred by someone.
     - If yes, it securely calculates 25% of the fee and adds it to the referrer's `walletBalance`.
  2. **`trigger_onHireCleanup`:**
     - Listens to `applications`.
     - When an application status changes to `tuition_started`, this function automatically hunts down every *other* application involving that student group and changes them to `declined`, keeping the database perfectly clean without relying on frontend logic.

---

## 4. Notifications & Third-Party Integrations

### The Problem
Sending WhatsApp messages, emails, or push notifications from the Next.js API or Client exposes API keys and can slow down the user interface if the third-party service (like Twilio or PowerAPI) is slow to respond.

### The Cloud Function Solution
- **Type:** Firestore Triggers (`onDocumentCreated`, `onDocumentUpdated`)
- **Functions Needed:**
  1. **`trigger_sendWhatsAppAlert`:**
     - Listens for new documents in the `applications` collection.
     - Wakes up in the background and sends a WhatsApp message to the teacher ("You have a new tuition request!"). 
     - Because it's a background trigger, the student's UI is never blocked waiting for the message to send.

---

## 5. Migrating Next.js API Routes

### The Problem
The current architecture relies heavily on Next.js Serverless APIs (`/src/app/api/...`) for critical security tasks (Razorpay webhooks, KYC verification, and the `executeAppointTutor` hire transaction). 

### The Cloud Function Solution
- **Type:** HTTP Functions (`onRequest` or `onCall`)
- **Action:** Move the logic from these files directly into Firebase:
  - `api/transactions/hire/route.ts` ➡️ `functions/src/hireTutor.ts`
  - `api/kyc/verify-otp/route.ts` ➡️ `functions/src/verifyAadhar.ts`
  - `api/verify-payment/route.ts` ➡️ `functions/src/razorpayWebhook.ts`
- **Benefit:** Centralizes all secure backend operations inside the Firebase ecosystem, eliminating reliance on Next.js hosting for backend security.
