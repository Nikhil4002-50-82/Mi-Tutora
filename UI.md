# UI Improvements & Bug Fixes — Implementation Plan

Six targeted changes across the student and teacher portals. No backend changes, no new DB fields, no design rework — pure UI fixes and additions.

---

## Change 1 — Group Details Modal Title Fix (Student Portal)

#### [MODIFY] [student/page.tsx](file:///C:/Users/Dell/Desktop/mushi/web/src/app/dashboard/student/page.tsx) ~L3175

**Problem:** Title says `"Group 1: Student Details"` and subtitle says `"Group: Group: Nikhil R Nambiar, Abhilash V"` (double "Group:" and the word "Student Details" is redundant).

**Fix:**
- **Title** → `"Group 1: Nikhil R Nambiar, Abhilash V"` (use the student names directly, not generic "Student Details")
- **Subtitle** → `"ID: MTGxxxxx"` (the human-readable `groupId` from the groups collection)

**Data available:** The `group` object passed to `setViewingGroupDetails({ ...group, index: idx + 1 })` in `TuitionGroupCard.tsx` already contains all fields from the `studentGroups` array. The `groupId` (MTG...) field lives on the matching `groups` collection doc (`data?.groups`), so we look it up via `data?.groups?.find(g => g.id === viewingGroupDetails.id)?.groupId`.

```
// Before:
Title:    "Group 1: Student Details (ID: MTG...)"  ← messy
Subtitle: "Group: Group: Nikhil R Nambiar, Abhilash V"  ← double prefix

// After:
Title:    "Group 1: Nikhil R Nambiar, Abhilash V"
Subtitle: "ID: MTG00001" (from groups collection), or just blank if not found
```

---

## Change 2 — Student ID Next to Name in Teacher's Student View Modal

#### [MODIFY] [StudentViewModal.tsx](file:///C:/Users/Dell/Desktop/mushi/web/src/components/dashboard/StudentViewModal.tsx) ~L112

**Problem:** In the teacher portal, when a teacher views a student's details, each student card shows name + category but no student ID. The user wants `studentId` (e.g. `MTSMA0H7X`) next to the name — exactly matching the format already used in the student portal's group detail modal.

**Data available:** The `studentDetail` object in the `.map()` loop (L110) already has `studentId` on it (confirmed by L3191 in student/page.tsx where same pattern is used: `{s.studentId && <p>ID: {s.studentId}</p>}`).

**Fix:** Add one line below the student name in the teacher's StudentViewModal student card:
```jsx
// After the <h4> with name:
{studentDetail.studentId && (
  <p className="text-xs text-slate-500 font-mono font-bold mb-3 uppercase tracking-wider">
    ID: {studentDetail.studentId}
  </p>
)}
```

---

## Change 3 — Demo Classes "View Details" Contact Bug Fix (Teacher Portal)

#### [MODIFY] [teacher/page.tsx](file:///C:/Users/Dell/Desktop/mushi/web/src/app/dashboard/teacher/page.tsx) ~L1971

**Problem:** When a teacher clicks "View Details" on a demo class card (Requests & Demo tab, L1968–1984), the `selectedViewApp` is set to `cls` (the demo class object), NOT the actual `application` object. The `StudentViewModal` gate at L75 checks `selectedViewApp.status` against: `['demo_booking_phase', 'demo_scheduled', 'waiting_for_parent_decision', 'demo_booked', 'tuition_started', 'confirmed', 'accepted']`.

The demo class `cls` object has `cls.status = 'demo_scheduled'` (correct), BUT `cls.app` holds the full application. When we do `setSelectedViewApp(cls)`, the modal checks `selectedViewApp.status` which is `cls.status` — **that is actually correct**. So why do contact details still hide?

Looking more carefully: `cls.studentDetails` is built from the `availableStudentsRaw` which is student-level data. The contact fields (`phoneNumber`, `whatsappNumber`) live on the `students` collection. But when `cls.studentDetails` is null for some demo cards, a fallback stub is built (L1971–1977) with no contact info — **and that fallback stub has no phone/email data at all**.

