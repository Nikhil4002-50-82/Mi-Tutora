# Database Schema Updates

This document tracks schema additions and modifications that build upon the original `DATABASE_ARCHITECTURE.pdf`.

## 1. `applications` Collection
**Purpose:** Stores negotiation states between parents and tutors.

### New Fields Added
*   `declinedAt` (number): A timestamp stored when an offer is declined by either party. Used to enforce the 7-day cooldown period.
*   `absoluteMin` (number): The absolute minimum value the price can be negotiated down to. This is calculated and locked in when the application is first created based on the initial base price (40% rule).
*   `absoluteMax` (number): The absolute maximum value the price can be negotiated up to. This is calculated and locked in when the application is first created based on the initial base price (20% rule).

## 2. `students` Collection (Upcoming for Task 3)
**Purpose:** Stores individual student profiles under a parent.

### Planned Fields
*   `groupId` (string): A unique identifier linking multiple students into a single group. 
    *   **Logic:** This field will *never* be null. If a student is an "individual" (not grouped with siblings), they will simply have a unique `groupId` generated just for them. This simplifies the backend, as all negotiations can strictly target a `groupId` (where a group size can be 1 or more).

## 3. `groups` Collection (Upcoming Idea for Task 3)
*(Optional, but recommended for clean architecture)*
**Purpose:** To store metadata about a specific group of students.
*   `id` (string): Matches the `groupId` in the student profiles.
*   `parentId` (string): The parent who owns this group.
*   `name` (string): e.g., "Group 1" or "Math Study Group".
*   `studentIds` (array of strings): Easy reference to all students in the group.

## 4. Pending Request Limits (Queue Arrays)
**Purpose:** Enforce limits on how many pending requests a student or tutor can have at one time.

### `tutors` Collection New Fields
*   `pendingRequests` (array of strings): Stores the `applicationId` of all currently pending requests for this tutor. Max limit is 5, or 15 if subscribed. When the queue is full, the teacher is marked as "Locked / Unavailable".
*   `isSubscribed` (boolean): Whether the tutor has an active premium subscription (increases limit to 15).

### `students` Collection New Fields
*   `pendingRequests` (array of strings): Stores the `applicationId` of all currently pending requests for this student. Max limit is 5. When the queue is full, the student is marked as "Locked / Unavailable" to teachers.

## 5. Group Preferences Refactor (Task 4 & 5)
**Purpose:** Move tuition preferences from the parent/global level down to the group level, so different groups can have different modes, timings, and teacher preferences.

### `parents` Collection Modifications
*   **Removed:** `preferredMode`, `address`. These are no longer global settings.

### `students` Collection Modifications
*   **Added:** `category` (string). Category is now tracked per-student rather than globally, enabling strict grouping rules.
*   **Removed:** `preferredMode`, `address`, `hoursPerDay`, `daysPerWeek`, `specificDays`. These have moved to `tuition_requests`.

### `tuition_requests` Collection Modifications
*   **Purpose Expansion:** Now acts as the primary "Group Preferences" settings profile for a given `groupId`.
*   **Added:** `teacherGenderPreference` (string): e.g., 'Male', 'Female', 'No Preference'.
*   **Managed Fields:** `mode` (Online/Offline), `area`, `city`, `preferredTimeRange`, `daysPerWeek`, `specificDays` are all now definitively scoped to the group via this document.
