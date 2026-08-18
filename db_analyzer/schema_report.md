# Firestore Database Schema Report

Generated on: 2026-08-18T11:51:12.461Z

## Collection: `admin_activity`
*Documents sampled: 6*

| Field Path | Data Type |
|---|---|
| `adminEmail` | `string` |
| `adminUid` | `string` |
| `entityId` | `string` |
| `entityName` | `string` |
| `entityType` | `string` |
| `message` | `string` |
| `timestamp` | `timestamp` |
| `type` | `string` |

---

## Collection: `applications`
*Documents sampled: 2*

| Field Path | Data Type |
|---|---|
| `absoluteMax` | `number` |
| `absoluteMin` | `number` |
| `applicationId` | `string` |
| `category` | `string` |
| `createdAt` | `number` |
| `currentOffer` | `number` |
| `declinedAt` | `number` |
| `demoDate` | `string` |
| `demoHours` | `string` |
| `demoPaymentPaid` | `boolean` |
| `demoTime` | `string` |
| `finalPrice` | `number` |
| `groupDocId` | `string` |
| `initialBudget` | `number` |
| `initiator` | `string` |
| `lastUpdatedBy` | `string` |
| `mode` | `string` |
| `parentDocId` | `string` |
| `proposedDate` | `string` |
| `proposedTime` | `string` |
| `requestDocId` | `string` |
| `source` | `string` |
| `status` | `string` |
| `studentDocId` | `string` |
| `studentDocIds` | `array of string` |
| `studentName` | `string` |
| `tutorDocId` | `string` |
| `tutorName` | `string` |
| `updatedAt` | `number` |

---

## Collection: `global_config`
*Documents sampled: 1*

| Field Path | Data Type |
|---|---|
| `appEnabled` | `boolean` |
| `disabledMessage` | `string` |
| `disabledTitle` | `string` |
| `internationalLeadsEnabled` | `boolean` |
| `latestVersionName` | `string` |
| `maintenanceMessage` | `string` |
| `maintenanceMode` | `boolean` |
| `maintenanceTitle` | `string` |
| `marketplaceEnabled` | `boolean` |
| `minSupportedVersionCode` | `number` |
| `paymentsEnabled` | `boolean` |
| `recommendationsEnabled` | `boolean` |
| `recommendedVersionCode` | `number` |
| `referralsEnabled` | `boolean` |
| `reportsEnabled` | `boolean` |
| `updatedAt` | `timestamp` |
| `updatedBy` | `string` |
| `verificationEnabled` | `boolean` |

---

## Collection: `groups`
*Documents sampled: 5*

| Field Path | Data Type |
|---|---|
| `area` | `string` |
| `city` | `string` |
| `createdAt` | `number` |
| `daysPerWeek` | `string` |
| `groupDocId` | `string` |
| `latitude` | `null` |
| `longitude` | `null` |
| `mode` | `string` |
| `parentDocId` | `string` |
| `preferredTimeRange` | `string` |
| `specificDays` | `array of string` |
| `status` | `string` |
| `studentDocIds` | `array of string` |
| `teacherGenderPreference` | `string` |

---

## Collection: `id_counters`
*Documents sampled: 5*

| Field Path | Data Type |
|---|---|
| `lastValue` | `number` |

---

## Collection: `marketplace_pricing`
*Documents sampled: 27*

| Field Path | Data Type |
|---|---|
| `currency` | `string` |
| `displayName` | `string` |
| `enabled` | `boolean` |
| `price` | `number` |
| `updatedAt` | `timestamp` |
| `updatedBy` | `string` |

---

## Collection: `parents`
*Documents sampled: 2*

| Field Path | Data Type |
|---|---|
| `authUid` | `string` |
| `dailyUsage` | `object` |
| `dailyUsage.count` | `number` |
| `dailyUsage.date` | `string` |
| `email` | `string` |
| `name` | `string` |
| `parentDocId` | `string` |
| `parentId` | `string` |
| `phone` | `string` |
| `whatsapp` | `string` |

