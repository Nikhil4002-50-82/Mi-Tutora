# Mi Tutora — Quality Assurance Report

**Scope:** Full codebase review of the Mi Tutora web application (`web/`, Next.js 16 + React 19 + Firebase/Firestore), plus repo-root artifacts (SQL schemas, deployment config).
**Method:** Static code review of every route, component, and config file; no runtime/browser testing was performed (read-only review, no code modified). All findings are cited to specific files/lines.
**Reviewed as of:** 2026-07-12.

**Architecture note (context for every finding below):** This application has **no server-side API routes**. Every dashboard reads and writes Firestore directly from the browser using the Firebase client SDK. There is **no `firestore.rules` file anywhere in the repository**. This single fact is the root cause behind the large majority of Critical/High findings in this report — the client code was written as if a trusted server layer (or at least strict security rules) enforces authorization, payment integrity, and data validation, but no such enforcement exists anywhere in the version-controlled codebase.

---

## Table of Contents
1. [Security & Authentication](#1-security--authentication)
2. [Student Dashboard](#2-student-dashboard)
3. [Teacher Dashboard & Profile Form](#3-teacher-dashboard--profile-form)
4. [Landing Page, Marketing & Demo Form](#4-landing-page-marketing--demo-form)
5. [Backend, DevOps & Code Quality](#5-backend-devops--code-quality)
6. [Simulated User Journeys](#6-simulated-user-journeys)
7. [QA Summary Report](#7-qa-summary-report)

---

## 1. Security & Authentication

### SEC-01 — No role-based authorization on dashboard routes
**Severity:** Critical | **Category:** Security / Authorization
**Description:** Neither `/dashboard/student` nor `/dashboard/teacher` verifies that the logged-in user's actual `role` matches the route. Each page's data-fetcher only checks `if (!user) router.push('/login')` — it never checks `userData.role`.
**Why it's a problem:** Any authenticated user (student or teacher) can navigate directly to the other role's dashboard URL and interact with role-specific UI and Firestore writes (e.g., a student account calling the teacher "Send Offer" flow). Combined with SEC-02, there is no layer — client or server — actually enforcing that a student can't act as a tutor.
**Recommended fix:** On mount, fetch `users/{uid}.role` and redirect to the correct dashboard (or a 403 page) if it doesn't match the route. This must be paired with real Firestore rules (SEC-02), since a client-side redirect alone is not real access control.
**Files:** `web/src/app/dashboard/student/page.tsx:37-47`, `web/src/app/dashboard/teacher/page.tsx:31-41`

### SEC-02 — No Firestore security rules exist anywhere in the repository
**Severity:** Critical | **Category:** Security
**Description:** A repo-wide search finds no `firestore.rules` or `firebase.json`. The application is a pure client-side Firestore consumer (every dashboard does `getDocs(collection(db, '...'))` directly from the browser), so whatever rules currently protect the live Firebase project are entirely un-versioned and unreviewable.
**Why it's a problem:** This is the single largest risk in the codebase. Without rules in front of it, Firestore's default posture (or whatever ad hoc rules exist only in the Firebase console) is the *only* thing standing between any signed-in user and full read/write access to every collection — `users`, `students`, `tutors`, `applications`, `withdrawals`, `referrals`. The teacher dashboard already fetches the **entire** `students` collection client-side (`getDocs(collection(db,'students'))`), which only makes sense if rules scope it — but there's no evidence rules do.
**Recommended fix:** Author `firestore.rules` that enforce: users can only write their own `users`/`tutors`/`students` docs; `walletBalance` and application `status` transitions are validated server-side (Cloud Functions) rather than open to client writes; `students`/`tutors` reads are scoped appropriately. Commit the rules file and deploy it via CI, not the console.
**Files:** repository-wide (absence); `web/src/utils/firebase/client.ts`; `web/src/app/dashboard/teacher/page.tsx:67-73`

### SEC-03 — Wallet balance and payment/application status are fully client-writable
**Severity:** Critical | **Category:** Security / Payment
**Description:** `walletBalance` (on `users/{uid}`) and application `status` (`negotiating` → `demo_pending_payment` → `tuition_started`) are set via ordinary client `updateDoc` calls with no server verification anywhere in the code path. There is no Cloud Function, no webhook handler, no `/api` route — the browser is the sole writer.
**Why it's a problem:** Any authenticated user can open devtools and call `updateDoc(doc(db,'users',uid), { walletBalance: 999999 })` or flip any of their own applications straight to `tuition_started` (unlocking a tutor's contact details) without ever paying. This is a direct fraud vector in an app that is explicitly designed around real money (wallet withdrawals, tuition payments).
**Recommended fix:** Move all balance and status-transition writes behind a trusted backend (Cloud Functions with the Admin SDK), using `increment()` inside transactions for balance changes, and validate every status transition server-side against the actual payment/negotiation state.
**Files:** `web/src/app/dashboard/student/page.tsx:420-487, 1094-1104`; `web/src/app/dashboard/teacher/page.tsx:392-426`

### SEC-04 — Signup role is entirely self-selected, with no verification
**Severity:** High | **Category:** Security / Business logic
**Description:** `role` is read straight from the URL query string (`?role=teacher`) and written verbatim into `users/{uid}.role` on signup — there is no admin approval, email-domain check, or any gate between "click Sign Up" and holding a live "teacher" account.
**Why it's a problem:** Combined with BIZ-01 below (marketing claims "background-verified tutors"), this means the entire tutor-vetting promise made to parents on the landing page has no implementation anywhere in the code.
**Recommended fix:** Introduce an admin-reviewed verification step (`tutors.verificationStatus: 'pending'|'approved'|'rejected'`) that gates visibility to parents until approved.
**Files:** `web/src/app/signup/page.tsx:22, 43`

### SEC-05 — Session/role cached in `localStorage`, decoupled from Firestore truth
**Severity:** High | **Category:** Security / State management
**Description:** After login/signup, `localStorage.setItem('user', JSON.stringify({ id, email, role }))` stores a plain, tamperable JSON blob. Both dashboards do re-fetch the real role from Firestore on load (so this alone isn't the authorization mechanism), but nothing else in the app appears to read/trust this localStorage value for gating — meaning it exists as dead, misleading state that a future feature could easily be built on top of insecurely.
**Why it's a problem:** It's a latent trap: any future code (e.g., a quick client-side route guard "for now") that reads `localStorage.getItem('user')` to check role would be trivially bypassable via devtools.
**Recommended fix:** Remove the localStorage role cache, or clearly document that it is UI-hint-only and must never be used for authorization decisions.
**Files:** `web/src/app/login/page.tsx:39, 231`; `web/src/app/signup/page.tsx:138`

### SEC-06 — "Forgot Password" is a dead link
**Severity:** High | **Category:** Authentication / Missing feature
**Description:** The "Forgot Password?" link on the login page is `href="#"` — it does nothing. No password-reset flow (`sendPasswordResetEmail`) exists anywhere in the codebase.
**Why it's a problem:** Any user who forgets their password is permanently locked out of their account with no self-service recovery path — a baseline expectation for any production auth flow.
**Recommended fix:** Implement `sendPasswordResetEmail(auth, email)` behind a "Reset Password" modal/page.
**Files:** `web/src/app/login/page.tsx:285-287`

### SEC-07 — Referral system is open to abuse and has no reward accrual
**Severity:** Medium | **Category:** Business logic / Security
**Description:** Referral processing (both email/password and Google signup) queries `users` for a matching `referralCode` and writes a `referrals` doc with `estimatedReward: 0` hardcoded — no logic anywhere computes or credits an actual reward. There is also no check preventing a user from referring themselves (submitting their own future code) or submitting a garbage code that happens to collide.
**Why it's a problem:** The referral feature is visibly incomplete (rewards are always 0) and has no anti-abuse guard, so it currently functions as an unrewarded, exploitable data-collection form rather than a working referral program.
**Recommended fix:** Add self-referral prevention (compare `referrerUser.id !== user.uid`), and implement the actual reward-crediting logic (server-side) referenced by `estimatedReward`.
**Files:** `web/src/app/signup/page.tsx:47-67, 107-127`

### SEC-08 — Google sign-in uses popup only, no redirect fallback
**Severity:** Medium | **Category:** Authentication / Mobile compatibility
**Description:** Both login and signup call `signInWithPopup`. Popups are frequently blocked on mobile Safari, and unreliable or entirely broken inside in-app browsers (Instagram/Facebook/WhatsApp webviews), which is a significant channel for an India-focused consumer app shared via WhatsApp.
**Why it's a problem:** A meaningful fraction of users clicking a shared link from a messaging app will find "Sign in with Google" silently fails or never returns.
**Recommended fix:** Detect popup failures / in-app browser user agents and fall back to `signInWithRedirect`.
**Files:** `web/src/app/login/page.tsx:204-237`; `web/src/app/signup/page.tsx:85-145`

### SEC-09 — No Terms of Service / Privacy Policy consent at signup
**Severity:** Medium | **Category:** Legal / Compliance
**Description:** The signup form collects name, email, password, and (implicitly) later address/phone/location data, with no checkbox or link for ToS/Privacy Policy consent anywhere in the flow.
**Why it's a problem:** Standard legal/compliance expectation for any app collecting PII from users, especially one that will store children's academic and location data.
**Recommended fix:** Add a required consent checkbox linking to ToS/Privacy Policy pages (which don't currently appear to exist either — see MKT-08 for related missing legal pages implied by Footer links).
**Files:** `web/src/app/signup/page.tsx`

### SEC-10 — No password strength enforcement
**Severity:** Medium | **Category:** Authentication / Data validation
**Description:** The password `<input>` has no `minLength`, no strength meter, and no client-side check beyond HTML `required`. Firebase's server-side default (6-character minimum) is the only floor.
**Why it's a problem:** Users can register with trivially weak passwords like `"123456"`.
**Recommended fix:** Add client-side `minLength={8}` plus a strength indicator, and consider enabling Firebase's password policy enforcement feature.
**Files:** `web/src/app/login/page.tsx:293-303`; `web/src/app/signup/page.tsx:358-368`

### SEC-11 — Raw Firebase SDK errors shown directly to users
**Severity:** Low | **Category:** UI/UX / Error handling
**Description:** Catch blocks surface `err.message` straight from the Firebase SDK (e.g., `"Firebase: Error (auth/invalid-credential)."`) via `toast.error`/`alert`, with no mapping to friendly copy.
**Why it's a problem:** Confusing, unprofessional UX, and leaks implementation details (that the backend is Firebase) to end users.
**Recommended fix:** Map common Firebase auth error codes to friendly messages before displaying.
**Files:** `web/src/app/login/page.tsx:49`; `web/src/app/signup/page.tsx:79, 143`

### SEC-12 — Form labels not programmatically associated with inputs
**Severity:** Low | **Category:** Accessibility
**Description:** Labels are rendered as plain `<label>` text without `htmlFor`/matching input `id` across login, signup, and both profile forms.
**Why it's a problem:** Screen readers cannot reliably associate the label text with its input, and clicking a label won't focus the field.
**Recommended fix:** Add matching `id`/`htmlFor` pairs to every label/input.
**Files:** `web/src/app/login/page.tsx`, `web/src/app/signup/page.tsx`, `web/src/components/TeacherForm.tsx`, `web/src/components/DemoForm.tsx`

### SEC-13 — Google sign-in logic duplicated across login/signup
**Severity:** Low | **Category:** Code quality
**Description:** The ~35-line Google popup + Firestore user-doc-creation + referral-processing block is copy-pasted almost verbatim between `login/page.tsx` and `signup/page.tsx`.
**Why it's a problem:** Any bug fix (like SEC-07's missing self-referral check) must be applied twice, and the two copies can silently drift.
**Recommended fix:** Extract a shared `useGoogleAuth(role, referralCode)` hook.
**Files:** `web/src/app/login/page.tsx:204-237`; `web/src/app/signup/page.tsx:85-145`

### SEC-14 (BIZ-01) — Marketing claims "background-verified tutors" with no verification workflow
**Severity:** High | **Category:** Business logic inconsistency / Trust & Safety
**Description:** The site's metadata and hero copy explicitly promise "highly qualified, background-verified tutors" (`layout.tsx` meta description, `Hero.tsx`, `TrustSection.tsx`). Nowhere in the codebase — signup, teacher dashboard, admin surface (none exists) — is there any verification, document-upload-and-review, or approval workflow. A tutor account is live and fully functional the instant `/signup?role=teacher` is submitted (see SEC-04).
**Why it's a problem:** This is a direct mismatch between advertised trust claims (relevant to a marketplace connecting tutors with children in parents' homes) and actual implementation — a significant trust-and-safety and potential false-advertising concern.
**Recommended fix:** Either build a real verification pipeline (document upload, admin review queue, approval gate before a tutor profile is visible to parents) or remove the "verified" claims from marketing copy until one exists.
**Files:** `web/src/app/layout.tsx:21`, `web/src/components/Hero.tsx`, `web/src/components/TrustSection.tsx`, `web/src/app/signup/page.tsx`

---

## 2. Student Dashboard

### STU-01 — Payment flow is entirely simulated; no real gateway integration
**Severity:** Critical | **Category:** Payment / Security
**Description:** "Pay Securely" (`handlePaymentSubmit`) never calls any payment processor — a repo-wide search for `razorpay|stripe` returns zero matches. It directly `updateDoc`s the application to `status: 'tuition_started', demoPaymentPaid: true`.
**Why it's a problem:** No money is ever actually collected by any code path in this repository; the "payment" screen is cosmetic. See SEC-03 for the underlying client-trust issue this compounds.
**Recommended fix:** Integrate a real gateway (Razorpay is standard for India) with server-side webhook confirmation as the sole writer of payment-confirmed status.
**Files:** `web/src/app/dashboard/student/page.tsx:420-451, 1094-1104`

### STU-02 — Negotiation state machine has no reject/cancel exit path
**Severity:** High | **Category:** Business logic
**Description:** `handleNegotiationAction` supports only `accept_price` and `counter_price`. There is no `reject`/`decline`/`withdraw` action anywhere in either dashboard (confirmed via grep for `deleteDoc|cancel|reject`).
**Why it's a problem:** If either party simply doesn't like the current offer, the negotiation is permanently stuck — and because the tutor card is hidden once a negotiation exists (`hasNegotiation` check), the student can't even re-approach that tutor fresh.
**Recommended fix:** Add a decline/withdraw action to a terminal status, and exclude terminal negotiations from the "already negotiating" card-hiding check.
**Files:** `web/src/app/dashboard/student/page.tsx:386-406, 651-655`; `web/src/app/dashboard/teacher/page.tsx:367-387`

### STU-03 — Multi-child support is broken: new applications always attribute to the first child
**Severity:** High | **Category:** Business logic / Data integrity
**Description:** The "Shopping for" dropdown lets a parent switch which child they're browsing tutors for, and the tutor grid correctly recomputes for the selected child (`activeStudent`). But `handleRequestTutor` — which actually creates the application — hardcodes `studentId: data?.myStudent?.id`, where `myStudent` is always `students[0]`, ignoring the dropdown selection entirely.
**Why it's a problem:** A parent with two children who selects child #2, browses matched tutors, and sends a request will silently create the application under child #1's name. This corrupts data for every multi-child household.
**Recommended fix:** Replace `data?.myStudent` references inside `handleRequestTutor` with `activeStudent`.
**Files:** `web/src/app/dashboard/student/page.tsx:73, 169-170, 346-384`

### STU-04 — Wallet mutations use stale-read-then-absolute-write (race condition)
**Severity:** High | **Category:** Concurrency / Payment
**Description:** Both the payment-with-wallet flow and the withdrawal flow read `walletBalance` from client-cached SWR data and write back an absolute computed value rather than using Firestore's `increment()` inside a transaction.
**Why it's a problem:** Two concurrent writes (two tabs, or a race with a referral-reward credit) can silently overwrite each other, losing money from either side.
**Recommended fix:** Use `runTransaction` with `increment()` for every wallet mutation.
**Files:** `web/src/app/dashboard/student/page.tsx:427-433, 462-476`

### STU-05 — No loading or error UI states are ever shown to the user
**Severity:** High | **Category:** State management / Error handling
**Description:** `useSWR` returns `isLoading`/`error`, both destructured (`loading`, `swrError`) but never referenced again anywhere in the component (unlike the teacher dashboard, which does gate on `swrError`).
**Why it's a problem:** While the initial Firestore fetch is in flight, every tab renders its "nothing here yet" empty state — indistinguishable from a genuinely empty account. If the fetch fails outright (e.g., a future `permission-denied` once SEC-02 is fixed), the user sees a fully rendered but silently blank dashboard with no indication anything is wrong.
**Recommended fix:** Add a loading skeleton gated on `loading` and a visible error/retry banner gated on `swrError`.
**Files:** `web/src/app/dashboard/student/page.tsx:166`

### STU-06 — Counter-offer values are written with no numeric/positivity validation
**Severity:** High | **Category:** Data validation
**Description:** `ActionModal`'s price input is `type="number"` with no `min` attribute, and only checks `!value.trim()` before calling back. The caller (`handleNegotiationAction`) then `parseInt`s the value with no `isNaN`/`<= 0` guard before writing straight to Firestore.
**Why it's a problem:** A negative or malformed entry can be written as `currentOffer`, later rendering as `₹NaN` or a negative fee downstream, and could even be locked in as `finalPrice` on accept.
**Recommended fix:** Add `min="0"` to the input, and validate `Number.isFinite(n) && n > 0` both in `ActionModal` and again before the Firestore write.
**Files:** `web/src/components/ActionModal.tsx:37-47, 100-108`; `web/src/app/dashboard/student/page.tsx:386-406, 772-790`

### STU-07 — Silent-submission retry can create duplicate student/tuition-request documents
**Severity:** Medium | **Category:** Data integrity / Error handling
**Description:** `processSilentSubmission` reads a queued demo-form payload from `localStorage`, creates a `students` doc and a `tuition_requests` doc, and only clears the localStorage key after both succeed — all wrapped in one `try/catch` that only does `console.error`.
**Why it's a problem:** A network drop between the two writes (or before the cleanup) leaves the payload in localStorage, so the next page load re-runs the whole thing, creating duplicates with no de-duplication check.
**Recommended fix:** Use a single batched/transactional write for both documents, or an idempotency key.
**Files:** `web/src/app/dashboard/student/page.tsx:251-317`

### STU-08 — Firestore `in` query caps tutor detail lookups at 10, silently dropping the rest
**Severity:** Medium | **Category:** Data correctness
**Description:** `tutorIds.slice(0, 10)` is used for the `documentId() in [...]` query, with a code comment acknowledging the limitation ("Assuming <10 for this demo context").
**Why it's a problem:** A student who has applied to more than 10 tutors loses subject/technology/contact details for every tutor beyond the 10th — those applications render with blank info.
**Recommended fix:** Chunk `tutorIds` into groups of 10 and issue multiple queries, merging results.
**Files:** `web/src/app/dashboard/student/page.tsx:112-121`

### STU-09 — Dead handler `handleAppointTutor` never wired to any UI control
**Severity:** Medium | **Category:** Dead code / Incomplete feature
**Description:** A function that sets an application to `tuition_started` with a `startDate` exists but is never called from any `onClick`.
**Why it's a problem:** Suggests a "hire without payment" path was built and abandoned — currently the only route to `tuition_started` is the fake-payment flow (STU-01).
**Recommended fix:** Remove the dead handler, or wire it up if a no-payment appointment flow is intended.
**Files:** `web/src/app/dashboard/student/page.tsx:408-418`

### STU-10 — Dead/unreachable status values `demo_booked` and `confirmed`
**Severity:** Medium | **Category:** Dead code
**Description:** Both statuses are checked in filtering/styling logic in both dashboards but are never assigned anywhere in the codebase (grep-confirmed).
**Why it's a problem:** Indicates an incomplete status model — related to the entirely-unwired demo-scheduling feature (see TCH-03).
**Recommended fix:** Remove the dead branches, or implement the missing demo-booking step that would produce these statuses.
**Files:** `web/src/app/dashboard/student/page.tsx:152, 652, 851-855`; `web/src/app/dashboard/teacher/page.tsx:25, 182, 627`

### STU-11 — Inconsistent multi-student filtering causes grid/empty-state mismatch
**Severity:** Medium | **Category:** State management / Multi-child edge case
**Description:** The tutor grid renders `computedRecommendedTutors` (correctly derived from the selected `activeStudent`), but the "no tutors found" empty-state banner checks `data?.recommendedTutors` — a stale, always-`myStudent`-only value from the SWR fetcher.
**Why it's a problem:** When a parent switches to a non-first child, the grid and the "no tutors found" banner can disagree (both shown, or banner suppressed while grid is actually empty).
**Recommended fix:** Use `computedRecommendedTutors` consistently for both the grid and the empty-state check.
**Files:** `web/src/app/dashboard/student/page.tsx:650, 724`

### STU-12 — `hasProfile=true` with zero student records produces orphaned data
**Severity:** Medium | **Category:** Edge case / Data integrity
**Description:** `hasProfile` is `true` if either the legacy `userData.hasProfile` flag or `allStudents.length > 0`. If a user has the legacy flag set but zero `students` docs, `activeStudent` is `null`, the match filter (`if (!activeStudent) return true`) matches **every** tutor with no filtering at all, and `handleRequestTutor` writes `studentId: undefined`.
**Why it's a problem:** Produces orphaned application records not tied to any real student and shows irrelevant tutors.
**Recommended fix:** When `activeStudent` is null, block the request flow (same as the `!hasProfile` case) and prompt to add a student profile.
**Files:** `web/src/app/dashboard/student/page.tsx:169-172, 200, 362-370`

### STU-13 — Profile tab has no empty-state UI for the zero-students edge case
**Severity:** Medium | **Category:** Empty states
**Description:** Unlike other tabs (which have dashed-border empty-state cards), the Profile tab's student grid has no fallback when `allStudents` is empty — just a blank area under the header.
**Recommended fix:** Add a consistent empty-state card.
**Files:** `web/src/app/dashboard/student/page.tsx:950-1040`

### STU-14 — Unit mismatch between monthly "budget" and hourly "offer" fields
**Severity:** Medium | **Category:** Business logic / UX
**Description:** The student profile displays `Budget: ₹{s.budget}/mo`, but the negotiation offer input is explicitly labeled `Your Offer (₹/hr)`, and `handleRequestTutor` seeds the offer from the monthly budget with no conversion.
**Why it's a problem:** A parent with a ₹5,000/month budget could type "5000" into the hourly-offer field, producing a wildly inflated hourly rate offer.
**Recommended fix:** Standardize on one unit across profile budget and negotiation offers, with clear, consistent labeling.
**Files:** `web/src/app/dashboard/student/page.tsx:685, 1012, 369`

### STU-15 — No submit-guard on "Request & Offer"; duplicate applications on double-click
**Severity:** Low | **Category:** State management
**Description:** `requestLoading` state is declared but never read or set anywhere; the button has no `disabled` gate tied to the in-flight request.
**Recommended fix:** Wire `requestLoading` into `handleRequestTutor` and disable the button while true.
**Files:** `web/src/app/dashboard/student/page.tsx:23, 346-384, 710-716`

### STU-16 — `subTab` state declared but never used
**Severity:** Low | **Category:** Code quality
**Files:** `web/src/app/dashboard/student/page.tsx:31`

### STU-17 — `recommendedNegotiations`/`computedRecommendedNegotiations` computed but never rendered
**Severity:** Low | **Category:** Dead code
**Description:** Both values are calculated on every render but the Requests tab always renders the unfiltered `allNegotiations` list instead.
**Files:** `web/src/app/dashboard/student/page.tsx:135, 151, 198`

### STU-18 — `CategorySelector` component is entirely unused
**Severity:** Low | **Category:** Dead code / Duplication
**Description:** A fully-built category-picker component is never imported anywhere; the dashboard instead re-implements the same UI inline.
**Recommended fix:** Delete the unused component or replace the inline duplicate with it.
**Files:** `web/src/components/CategorySelector.tsx`; `web/src/app/dashboard/student/page.tsx:575-587`

### STU-19 — Weak UPI ID validation
**Severity:** Low | **Category:** Data validation
**Description:** Withdrawal UPI ID is validated with only `upiId.includes('@')` — no format regex, no trimming.
**Recommended fix:** Use a proper UPI ID regex (e.g. `/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/`).
**Files:** `web/src/app/dashboard/student/page.tsx:453-457`; `web/src/app/dashboard/teacher/page.tsx:392-396`

### STU-20 — Withdrawals are all-or-nothing; no partial withdrawal
**Severity:** Low | **Category:** Business logic / UX
**Description:** `handleWithdrawSubmit` hardcodes `amount: currentBalance` with no input for a smaller amount.
**Files:** `web/src/app/dashboard/student/page.tsx:453-487, 903-916`

### STU-21 — Icon-only buttons missing `aria-label`
**Severity:** Low | **Category:** Accessibility
**Description:** Mobile menu toggle, sidebar close, and modal close buttons render only an icon/glyph with no accessible name.
**Files:** `web/src/app/dashboard/student/page.tsx:504-506, 522-524, 1159-1164`; `web/src/app/dashboard/teacher/page.tsx:443-445, 461-463, 966-971`

### STU-22 — Modals lack Escape-to-close, focus trapping, and `role="dialog"`
**Severity:** Low | **Category:** Accessibility / Keyboard navigation
**Description:** None of the payment, withdraw, tutor-profile, category-popup, or `ActionModal` dialogs implement an Escape handler, focus trap, or `role="dialog" aria-modal="true"`.
**Files:** `web/src/app/dashboard/student/page.tsx:575-587, 1044-1108, 1110-1150, 1156-1201`; `web/src/components/ActionModal.tsx:49-158`

### STU-23 — "View" button on student cards actually opens the edit form
**Severity:** Low | **Category:** UX / Naming
**Description:** The `View` button calls `setEditingStudentId`, routing into the same editable `DemoForm`, not a read-only summary.
**Files:** `web/src/app/dashboard/student/page.tsx:1029-1034, 972-976`

### STU-24 — Default "Dashboard" landing tab is an unfinished placeholder
**Severity:** Low | **Category:** Incomplete feature
**Description:** The first tab a student sees renders only: *"Your dashboard overview is currently being updated..."* — no stats, no summary.
**Files:** `web/src/app/dashboard/student/page.tsx:600-608`

### STU-25 — Hardcoded ₹4000 fallback price duplicated across 6 locations
**Severity:** Low | **Category:** Code quality
**Description:** The literal `4000` fallback for a missing `finalPrice`/`currentOffer` is repeated independently in 6 places rather than a shared constant — and interacts badly with STU-06 (a `NaN` offer would fall back to a silently-displayed ₹4000).
**Files:** `web/src/app/dashboard/student/page.tsx:160, 426, 1054, 1073, 1081, 1115`

### STU-26 — Tutor profile modal can crash on a missing tutor name
**Severity:** Low | **Category:** Error handling
**Description:** `selectedViewUser.name.charAt(0)` has no null-guard.
**Recommended fix:** `selectedViewUser.name?.charAt(0) || '?'`.
**Files:** `web/src/app/dashboard/student/page.tsx:1166-1168`

---

## 3. Teacher Dashboard & Profile Form

### TCH-01 — Required "Email ID" field is silently discarded, never persisted
**Severity:** Critical | **Category:** Data integrity
**Description:** The profile form's Email field is `required` and pre-filled from `initialData.email`, but is never included in either Firestore write path (`setDoc` on create, `updateDoc` on edit).
**Why it's a problem:** Tutors fill in a mandatory field that is always thrown away. Anything depending on `tutors/{uid}.email` (contact, notifications) will always find it missing.
**Recommended fix:** Add `email: formData.email` to both write paths.
**Files:** `web/src/components/TeacherForm.tsx:167-190`; `web/src/app/dashboard/teacher/page.tsx:266-289`

### TCH-02 — Category selector labeled "multi-select" is implemented as single-select
**Severity:** High | **Category:** Business logic
**Description:** The section header reads "📚 Select Teaching Categories (Multi-select)" but is built with `<input type="radio">`, allowing only one selection — while the dashboard's own matching/tab logic explicitly supports comma-separated multi-category tutors.
**Why it's a problem:** Tutors can never register for more than one category, even though the rest of the system is built to support it.
**Recommended fix:** Implement real multi-select checkboxes storing a joined string/array, or remove the misleading "Multi-select" label and the now-dead multi-category branches.
**Files:** `web/src/components/TeacherForm.tsx:358-379`; `web/src/app/dashboard/teacher/page.tsx:77, 572-588`

### TCH-03 — Demo Class Booking / Scheduling feature is entirely unwired
**Severity:** High | **Category:** Missing feature
**Description:** `ActionModal` supports a `type="timing"` mode (date/time picker) intended for scheduling demo classes, but no call site anywhere in either dashboard ever uses it — `modalConfig` is only ever set with `type: 'price'`. Correspondingly, the `demo_booked` status (STU-10) is referenced in filters but never assigned.
**Why it's a problem:** This is one of the explicitly required core user journeys (Demo Class Booking) and it does not function on the tutor side at all — there is no way for a tutor to propose or confirm a demo class date/time within the negotiation flow.
**Recommended fix:** Wire a "Schedule Demo" action to the timing modal that sets `status: 'demo_booked'` with the chosen date/time, and surface it in both dashboards' negotiation UI.
**Files:** `web/src/app/dashboard/teacher/page.tsx:25, 182, 627`; `web/src/components/ActionModal.tsx:12`

### TCH-04 — No submit-guard on "Send Offer"; double-click creates duplicate applications
**Severity:** High | **Category:** Concurrency / Data integrity
**Description:** Unlike the withdrawal flow (which has a `withdrawLoading` guard), `handleSendOffer`'s button has no disabled/loading state, and there is no check for an existing non-terminal application before creating a new one.
**Why it's a problem:** A double-click on a slow connection creates two `applications` documents for the same tutor/student pair before the UI updates to hide the student.
**Recommended fix:** Disable the button while submitting; query for an existing application before creating a new one.
**Files:** `web/src/app/dashboard/teacher/page.tsx:327-365, 671-684`

### TCH-05 — Required-field enforcement is inconsistent
**Severity:** Medium | **Category:** Data validation
**Description:** Several fields are labeled with a required "*" (Full Name, Qualification, Residential Address) but only Email/Street/City/Pincode actually carry the HTML `required` attribute; `handleSubmit` performs no manual validation at all.
**Why it's a problem:** A tutor profile can be saved (`hasProfile: true`) with a blank name, no qualification, and no phone number.
**Recommended fix:** Add `required` to the remaining fields and add matching validation with user-facing error messages before the Firestore write.
**Files:** `web/src/components/TeacherForm.tsx:386-398, 555-568, 441-454, 358-379`

### TCH-06 — Blank category can be submitted, silently locking a tutor out of all matching
**Severity:** Medium | **Category:** Business logic
**Description:** A tutor can submit with `category: ''`. The dashboard's matching logic (`tutorData.category.split(',')` → `['']`) then never matches any student, with no error or guidance shown to the tutor.
**Recommended fix:** Require category selection before allowing submission.
**Files:** `web/src/components/TeacherForm.tsx:352-379`; `web/src/app/dashboard/teacher/page.tsx:77-141`

### TCH-07 — "Same as Phone" checkbox is a misleading one-shot copy, not live sync
**Severity:** Medium | **Category:** UX / Dead code
**Description:** A `sameAsPhone` state and `handleSameAsPhone` setter exist for keeping WhatsApp in sync with Phone, but the actual rendered checkbox does its own inline one-time copy and never calls `setSameAsPhone(true)` — so editing the phone number afterward never updates WhatsApp, despite the checkbox implying an ongoing link.
**Recommended fix:** Wire the checkbox to the intended sync state, or remove the dead state and keep only the one-shot copy (with copy that makes its one-time nature clear).
**Files:** `web/src/components/TeacherForm.tsx:27, 117-130, 461-467`

### TCH-08 — Resume/CV upload field is completely non-functional
**Severity:** Medium | **Category:** Missing feature
**Description:** The "Resume / CV" `<input type="file">` has no `name`, `onChange`, `accept` filter, and is never read in `handleSubmit`.
**Why it's a problem:** Tutors are invited to upload a CV; the file is silently discarded with no feedback that nothing happened.
**Recommended fix:** Implement real upload to Firebase Storage with type/size validation, or remove the input until implemented.
**Files:** `web/src/components/TeacherForm.tsx:541-550`

### TCH-09 — `hasProfile` gating uses an unreliable OR-fallback
**Severity:** Medium | **Category:** Business logic
**Description:** `hasProfile = userData.hasProfile || !!profile?.phone` — a tutor whose `hasProfile` flag is `false` but whose `tutors` doc happens to have a truthy `phone` (e.g. partial/test data) is treated as profile-complete across the entire dashboard.
**Recommended fix:** Rely solely on the `hasProfile` flag set atomically at the end of a successful submission.
**Files:** `web/src/app/dashboard/teacher/page.tsx:194`

### TCH-10 — Silent failures with no user feedback
**Severity:** Medium | **Category:** Error handling
**Description:** The full-collection student fetch and the post-signup "silent" profile auto-save both fail with only `console.warn`/`console.error` — no toast, no banner.
**Recommended fix:** Surface `toast.error(...)` (already used elsewhere in this file) on these failure paths.
**Files:** `web/src/app/dashboard/teacher/page.tsx:66-73, 250-298`

### TCH-11 — Unused imports suggest abandoned features
**Severity:** Low | **Category:** Code quality
**Description:** `axios` is imported but never called; `ShieldCheck`, `CalendarDays`, `Star`, `CheckCircle2` are imported but never rendered — `ShieldCheck` in particular suggests an abandoned tutor-verification badge (see SEC-14).
**Files:** `web/src/app/dashboard/teacher/page.tsx:6, 8`

### TCH-12 — Fragile address parsing via comma-split/join
**Severity:** Low | **Category:** Data integrity
**Description:** Address is stored as one joined string and re-parsed via `.split(',')[0/1/2]` when re-populating the edit form.
**Why it's a problem:** A street value containing its own comma (e.g., "12, MG Road") misaligns city/pincode on the next edit, silently corrupting previously-saved data.
**Recommended fix:** Store `street`, `city`, `pincode` as separate Firestore fields.
**Files:** `web/src/components/TeacherForm.tsx:36-38, 67-69, 173`

### TCH-13 — Overly broad Enter-key suppression degrades keyboard UX
**Severity:** Low | **Category:** Accessibility
**Description:** A blanket `onKeyDown` handler prevents Enter on every non-textarea field across the entire long form.
**Recommended fix:** Scope suppression more precisely, or restructure as a true multi-step wizard.
**Files:** `web/src/components/TeacherForm.tsx:350`

### TCH-14 — "Multi-step" form is actually one long single-page scroll
**Severity:** Low | **Category:** UX
**Description:** Despite the conceptual framing, `TeacherForm.tsx` is a single ~900-line scrolling form with one submit button — no steps, no per-step validation, no progress indication.
**Files:** `web/src/components/TeacherForm.tsx:325-980`

### TCH-15 — Massive logic duplication between student and teacher dashboards
**Severity:** Low | **Category:** Code quality / Maintainability
**Description:** The `fetcher` scaffolding, referral-code generation, realtime subscription, logout, withdrawal handler, mobile nav, negotiation UI, and category-popup modal are duplicated near-verbatim across both dashboard files. The tutor/student matching algorithm specifically is implemented **three separate times** (once per dashboard's fetcher, plus a third `computedRecommendedTutors` reimplementation inside the student file alone).
**Why it's a problem:** Any bug fix or rule change must be manually replicated 2-3 times — this is very likely how bugs like TCH-07 and STU-10 crept in.
**Recommended fix:** Extract shared hooks (`useAuthUserDoc`, `useReferralCode`, `useRealtimeApplications`) and a shared matching function/component library.
**Files:** `web/src/app/dashboard/teacher/page.tsx:31-426`; `web/src/app/dashboard/student/page.tsx:37-487, 82-107, 171-196`

### TCH-16 — Unstyled bare-text loading/error states
**Severity:** Low | **Category:** UI/UX
**Files:** `web/src/app/dashboard/teacher/page.tsx:389-390`

### TCH-17 — Dead `requestId: ''` field written on every application, never used
**Severity:** Low | **Category:** Dead code
**Files:** `web/src/app/dashboard/teacher/page.tsx:345`

### TCH-18 — Inconsistent match logic between category types
**Severity:** Low | **Category:** Business logic
**Description:** For `school` category, matching uses `boardMatch || classMatch || subjectMatch` (any one dimension matching is enough); for `programming`/`languages` it's effectively an AND on a single dimension. This inconsistency likely produces a disproportionately noisy recommendation list for the largest tutor category.
**Recommended fix:** Align matching semantics consistently across categories.
**Files:** `web/src/app/dashboard/teacher/page.tsx:87-113` vs `116-138`

### TCH-19 — Hardcoded, mixed-granularity exam/grade options
**Severity:** Informational | **Category:** Data modeling
**Description:** The "Classes you Teach" list mixes grade ranges ("6th - 8th") with exam names ("KCET", "NEET", "JEE") and India-region-specific values in one flat list with no separation of "grade" from "target exam."
**Files:** `web/src/components/TeacherForm.tsx:653-664`

---

## 4. Landing Page, Marketing & Demo Form

### MKT-01 — Public lead-generation Demo form can be submitted with a blank name, phone, and email
**Severity:** Critical | **Category:** Data validation / Business logic
**Description:** Only the three address inputs carry the HTML `required` attribute. `fullName`, `gender`, `phone`, `whatsapp`, and `email` are all displayed with a red "*" implying required, but have no `required` attribute and no JS-side validation before the write.
**Why it's a problem:** This form's entire purpose is lead capture — an unreachable lead (blank phone/email) is a dead lead, yet it's persisted/forwarded as if valid.
**Recommended fix:** Add `required` plus format constraints to name/phone/whatsapp/email, and a client-side check before submission proceeds.
**Files:** `web/src/components/DemoForm.tsx:556-568, 610-668, 682, 691, 700`

### MKT-02 — Phone/WhatsApp fields accept non-numeric garbage
**Severity:** High | **Category:** Data validation
**Description:** `type="tel"` imposes no format validation; there is no `pattern` attribute or regex check anywhere in the change/submit handlers.
**Why it's a problem:** Free-text garbage can be written straight into `students.phoneNumber`, breaking downstream tutor/admin contact flows.
**Recommended fix:** Add `pattern="[0-9]{10,15}"` and/or a JS regex check before submit.
**Files:** `web/src/components/DemoForm.tsx:618-648`

### MKT-03 — Landing-page demo submission never persists to any backend
**Severity:** High | **Category:** Business logic
**Description:** When the Demo form is used on the public landing page (not the dashboard), `handleSubmit` only writes to `localStorage` and redirects to `/signup` — no Firestore write occurs until (and unless) the user actually completes signup afterward.
**Why it's a problem:** If the user closes the tab, switches devices, or clears storage/private-browsing before finishing signup, the "demo booking" is silently and permanently lost with zero record anywhere — no lead capture, no analytics event.
**Recommended fix:** Persist the lead server-side immediately on submit (e.g., a lightweight `leads` write tied to a session id), independent of whether signup is ever completed.
**Files:** `web/src/components/DemoForm.tsx:259-270`

### MKT-04 — Fixed header overlaps every anchor-scrolled section
**Severity:** High | **Category:** Navigation / UX
**Description:** The `fixed top-0` header (~130-150px tall with the contact bar) is not compensated for by `scroll-margin-top` or an offset in `scrollIntoView`. Every in-page nav/footer link (`#services`, `#testimonials`, `#faq`) scrolls the target's top edge to the very top of the viewport, landing underneath the fixed header.
**Recommended fix:** Add `scroll-margin-top` (e.g. Tailwind `scroll-mt-[140px]`) to every anchor target, or offset the scroll calculation.
**Files:** `web/src/components/Navbar.tsx:25-34`; `web/src/components/Footer.tsx:71-101`; `web/src/components/ServicesGrid.tsx:36`, `Testimonials.tsx:54`, `FAQ.tsx:63`

### MKT-05 — Storage cleanup bug: writes `localStorage`, clears `sessionStorage`
**Severity:** Medium | **Category:** Data hygiene / Bug
**Description:** Submission writes the full form (name, phone, address, email) to `localStorage`, but the post-submit cleanup calls `sessionStorage.removeItem('demoFormData')` — the wrong storage object.
**Why it's a problem:** PII persists indefinitely in the browser's localStorage past the point it should have been cleared.
**Recommended fix:** Change the cleanup call to `localStorage.removeItem('demoFormData')`.
**Files:** `web/src/components/DemoForm.tsx:267` (write) vs `387` (wrong cleanup)

### MKT-06 — Submission errors shown via blocking native `alert()`
**Severity:** Medium | **Category:** UX / Error handling
**Description:** `catch (err) { alert(err.message || 'Failed to submit demo request'); }` — jarring, unstylable, blocks the main thread.
**Recommended fix:** Add an inline `errorMsg` state, mirroring the existing `successMsg` pattern already in the component.
**Files:** `web/src/components/DemoForm.tsx:393-395`

### MKT-07 — "Become a Tutor" in-page modal path is completely dead
**Severity:** Medium | **Category:** Dead code / Missing feature
**Description:** `Navbar.tsx` defines an `openTeacherForm()` dispatcher that is never wired to any click handler. `Hero.tsx` does listen for the (misleadingly-named) event but would open the **Demo** form modal, not a teacher form — and separately, `Hero.tsx`'s own `showForm`/`TeacherForm` modal state is never set to `true` anywhere in the codebase, making that modal permanently unreachable. The site's actual "Become a Tutor" CTA instead correctly links to `/signup?role=teacher`.
**Recommended fix:** Remove the dead dispatcher and unreachable modal state, since the working path (`/signup?role=teacher`) already covers this.
**Files:** `web/src/components/Navbar.tsx:36-40`; `web/src/components/Hero.tsx:16, 21-32, 199-241`

### MKT-08 — Three landing sections are stub components (`return null`) but still imported, rendered, and linked
**Severity:** Medium | **Category:** Missing content / Dead code
**Description:** `HowItWorks.tsx`, `ContactSection.tsx`, and `AppDownload.tsx` each contain only imports and `return null`. They're still imported and rendered by `page.tsx`, and the Navbar/Footer still link to `#how-it-works`, which no longer exists in the DOM (the link silently no-ops).
**Why it's a problem:** The nav promises sections ("How It Works", "Contact Us") that don't exist on the live site, and unused `motion`/`lucide-react` imports still ship in the client bundle for no benefit.
**Recommended fix:** Either implement these sections or remove the stub components, their imports, and the dangling nav/footer links.
**Files:** `web/src/components/HowItWorks.tsx`, `ContactSection.tsx`, `AppDownload.tsx`; `web/src/app/page.tsx:10, 14-15, 32, 37-38`; `Navbar.tsx:42-47, 95-104, 175-183`; `Footer.tsx:73`

### MKT-09 — Mobile hamburger menu has no `aria-label`/`aria-expanded`
**Severity:** Medium | **Category:** Accessibility
**Files:** `web/src/components/Navbar.tsx:157-162`

### MKT-10 — Footer social icon links have no accessible name
**Severity:** Medium | **Category:** Accessibility
**Description:** Instagram/Facebook links contain only a decorative SVG with no `aria-label`, unlike `WhatsAppButton.tsx` which correctly has one.
**Files:** `web/src/components/Footer.tsx:132-147`

### MKT-11 — Sitemap omits `/signup`, the primary conversion route
**Severity:** Medium | **Category:** SEO
**Description:** `sitemap.ts` lists only `/` and `/login`; `/signup` — the destination of nearly every CTA on the site — is missing entirely.
**Files:** `web/src/app/sitemap.ts:4-17`

### MKT-12 — Entire landing page is a Client Component tree, forfeiting SSR
**Severity:** Medium | **Category:** Performance
**Description:** `page.tsx` itself starts with `"use client"`, and every composed section independently declares `"use client"` and imports `framer-motion`, so the largely-static marketing page hydrates as one large client bundle instead of leveraging server rendering.
**Recommended fix:** Drop the top-level `"use client"` and only mark genuinely interactive leaf components (forms, dropdowns) as client components.
**Files:** `web/src/app/page.tsx:1` and all composed component files

### MKT-13 — "How It Works" nav/footer link points to a nonexistent anchor
**Severity:** Low | **Category:** Broken link
**Description:** Direct consequence of MKT-08 — the link target no longer exists in the DOM.
**Files:** `web/src/components/Navbar.tsx:42-47`; `Footer.tsx:73`

### MKT-14 — Budget field has no `min` bound, silently coerces invalid input to 0
**Severity:** Low | **Category:** Data validation
**Files:** `web/src/components/DemoForm.tsx:1163-1171, 316, 354, 379`

### MKT-15 — Tutor-recruitment CTA emails a personal Gmail address
**Severity:** Low | **Category:** Content integrity
**Description:** `mailto:musharrafak06@gmail.com` is used instead of the official `mitutoraeducation@gmail.com` used consistently everywhere else on the site.
**Files:** `web/src/components/TutorJoin.tsx:85`

### MKT-16 — WhatsApp button's `window.open()` missing `noopener`/`noreferrer`
**Severity:** Low | **Category:** Security (minor)
**Files:** `web/src/components/WhatsAppButton.tsx:11`

### MKT-17 — Footer heading hierarchy skips `h2`
**Severity:** Low | **Category:** Accessibility
**Files:** `web/src/components/Footer.tsx:67-121`

### MKT-18 — Testimonials use stock photos under fabricated customer names, undisclosed
**Severity:** Low | **Category:** Content integrity
**Description:** All six testimonial photos are `images.unsplash.com` stock URLs paired with named "reviews."
**Files:** `web/src/components/Testimonials.tsx:8-51`

### MKT-19 — Sitemap `lastModified` uses request-time `Date()`, no real freshness signal
**Severity:** Low | **Category:** SEO
**Files:** `web/src/app/sitemap.ts:7, 13`

### MKT-20 — Always-on infinite marquee animation, no viewport gating
**Severity:** Low | **Category:** Performance
**Description:** A tripled-DOM-node ticker runs `repeat: Infinity` continuously regardless of visibility, unlike other sections in the same file that correctly gate on `whileInView`.
**Files:** `web/src/components/WhyChooseUs.tsx:30-58`

---

## 5. Backend, DevOps & Code Quality

### BE-01 — Dead/orphaned Supabase SQL + RLS files create serious drift/confusion risk
**Severity:** High | **Category:** Architecture / Security confusion
**Description:** Three mutually-inconsistent Postgres schema files (`schema_sync.sql`, `web/exact_schema.sql`, `web/supabase_schema.sql`) plus an RLS patch (`web/fix_rls.sql`) remain committed, describing a Supabase backend the running application does not use — confirmed via git history and a repo-wide grep showing zero `@supabase/supabase-js` imports, zero Supabase env vars, and only two stale code comments in `DemoForm.tsx`. The app is 100% Firebase.
**Why it's a problem:** A reviewer could easily mistake these Postgres `CREATE POLICY`/RLS statements for the access-control layer protecting production data, when the real (and much more consequential) gap is that **no Firestore rules exist anywhere** (SEC-02). The three files also disagree with each other on naming/relations even as documentation.
**Recommended fix:** Delete these files (recoverable via git history) or move them to a clearly labeled archive folder with a README noting they're superseded; prioritize adding real `firestore.rules` to version control instead.
**Files:** `schema_sync.sql`, `web/exact_schema.sql`, `web/supabase_schema.sql`, `web/fix_rls.sql`

### BE-02 — Zero automated test coverage
**Severity:** High | **Category:** Testing / Quality Assurance
**Description:** `package.json` scripts contain only `dev`, `build`, `start`, `lint` — no test runner, no testing library of any kind is a dependency.
**Why it's a problem:** For an app handling matching, negotiation, and payment-adjacent flows with no server-side validation layer, every deploy is a manual-QA-only gate.
**Recommended fix:** Add Vitest/Jest + React Testing Library for unit/component tests and a Playwright smoke suite for the core signup → profile → request → negotiation flow.
**Files:** `web/package.json`

### BE-03 — No `.env.example` documenting required Firebase env vars
**Severity:** Medium | **Category:** Deployment documentation
**Description:** `.env*` is correctly gitignored (no secrets found in the repo — a clean pass), but nothing documents which 7 `NEXT_PUBLIC_FIREBASE_*` variables are required to run the app.
**Recommended fix:** Add `web/.env.example` with placeholder values and reference it in the README.
**Files:** `web/.gitignore`, `web/README.md`

### BE-04 — `netlify.toml` missing explicit Next.js plugin declaration and env var documentation
**Severity:** Medium | **Category:** Deployment / DevOps
**Description:** No `@netlify/plugin-nextjs` is declared as a dependency or in `[[plugins]]`, and none of the 7 required Firebase env vars are documented anywhere near the deploy config.
**Why it's a problem:** A fresh Netlify deploy can succeed at build time but produce a broken app at runtime (Firebase `initializeApp` receiving all-`undefined` config) with no build-time warning.
**Recommended fix:** Pin the Next.js runtime plugin explicitly; document required env vars in `netlify.toml`/README and verify they're set in Netlify's dashboard before any production deploy.
**Files:** `netlify.toml`, `web/package.json`

### BE-05 — Redundant UI stack: MUI + Radix + Tailwind + Emotion all present
**Severity:** Medium | **Category:** Dependency bloat / Maintainability
**Description:** `@mui/material`/`@mui/icons-material` (with `@emotion/react`/`@emotion/styled`) coexist with ~24 individual `@radix-ui/react-*` packages and Tailwind v4 — three largely overlapping component/styling systems installed simultaneously.
**Why it's a problem:** Bloats bundle size, doubles the design-system maintenance burden, signals leftover cruft from a prior redesign (consistent with the `migrate.js` script found in BE-06).
**Recommended fix:** Standardize on the Radix/Tailwind/shadcn stack (the apparent "current" direction) and remove the unused MUI/Emotion packages after a usage audit.
**Files:** `web/package.json`

### BE-06 — Stray one-off developer scripts committed to the repo root
**Severity:** Medium | **Category:** Repo hygiene / Operational risk
**Description:** `migrate.js` (React-Router→Next.js migration helper), `fix_ease.js` (regex-patches animation code), and `fix_forms.py` (contains a hardcoded absolute path from a different developer's machine, `C:\Users\Dell\Desktop\mushi\...`, also leaking the project's former codename "mushi") all perform unattended, whole-tree `fs.writeFileSync` rewrites with no dry-run or backup.
**Why it's a problem:** If any of these are accidentally re-run against the current (already-migrated) codebase, the regexes could double-apply and silently corrupt already-correct code.
**Recommended fix:** Delete these from the live tree (they remain recoverable via git history).
**Files:** `web/migrate.js`, `web/fix_ease.js`, `web/fix_forms.py`

### BE-07 — `@ts-nocheck` disables type-checking across 46 of 48 shared UI components
**Severity:** Medium | **Category:** Code quality
**Description:** Nearly every file in `src/components/ui/` (the shadcn/Radix component layer used throughout the app) begins with `// @ts-nocheck`.
**Why it's a problem:** This defeats the purpose of `"strict": true` in `tsconfig.json` for the majority of the shared UI layer — type errors in these widely-reused components go completely unchecked.
**Recommended fix:** Remove `@ts-nocheck` incrementally and fix the underlying type errors, starting with the most-used primitives (button, input, dialog, select).
**Files:** `web/src/components/ui/*.tsx` (46 files)

### BE-08 — `legacy-peer-deps=true` masks an unresolved peer-dependency conflict
**Severity:** Low | **Category:** Dependency management
**Description:** Set in both `.npmrc` (local) and `netlify.toml` (CI) — its presence in both places suggests a real, unresolved peer conflict (plausibly React 19 / MUI 9 / Radix) that's being silenced rather than fixed.
**Recommended fix:** Run `npm install` without the override to surface and resolve the actual conflict.
**Files:** `web/.npmrc`, `netlify.toml`

### BE-09 — No custom 404, error boundary, or route-level loading pages
**Severity:** Low | **Category:** Error handling / UX
**Description:** No `not-found.tsx`, `error.tsx`, or `loading.tsx` exists anywhere under `src/app/`.
**Why it's a problem:** An invalid URL falls through to Next.js's generic default 404; any render-time error in a page crashes to a blank/default error screen with no branded recovery UI.
**Recommended fix:** Add branded `not-found.tsx` and `error.tsx` at the root, and `loading.tsx` for the dashboard routes.
**Files:** `web/src/app/`

### BE-10 — Dark mode fully defined in CSS but never wired; unused `Toaster` wrapper
**Severity:** Low | **Category:** Code quality
**Description:** `theme.css` defines a complete `.dark { ... }` variable set, and `next-themes` is a dependency, but no `ThemeProvider` is ever mounted in `layout.tsx` — dark mode is unreachable dead CSS. Separately, `components/ui/sonner.tsx` (which reads `next-themes`) is never imported anywhere; `layout.tsx` imports `Toaster` directly from the `sonner` package instead.
**Files:** `web/src/styles/theme.css`, `web/src/app/layout.tsx`, `web/src/components/ui/sonner.tsx`

### BE-11 — Two global CSS files are completely empty
**Severity:** Low | **Category:** Code quality
**Description:** `src/styles/globals.css` and `src/styles/fonts.css` are both 0 bytes, despite `fonts.css` being explicitly `@import`-ed by `index.css`.
**Files:** `web/src/styles/globals.css`, `web/src/styles/fonts.css`

### BE-12 — No hardcoded secrets found; `.env` properly gitignored (positive finding)
**Severity:** Informational | **Category:** Secrets hygiene
**Description:** A repo-wide scan for API-key/secret patterns (`AIza…`, `sk_live`, `service_role`, PEM markers) found nothing. `web/src/utils/firebase/client.ts` correctly sources every config value from `process.env.NEXT_PUBLIC_FIREBASE_*`. Noted here as a genuine strength, not a defect.
**Recommended follow-up:** Add a pre-commit secret-scanning hook (gitleaks/truffleHog) to keep this true as the team grows.

---

## 6. Simulated User Journeys

Each journey below was traced through the actual code paths (not run in a browser) and cross-referenced against the findings above.

**1. Parent Registration** — `/signup?role=student` → Firebase `createUserWithEmailAndPassword` → `users`/`parents` docs created → redirect to `/dashboard/student`. The happy path works end-to-end. Confusing/missing: no password strength guidance (SEC-10), no ToS/consent checkbox (SEC-09), and the referral code field silently accepts anything with no feedback on whether it was valid (SEC-07).

**2. Tutor Registration** — Identical flow with `role=teacher`. **Major gap:** nothing distinguishes this from student signup in terms of vetting — the account is a fully live "tutor" the instant the form submits, directly contradicting the landing page's "background-verified tutors" promise (SEC-14/BIZ-01).

**3. Login / Logout** — Email/password and Google-popup login both work for the happy path. "Forgot Password?" is a dead link (SEC-06) — a user who mistypes/forgets their password has no recovery path at all. Google popup sign-in is likely to fail silently inside mobile in-app browsers (SEC-08). Logout (implemented independently in each dashboard, per TCH-15) was not observed to have issues in the reviewed code.

**4. Profile Creation** — For students, this happens via the Demo/Book-Demo form (adding a child + tuition request). Required-field enforcement is inconsistent (MKT-01) — a profile can be saved with blank contact info. For tutors, `TeacherForm` has the same problem (TCH-05), plus the Resume upload silently does nothing (TCH-08) and the Email field is silently discarded (TCH-01, **critical**).

**5. Profile Editing** — Tutors editing their profile will find their email vanished after a previous save (TCH-01) with zero indication why. Students clicking "View" on a saved child's card are unexpectedly dropped into an editable form instead of a summary (STU-23).

**6. Finding Tutors** — Category/board/subject-based matching works for the basic case. Breaks down for multi-child households: switching the "Shopping for" dropdown updates the visible tutor grid correctly, but the "no tutors found" empty-state banner can disagree with what's actually shown (STU-11).

**7. Tutor Recommendations** — "Recommended" vs. "All" tabs exist on both sides but a computed "recommended negotiations" filter is built and then never actually used in the UI (STU-17), and the underlying match algorithm is inconsistent between category types (TCH-18), producing noisier results for the largest tutor category ("school").

**8. Tuition Request Creation** — Works via the Demo form, but only if the user happens to fill in the fields that are *actually* enforced (address only — MKT-01). On the public landing page specifically, a submitted request is not durably saved anywhere until the user also completes signup (MKT-03) — closing the tab first loses it completely.

**9. Tutor Interest / Application Flow** — A tutor can "Send Offer" on a student; there's no protection against double-submission (TCH-04), and because the tutor's own email was never saved (TCH-01), any downstream contact-info display for that tutor is incomplete.

**10. Negotiation / Counter Offer** — Accept/counter-offer works, but **there is no way to decline** (STU-02, **critical UX dead-end**) — once a negotiation starts, both parties are stuck with it forever if they don't like the terms. Entered prices aren't validated, so a stray character or negative number can corrupt the displayed price (STU-06).

**11. Hiring a Tutor** — "Hiring" isn't a distinct step — it's conflated with the (fake) payment step. A `handleAppointTutor` function that looks like it was meant to support hiring without payment exists but is never called (STU-09), suggesting this journey was left half-finished.

**12. Demo Class Booking** — **This journey is fundamentally broken.** The public-facing Book Demo page exists and works (as a form). But inside the negotiation flow, the tutor-side "schedule a demo date/time" action (`ActionModal type="timing"`, `status: 'demo_booked'`) is entirely unwired to any button (TCH-03) — there is no way to actually schedule/confirm a demo class time between a matched tutor and student anywhere in the dashboards.

**13. Payment Flow** — **The single most severe finding in this report.** Clicking "Pay Securely" does not call any payment gateway — it is a plain Firestore field update performed entirely by the browser (STU-01/SEC-03). No money is ever collected by anything in this codebase, and nothing prevents a user from unlocking a "paid" tutoring engagement for free via devtools.

**14. Notifications** — **This feature does not exist.** No agent or direct review found any notification collection, bell icon, or async alert mechanism anywhere in the codebase. `sonner` toasts only fire synchronously in response to the current user's own action (e.g., "Login successful") — there is no way for a student to learn that a tutor countered their offer, or vice versa, without manually reloading the dashboard and checking.

**15. Search & Filters** — There is no manual search bar or adjustable filter (price range, rating, keyword) anywhere in either dashboard — discovery relies entirely on the automatic category/board/subject matching algorithm. Users cannot search for a specific tutor by name or browse outside the algorithm's matches.

**16. Error Recovery** — Weak throughout: most async failures are caught with only `console.error`/`console.warn` and no user feedback (STU-07, TCH-10, MKT-06); there's no `error.tsx`/`not-found.tsx` anywhere (BE-09); and "unauthorized access" isn't actually blocked at all for cross-role dashboard access (SEC-01) — the only enforced boundary is "logged in vs. not."

**17. Mobile Responsive Experience** — Tailwind responsive classes are used consistently, and the auth pages' split banner/form layout adapts well to mobile. Problems: `TeacherForm` is an extremely long single-page scroll on mobile (TCH-14), the fixed header overlaps content when following any in-page link on mobile too (MKT-04), and the mobile hamburger menu lacks proper `aria-expanded`/`aria-label` (MKT-09).

---

## 7. QA Summary Report

### Overall Project Health: **3.5 / 10**

The application has a polished, cohesive visual design and a reasonably sophisticated category-based matching concept, but the engineering underneath has not reached production-grade integrity: the payment system is entirely fake, there is no verifiable access-control layer, a required core journey (demo scheduling) is unimplemented, and a marketed core value proposition ("background-verified tutors") has no corresponding implementation anywhere in the code.

### Production Readiness: **Not Production Ready**

This app should not be launched to real users handling real money or real children's data in its current state. The blocking issues are not cosmetic — they are: (1) no real payment collection despite a "Pay Securely" UI implying one exists, (2) no committed Firestore security rules, meaning the actual production access-control posture is unknown and unreviewable from this codebase, (3) a completely open self-signup path for "tutors" with zero vetting, contradicting the site's own safety claims, and (4) a missing demo-scheduling flow that breaks one of the product's core journeys.

### Statistics

| Metric | Count |
|---|---|
| Critical Bugs | 6 |
| High Severity Issues | 19 |
| Medium Issues | 32 |
| Low Issues | 35 |
| Informational Notes | 2 |
| **Total Findings** | **94** |
| UI/UX Issues | 19 |
| Performance Issues | 3 |
| Security Issues | 14 |
| Accessibility Issues | 7 |
| Code Quality Issues | 25 |

*(Category counts overlap with severity counts — a finding is tagged with one severity and one primary category.)*

### Top 10 Highest Priority Fixes

1. **[SEC-02]** Author and deploy real, version-controlled Firestore security rules — the root cause enabling nearly every other security finding in this report.
2. **[STU-01 / SEC-03]** Replace the simulated "Pay Securely" flow with a real payment gateway (server-verified via webhook); stop trusting client writes for wallet balance and application status.
3. **[SEC-01]** Enforce role-based authorization on `/dashboard/student` and `/dashboard/teacher`, backed by the rules from #1.
4. **[SEC-14 / BIZ-01]** Build a real tutor verification/vetting workflow, or remove the "background-verified" marketing claim until one exists.
5. **[TCH-01]** Fix the tutor profile form: the required Email field is currently discarded on every save.
6. **[MKT-01]** Enforce required-field validation on the public Demo/lead-capture form — it is currently the top of the entire funnel and silently accepts unusable leads.
7. **[STU-02]** Add a reject/decline/withdraw action to the negotiation state machine — it currently has no exit path.
8. **[TCH-03]** Implement (or explicitly cut) the Demo Class Booking flow — it is entirely unwired despite being a required core journey.
9. **[STU-03]** Fix the multi-child bug that silently misattributes new applications to the wrong student.
10. **[SEC-06]** Implement a real "Forgot Password" flow — it currently does nothing.

### Strengths

- **Cohesive, polished visual design system** — consistent branding, color palette, and motion design across the marketing site and both dashboards.
- **Thoughtful matching concept** — category/board/subject/technology/language-based tutor-student matching logic, with reasonable support for multiple categories per tutor.
- **Clean secrets hygiene** — no hardcoded credentials anywhere in the repo; `.env*` correctly gitignored; Firebase config properly sourced from environment variables (BE-12).
- **TypeScript strict mode and ESLint** are configured at the project level (even though `@ts-nocheck` undermines this in the UI layer — BE-07).
- **Responsive foundation** — Tailwind breakpoints used consistently; the split-panel auth page layout adapts well across screen sizes.
- **SEO metadata groundwork** — OpenGraph tags, JSON-LD structured data, and `robots.ts` are present and mostly well-formed.
- **Sensible component decomposition** on the marketing site — many small, focused, independently reviewable components.
- **Toast-based feedback (sonner)** is used consistently for synchronous action confirmations across both dashboards.

### Recommended Action Plan (highest to lowest priority)

**Phase 1 — Security & Financial Integrity (blocking, before any real users or money)**
1. Author and deploy `firestore.rules` (SEC-02); add role checks to both dashboards (SEC-01).
2. Replace the fake payment flow with a real gateway + server-side confirmation (STU-01, SEC-03).
3. Move wallet balance and application-status mutations to a trusted backend using transactions (STU-04, TCH-05-related wallet race).
4. Build or remove the tutor-verification claim (SEC-14/BIZ-01); gate tutor visibility on approval.
5. Implement password reset (SEC-06).

**Phase 2 — Core Journey Completion**
6. Fix the tutor email data-loss bug (TCH-01).
7. Wire up Demo Class Booking end-to-end (TCH-03).
8. Add a negotiation reject/decline path (STU-02).
9. Fix the multi-child application-attribution bug (STU-03).
10. Build a minimal Notifications system (async alerts for offers/counters/payments).
11. Add basic manual search/filtering for tutors and students.
12. Enforce required-field validation on the Demo form and TeacherForm (MKT-01, MKT-02, TCH-05, TCH-06).
13. Persist landing-page demo submissions immediately, not only after signup completes (MKT-03).

**Phase 3 — Data Integrity & Error Handling**
14. Add loading/error UI states across both dashboards (STU-05, TCH-16).
15. Fix silent failures to surface user-visible errors (STU-07, TCH-10, MKT-06).
16. Add submit-guards against duplicate submissions (STU-15, TCH-04).
17. Fix the Firestore 10-item `in`-query cap (STU-08) and the localStorage/sessionStorage cleanup bug (MKT-05).
18. Tighten UPI ID, counter-offer, and budget field validation (STU-06, STU-19, MKT-14).

**Phase 4 — Code Quality & DevOps**
19. Remove dead Supabase SQL files and stray developer scripts (BE-01, BE-06).
20. Add automated test coverage (BE-02).
21. Deduplicate the student/teacher dashboard logic into shared hooks (TCH-15).
22. Resolve the `@ts-nocheck` blanket across the UI component library (BE-07).
23. Clean up dead code, unused imports, and unused components across both dashboards and the landing page (STU-16-18, TCH-11, TCH-17, MKT-07, MKT-08).
24. Document required environment variables and firm up the Netlify deploy config (BE-03, BE-04).

**Phase 5 — Accessibility, SEO & Polish**
25. Add `aria-label`s to all icon-only buttons and social links (STU-21, MKT-09, MKT-10).
26. Add Escape-to-close/focus-trapping to all modals (STU-22).
27. Fix anchor-scroll offset under the fixed header (MKT-04).
28. Add `/signup` to the sitemap and fix `lastModified` values (MKT-11, MKT-19).
29. Replace stock-photo testimonials with real, disclosed customer content (MKT-18).
30. Add custom 404/error/loading pages (BE-09) and wire up or remove the dead dark-mode CSS (BE-10).