**Root cause:** When `cls.studentDetails` is falsy (i.e. the student enrichment didn't attach), the fallback object `{ id: cls.id, name: cls.student, students: cls.app?.studentsList || [] }` is used. The `app.studentsList` may exist but only has basic name data, not phone/email.

**Fix:** Pass `cls.app` as the selectedViewApp (which has the full `status` field needed for the gate), and ensure `selectedViewUser` includes the parent contact from `cls.app.parentContact` or similar. The simplest fix: when building the fallback `viewUser`, also spread `cls.app?.parentContact` so contacts are available:
```javascript
// Before:
const viewUser = cls.studentDetails || { 
  id: cls.id, 
  name: cls.student || 'Group', 
  students: cls.app?.studentsList || [], 
  ...
};
setSelectedViewApp(cls);

// After:
const viewUser = cls.studentDetails || { 
  id: cls.id, 
  name: cls.student || 'Group', 
  students: cls.app?.studentsList || [], 
  phoneNumber: cls.app?.parentContact?.phone || '',
  email: cls.app?.parentContact?.email || '',
  budget: cls.app?.finalPrice || cls.app?.currentOffer || 0,
  preferredMode: cls.app?.preferredMode || 'Online'
};
setSelectedViewApp(cls.app || cls);  // ← ensure .status is the real app status
```

> [!NOTE]
> This is a data availability issue — if the contact fields are not stored in `cls.app`, they may still not show. But fixing the `setSelectedViewApp(cls.app || cls)` alone ensures the **status gate works correctly** and won't block contact display unnecessarily.

---

## Change 4 — Weekly Tokens Always Shows 0 (Bug Fix)

> [!CAUTION]
> Confirmed backend + frontend bug. Teachers always see 0/5 tokens used even after sending requests.

#### Root Cause — Wrong Collection

The bug is a **collection mismatch**. Here's the exact chain:

| Step | What happens | Collection |
|---|---|---|
| Teacher sends a request | `weeklyQuota` is written to | **`tutors`** collection |
| Dashboard loads | `userData` is read from | **`users`** collection |
| Teacher page reads tokens | `data?.userData?.weeklyQuota` | comes from **`users`** doc → **always `undefined`** → shows 0 |

The `tutors` doc (read as `tutorData` / `data.profile`) **has** the `weeklyQuota`. The `users` doc **does not**. They are separate Firestore collections.

Similarly, `subscriptionPlan` and `isSubscribed` are written to the `tutors` doc (confirmed at route.ts L755), so `isProPlan` is also always `false` for the same reason — even Pro teachers show as Basic!

#### Fix — Two locations, minimal change

**Fix A:** [dashboardApi.ts](file:///C:/Users/Dell/Desktop/mushi/web/src/api/dashboardApi.ts) ~L425 — In `baseData`, merge the quota-related fields from `tutorData` into `userData` so the teacher page can read them via the existing `data?.userData?.weeklyQuota` path:
```javascript
// In fetchTeacherDashboardData, before returning baseData:
userData = {
  ...userData,
  weeklyQuota: tutorData?.weeklyQuota,
  subscriptionPlan: tutorData?.subscriptionPlan,
  isSubscribed: tutorData?.isSubscribed
};
```

**Fix B (alternative, even simpler):** Change the 3 lines in [teacher/page.tsx](file:///C:/Users/Dell/Desktop/mushi/web/src/app/dashboard/teacher/page.tsx) L460-463 to read from `data?.profile` (which IS tutorData) instead of `data?.userData`:
```javascript
// Before (broken):
const isProPlan = data?.userData?.subscriptionPlan === 'pro' || data?.userData?.isSubscribed;
const isCurrentWeek = data?.userData?.weeklyQuota?.weekStartDate === currentWeekStart;
const tokensUsed = isCurrentWeek ? (data?.userData?.weeklyQuota?.tokensUsed || 0) : 0;

// After (correct):
const isProPlan = data?.profile?.subscriptionPlan === 'pro' || data?.profile?.isSubscribed;
const isCurrentWeek = data?.profile?.weeklyQuota?.weekStartDate === currentWeekStart;
const tokensUsed = isCurrentWeek ? (data?.profile?.weeklyQuota?.tokensUsed || 0) : 0;
```

**Fix B is cleaner** — one file, three lines, zero risk of affecting other code. `data.profile` is already the `tutorData` object returned from `deriveTeacherDashboardState` (confirmed at dashboardApi.ts L608: `profile: tutorData`).

---

## Change 5 — Student Dashboard: "Requests Left" + "Group Queue" Info Card

#### [MODIFY] [student/page.tsx](file:///C:/Users/Dell/Desktop/mushi/web/src/app/dashboard/student/page.tsx) ~L1197

**Location:** Next to the `ProfileCompletenessCard` in the top-right area of the Dashboard tab (L1197-1203). Add a new sibling card in the same `flex` container.

**Data needed:**
- **Requests left today**: The `parentData.dailyUsage` field. It's in the student dashboard state as `data?.profile?.dailyUsage`. If today's date matches `dailyUsage.date`, used = `dailyUsage.count`, else 0. Limit = 5.
- **Group queue status**: For each group, count `data?.applications?.filter(app => app.groupDocId === group.id && activeStatuses.includes(app.status)).length`. If ≥ 5, that group is "full" (can't send more).

**New card UI (inline, no new component file):**
```
┌──────────────────────────────┐
│ 📊 Request Activity           │
│ Requests today: 3 / 5         │
│ ▓▓▓░░ 2 remaining             │
│                               │
│ Group Queue:                  │
│ • Nikhil, Abhilash: 2/5       │
│ • Chinju: 0/5                 │
└──────────────────────────────┘
```
Small, clean card matching the style of `ProfileCompletenessCard`.

---

## Change 6 — Teacher Dashboard: "Weekly Tokens" Mini Card

#### [MODIFY] [teacher/page.tsx](file:///C:/Users/Dell/Desktop/mushi/web/src/app/dashboard/teacher/page.tsx) ~L990

**Location:** Below the "Hello [name]" section, in the same area where `EarningsWidget` and `ProfileCompletenessCard` sit (L990-1002). Add a third sibling card.

**Data needed:** Already computed — `tokensUsed`, `tokensRemaining`, `quotaLimit`, `isProPlan`.

**New card UI (inline, no new component file):**
```
┌──────────────────────────────┐
│ 🎟️ Weekly Tokens              │
│ Used: 3 / 5                   │
│ ▓▓▓░░ 2 left this week        │
│ [Basic Plan] → Upgrade        │
└──────────────────────────────┘
```

---

## Files Changed Summary

| File | Changes |
|---|---|
| `student/page.tsx` | Change 1 (group modal title), Change 5 (quota card) |
| `StudentViewModal.tsx` | Change 2 (studentId next to name) |
| `teacher/page.tsx` | Change 3 (demo view bug), Change 4 (fix weeklyQuota read source), Change 6 (token card) |

## Verification Plan

1. **Change 1:** Open Profile → click "View Details" on a group with 2+ students. Title = names, subtitle = MTG... ID.
2. **Change 2:** Teacher opens student view modal → see `ID: MTSXXXXX` below each student name.
3. **Change 3:** Teacher goes to Requests tab → demo class card → "View Details" → contact info should now be visible (phone/email).
4. **Change 5:** Student dashboard shows requests left today. After sending a request, count goes down.
5. **Change 6:** Teacher dashboard shows token card with current week's usage.
