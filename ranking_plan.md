# Matchmaking & Ranking Architecture

This document outlines the complete theory and logic used for matchmaking and sorting users (Teachers vs. Student Groups) on the platform. The platform handles user discovery through two distinct tabs: **Recommended** and **All**.

---

## 1. The "Recommended" Tab (Strict Matchmaking)
The **Recommended** tab is designed as a strict filtering system. Its goal is to only show options that perfectly meet the non-negotiable baseline requirements of a user. If a teacher or student group fails to meet even one of these criteria, they are completely hidden from this tab.

### Strict Filtering Criteria:
For a match to appear in the Recommended tab, the following conditions must be met:

1. **Category Match**: 
   - The primary category (e.g., `school`, `programming`, `languages`) must match exactly.
2. **Board Match**:
   - If the category is `school`, the student group's Board (e.g., CBSE, ICSE, State) must be explicitly listed in the teacher's taught boards.
3. **Class/Grade Match**:
   - If the category is `school`, the student group's Class (e.g., Class 10, Class 12) must be explicitly listed in the teacher's taught classes.
4. **Gender Preference Match**:
   - If a student group has explicitly set a Teacher Gender Preference (`Male` or `Female`), the platform strictly enforces this. 
   - If a group prefers "Male", only Male teachers are shown.
   - If a group has "No Preference", both genders are shown.
   - Teachers, in turn, will only see groups that match their gender or have "No Preference".
5. **Subject / Technology / Language Match**:
   - The teacher must explicitly offer **ALL** of the specific subjects (e.g., Mathematics, Science), technologies (e.g., React, Node.js), or languages (e.g., French, Spanish) that the student group requires. If even one required subject is missing from the teacher's profile, they are filtered out of the Recommended tab.

*If a match survives these strict filters, it is then sorted using the Point-Based Ranking System (below).*

---

## 2. The "All" Tab (Open Marketplace)
The **All** tab acts as an open marketplace. Unlike the Recommended tab, **no one is strictly filtered out or hidden** (except for completely incompatible categories). 

Instead of hiding people, the All tab relies entirely on the **Point-Based Ranking System** to push the most relevant and suitable matches to the very top, while pushing the least relevant matches to the bottom.

---

## 3. The Point-Based Ranking System (Match Score)
Whenever a list of teachers or groups is displayed, the platform calculates a `suitabilityScore` for every possible pairing. The lists in both the "Recommended" and "All" tabs are sorted by this score in descending order (highest score first).

### Scoring Logic:
- **Subject / Technology / Language Overlap (+50 points per match)**
  - For every specific subject (e.g., "Mathematics"), technology (e.g., "React"), or language (e.g., "French") that a student group needs and a teacher offers, **50 points** are awarded. 
  - *Example: If a group needs Math and Science, and the teacher teaches both, they receive 100 points.*
- **Class / Grade Match (+30 points)**
  - If the class/grade level matches exactly between the student and teacher, **30 points** are awarded.
- **Board Match (+20 points)**
  - If the educational board matches exactly, **20 points** are awarded.
- **Budget Proximity Match (Sliding Scale: +0 to +30 points)**
  - Points are awarded on a continuous sliding scale based on the exact mathematical percentage difference between the student's proposed budget and the teacher's requested fee.
  - **Exact Match (0% diff)**: +30 points.
  - **10% Difference**: +27 points.
  - **50% Difference**: +15 points.
  - **100%+ Difference (e.g., 6k vs 20k)**: +0 points.
  - Formula: `max(0, 30 - (percentageDifference * 30))`

### Sorting Priority:
1. **Status**: Users who have an active negotiation, pending demo, or pending request with the user are mathematically forced to the top of the list (awarded artificial +1000 points in the sorting algorithm). Locked/Declined users are forced to the bottom (-1000 points).
2. **Suitability Score (Primary Sort)**: All standard, available users are then sorted purely based on their calculated Point Score (Subjects + Class + Board + Budget Proximity).
3. **Absolute Budget Difference (Secondary Sort / Tie-Breaker)**: If two matches have the exact same Suitability Score, they are secondarily sorted by the absolute mathematical difference between their budgets in ascending order (closest budget on top).
