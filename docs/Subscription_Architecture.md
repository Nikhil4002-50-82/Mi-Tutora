# Teacher Subscription & Quota Architecture

This document outlines the business rules and technical architecture for the Teacher Subscription system. The model is designed to drive revenue by creating strategic friction for Free-tier users while rewarding them for upgrading.

---

## 1. The Core Strategy: The "Token" Quota System
To maximize paid upgrades, the platform uses an industry-standard "Strict Quota" model (similar to Upwork Connects or LinkedIn InMails) rather than a concurrent queue. 

**The Golden Rule:** Every time a Teacher sends an offer or requests a demo, they spend a "Token". Tokens are strictly time-bound and do **not** get refunded if a student rejects or ignores the offer. This forces teachers to be selective with their offers and strongly incentivizes upgrading to get more tokens.

---

## 2. Subscription Tiers

### Basic Plan (Free Tier)
- **Target Audience:** New teachers testing the platform.
- **Quota:** 5 Tokens (Requests) per week.
- **Limits:** Once 5 requests are sent, all "Send Offer" buttons are locked until the following Monday (or a rolling 7-day window).
- **Matchmaking:** Standard visibility in the Student's "All" tab.

### Pro Plan (Paid Tier - e.g., Rs 499/month)
- **Target Audience:** Serious teachers scaling their tuition business.
- **Quota:** 15 Tokens (Requests) per week.
- **Perks:** 
  - 3x more bidding power.
  - Priority matchmaking algorithm (+20 points matchmaking score boost).

---

## 3. Technical Implementation Plan

To ensure the system is 100% hacker-proof, the quota limit will be strictly enforced at the database level using Firestore Security Rules, preventing malicious users from bypassing frontend limits.

### Database Schema Updates
We will add the following fields to the `tutors` collection:
- `subscriptionPlan`: String (`'basic'` or `'pro'`)
- `subscriptionExpiresAt`: Timestamp *(Note: Currently omitted in the mock upgrade frontend logic for testing. Must be injected via Webhook when real payment gateway like Razorpay/Stripe is integrated so the Pro plan eventually expires.)*
- `weeklyQuota`: Object tracking current usage
  - `weekStartDate`: String (e.g., `'2026-08-17'`)
  - `tokensUsed`: Number

### The Quota Calculation & Security Logic
1. **The Transaction:** When a teacher sends an offer, a single Firestore transaction will execute:
   - Create the new application document.
   - Check the teacher's `weeklyQuota.weekStartDate`. If it's a new week, reset `tokensUsed` to `1` and update the date. If it's the same week, increment `tokensUsed` by `1`.
2. **Firestore Security Rules:** We will write a rule that validates this transaction on the backend:
   - "Allow write IF `tokensUsed` <= 5 (for basic) OR <= 15 (for pro)."
   - If a hacker attempts to bypass the UI and create an application via the console, Firebase will block the request because the counter validation is handled securely on the server.
3. **UI Reflection:** The frontend will simply read `weeklyQuota.tokensUsed` to instantly display progress bars and lock UI buttons without needing to filter arrays.

---

## 4. UI / UX Experience

- **The Progress Bar:** The Subscription tab will feature a clean progress bar showing `X / 5 Requests Used This Week`.
- **The Lockout:** If a Basic teacher hits 5 requests, the "Send Offer" button in the Student modal will turn gray. Clicking it will open a "Quota Exceeded" modal with a direct link to pay for the Pro plan. 
- **The Upsell:** The Pro tier card will clearly highlight the ROI: *"Upgrade for Rs 499 to unlock 10 more students this week!"*
