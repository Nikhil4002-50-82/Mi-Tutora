# MiTutora Authentication Architecture

## 1. Core Provider
MiTutora uses **Firebase Authentication** as its primary identity provider, supporting both traditional **Email/Password** and **Google OAuth**.

## 2. The Multi-Role System (Unified Identity)
Unlike many platforms where a user must create separate accounts with different emails to be both a teacher and a student, MiTutora uses a **Unified Multi-Role Identity System**.
- A user signs up with a single email address.
- The active role for their current session is determined by the URL parameter (e.g., `?role=teacher` vs `?role=student`).
- If a student decides they also want to teach, they simply log into the Teacher portal with their existing student email. The system detects this, automatically appends `'teacher'` to their `roles` array in the database, and provisions a Teacher profile for them without forcing a re-signup.

## 3. Database Topology
When a new user successfully authenticates, their data is split across specialized collections:
1. **`users` (Central Hub):** Stores the universal identity (`uid`, `email`, `roles: ['student', 'teacher']`, and referral tracking).
2. **`parents` / `tutors` (Specialized Nodes):** Depending on the role they signed up for, a specialized document is created to track role-specific data (like quotas, teacher categories, or student profiles). These are given human-readable IDs (e.g., `MTPxxxx` for parents, `MTTxxxx` for teachers).

## 4. Email & Password Flow
1. User enters Email and Password on `signup/page.tsx`.
2. `createUserWithEmailAndPassword` is called.
3. The system executes database writes. **(Safety Mechanism: If the database write fails, the system automatically deletes the newly created Firebase Auth user to prevent "ghost accounts").**
4. The system sends an **Email Verification** link and forces the user to sign out.
5. The user cannot access the dashboard until they click the verification link.

## 5. Google OAuth Flow (The "Post-Auth Intercept")
The Google flow is highly optimized and unified across both the `login` and `signup` pages to prevent user error.
1. User clicks "Continue with Google".
2. Google authenticates them instantly.
3. The system checks the `users` collection to see if their `uid` already exists.
   - **If they exist:** The system silently logs them in (and updates their `roles` array if they are accessing a new portal).
   - **If they are new:** The system pauses the signup, triggers a **Referral Modal**, captures their referral code (or skips), writes the referral logic to the database, and then provisions their account.

## 6. Session Persistence & Protection
- **Local Cache:** The active session and current role are temporarily stored in `localStorage` (`user`) so the frontend can route them instantly without waiting for network calls.
- **True Authentication:** Access to the actual dashboard data (`dashboardApi.ts`) is strictly gated by `auth.onAuthStateChanged`. If a user manually edits their `localStorage` to spoof an identity, the backend queries will fail because Firebase rules enforce true authentication tokens.
