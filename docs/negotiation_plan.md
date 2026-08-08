# Implementation Plan: Initiator-Based Anchor Negotiation

This plan outlines how to completely implement the "Initiator-Based Anchor" logic across both the Student and Teacher portals. **No new collections will be created**, and no existing collections will be altered. We will strictly use the existing `applications` collection and dynamically populate the limits during document creation.

## 1. Document Data Model Strategy (Firestore `applications` collection)
We will continue using the existing document structure but change how we populate three key fields upon creation:
*   `initialBudget`: Will now act as the **Anchor Value** (Teacher's Price if Student initiates, or Student's Budget if Teacher initiates).
*   `absoluteMin`: The mathematically calculated Hard Floor.
*   `absoluteMax`: The mathematically calculated Hard Ceiling.
*   `initiator`: A new string property (`'student'` or `'teacher'`) added to the document to track who started the negotiation.

## 2. Student Portal Updates (`student/page.tsx`)

### A. Creating an Initial Offer (`handleRequestTutor`)
*   Calculate `tutorPrice` = `getTutorBasePrice(tutor)`.
*   **Validation:** Block if the student's `offerPrice` is $< 60\%$ of `tutorPrice`, or $> 100\%$ of `tutorPrice`.
*   **Firestore Save:**
    *   `initialBudget: tutorPrice`
    *   `absoluteMin: Math.ceil(tutorPrice * 0.6)`
    *   `absoluteMax: tutorPrice`
    *   `initiator: 'student'`

### B. Soft Warning (UI)
*   Inside the View Modal where the student enters their offer, add a dynamic text warning that appears if their typed offer is between $60\%$ and $70\%$ of the `tutorPrice`. 

### C. Counter Offers (`handleNegotiationAction`)
*   Remove the old logic that blocks students based on `neg.currentOffer`.
*   **New Validation:** Simply check that `newOffer` is $\ge$ `neg.absoluteMin` and $\le$ `neg.absoluteMax`. This ensures the mathematical rules set at creation are always respected.

## 3. Teacher Portal Updates (`teacher/page.tsx`)

### A. Creating an Initial Offer (`handleSendOffer`)
*   Anchor is the `student.budget`.
*   **Validation:** Block if the teacher's `offerPrice` is $< 100\%$ of `student.budget`, or $> 140\%$ of `student.budget`.
*   **Firestore Save:**
    *   `initialBudget: student.budget`
    *   `absoluteMin: student.budget`
    *   `absoluteMax: Math.floor(student.budget * 1.4)`
    *   `initiator: 'teacher'`

### B. Soft Warning (UI)
*   Inside the New Tuitions modal, add a dynamic text warning if the teacher's typed offer is between $130\%$ and $140\%$ of the student's budget.

### C. Counter Offers (`handleNegotiationAction`)
*   Remove the old logic that blocks teachers based on `neg.currentOffer`.
*   **New Validation:** Simply check that `newOffer` is $\ge$ `neg.absoluteMin` and $\le$ `neg.absoluteMax`.

## Verification Plan
After writing the code, we will perform the following verifications:
1.  **Student Flow**: Attempt to lowball a teacher below 60%. Attempt to trigger the 60-70% warning. Ensure the Counter Offer UI uses the correct min/max bounds.
2.  **Teacher Flow**: Attempt to upsell a student above 140%. Attempt to trigger the 130-140% warning. Ensure the Counter Offer UI uses the correct min/max bounds.