---

## Collection: `students`
*Documents sampled: 7*

| Field Path | Data Type |
|---|---|
| `board` | `string` |
| `budget` | `number` |
| `category` | `string` |
| `classLevel` | `string` |
| `createdAt` | `number` |
| `dob` | `string` |
| `email` | `string` |
| `gender` | `string` |
| `groupDocId` | `string` |
| `guardianName` | `string` |
| `id` | `string` |
| `isAvailable` | `boolean` |
| `languages` | `array` |
| `name` | `string` |
| `parentDocId` | `string` |
| `pendingRequests` | `array` |
| `phoneNumber` | `string` |
| `studentType` | `string` |
| `subjects` | `array of string` |
| `technologies` | `array` |
| `whatsappNumber` | `string` |

---

## Collection: `tuition_requests`
*Documents sampled: 5*

| Field Path | Data Type |
|---|---|
| `acceptedTutorId` | `string` |
| `area` | `string` |
| `category` | `string` |
| `city` | `string` |
| `combinedBudget` | `number` |
| `combinedLanguages` | `array` |
| `combinedSubjects` | `array of string` |
| `combinedTechnologies` | `array` |
| `createdAt` | `number` |
| `daysPerWeek` | `string` |
| `groupDocId` | `string` |
| `groupId` | `string` |
| `latitude` | `null` |
| `longitude` | `null` |
| `mode` | `string` |
| `parentDocId` | `string` |
| `parentId` | `string` |
| `preferredTimeRange` | `string` |
| `requestId` | `string` |
| `specificDays` | `array of string` |
| `status` | `string` |
| `studentsDetails` | `array of object` |
| `studentsDetails[].board` | `string` |
| `studentsDetails[].budget` | `number` |
| `studentsDetails[].classLevel` | `string` |
| `studentsDetails[].id` | `string` |
| `studentsDetails[].languages` | `array` |
| `studentsDetails[].name` | `string` |
| `studentsDetails[].subjects` | `array of string` |
| `studentsDetails[].technologies` | `array` |
| `teacherGenderPreference` | `string` |

---

## Collection: `tutors`
*Documents sampled: 3*

| Field Path | Data Type |
|---|---|
| `address` | `string` |
| `area` | `string` |
| `authUid` | `string` |
| `boards` | `array of string` |
| `category` | `string` |
| `city` | `string` |
| `classes` | `array of string` |
| `createdAt` | `number` |
| `dailyUsage` | `object` |
| `dailyUsage.count` | `number` |
| `dailyUsage.date` | `string` |
| `email` | `string` |
| `experience` | `string` |
| `feeRange` | `string` |
| `gender` | `string` |
| `hasProfile` | `boolean` |
| `knownLanguages` | `array` |
| `languagesTaught` | `array` |
| `latitude` | `number` |
| `longitude` | `number` |
| `mode` | `string` |
| `name` | `string` |
| `occupation` | `string` |
| `pendingRequests` | `array` |
| `phone` | `string` |
| `preferredLocations` | `string` |
| `preferredTimeRange` | `string` |
| `price` | `number` |
| `qualification` | `string` |
| `rating` | `number` |
| `schoolNames` | `string` |
| `studentCount` | `string` |
| `subjects` | `array of string` |
| `subscriptionPlan` | `string` |
| `teachingApproach` | `string` |
| `technologies` | `array` |
| `travelDistance` | `string` |
| `tutorId` | `string` |
| `weeklyQuota` | `object` |
| `weeklyQuota.tokensUsed` | `number` |
| `weeklyQuota.weekStartDate` | `string` |
| `whatsapp` | `string` |

---

## Collection: `users`
*Documents sampled: 5*

| Field Path | Data Type |
|---|---|
| `dismissedNotifications` | `array of string` |
| `email` | `string` |
| `hasProfile` | `boolean` |
| `id` | `string` |
| `name` | `string` |
| `referralCode` | `string` |
| `referredBy` | `string` |
| `role` | `string` |
| `roles` | `array of string` |

---

