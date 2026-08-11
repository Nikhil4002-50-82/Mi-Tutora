# Migration to Firebase Cloud Functions

This document outlines the architectural changes needed to move manual, client-side database logic to secure, automated Firebase Cloud Functions (Firestore Triggers).

## 1. Group to Tuition Request Synchronization (AUD-005)
**Current State:** 
When a parent groups students or removes a learner, the frontend manually calls `syncTuitionRequestForGroup()` in `groupUtils.ts`. This client-side helper reads all students in the group, calculates combined budgets/subjects, and creates/updates a `tuition_requests` document.

**The Problem:**
- **Fragility:** If the user's browser closes before the request completes, the `groups` collection and `tuition_requests` collection permanently fall out of sync.
- **Security:** Requires giving the frontend write access to both collections.

**Cloud Function Solution:**
Write an `onDocumentWritten('groups/{groupId}')` and `onDocumentWritten('students/{studentId}')` trigger. The backend will automatically listen for any changes to a group or its students, calculate the combined requirements, and upsert the `tuition_requests` document. This guarantees 100% synchronization consistency without relying on the client's network connection.

## 2. Cascading User Deletion (Task 4)
**Current State:** 
When a user clicks "Delete Account" in the dashboard, the client-side code manually iterates through their `roles` array and attempts to delete their profile documents from the `parents` or `tutors` collections, followed by deleting the `users` document and their Firebase Auth identity.

**The Problem:**
- **Incomplete Deletion:** If the client connection drops halfway, the database is left with orphaned profile documents (like a `parents` document with no matching Auth identity).
- **Scalability:** As the app grows (e.g., adding a `payments` or `messages` collection), the frontend must be constantly updated to manually delete from every new collection.

**Cloud Function Solution:**
Write an `onDocumentDeleted('users/{userId}')` trigger or an Auth `onUserDeleted` trigger. When a user deletes their account, the backend function will systematically sweep the database and delete all associated `parents`, `tutors`, `groups`, `students`, and `referrals` documents. This makes deletion atomic and perfectly clean every time.
