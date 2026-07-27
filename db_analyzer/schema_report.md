# Firestore Database Schema Report

Generated on: 2026-07-27T10:46:47.789Z

## Collection: `admin_activity`
*Documents sampled: 2*

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
*Documents sampled: 3*

| Field Path | Data Type |
|---|---|
| `absoluteMax` | `number` |
| `absoluteMin` | `number` |
| `category` | `string` |
| `createdAt` | `number` |
| `currentOffer` | `number` |
| `declinedAt` | `number` |
| `demoDate` | `string` |
| `demoHours` | `string` |
| `demoPaymentPaid` | `boolean` |
| `demoTime` | `string` |
| `finalPrice` | `number` |
| `groupId` | `string` |
| `initialBudget` | `number` |
| `initiator` | `string` |
| `lastUpdatedBy` | `string` |
| `parentId` | `string` |
| `proposedDate` | `string` |
| `proposedTime` | `string` |
| `reason` | `string` |
| `requestId` | `string` |
| `source` | `string` |
| `status` | `string` |
| `studentId` | `string` |
| `studentIds` | `array of string` |
| `studentName` | `string` |
| `tutorId` | `string` |
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
| `latestVersionName` | `string` |
| `maintenanceMessage` | `string` |
| `maintenanceMode` | `boolean` |
| `maintenanceTitle` | `string` |
| `minSupportedVersionCode` | `number` |
| `recommendedVersionCode` | `number` |
| `updatedAt` | `timestamp` |
| `updatedBy` | `string` |

---

## Collection: `groups`
*Documents sampled: 5*

| Field Path | Data Type |
|---|---|
| `addressFlat` | `string` |
| `addressPincode` | `string` |
| `addressStreet` | `string` |
| `area` | `string` |
| `city` | `string` |
| `createdAt` | `number` |
| `daysPerWeek` | `string` |
| `id` | `string` |
| `latitude` | `null | number` |
| `longitude` | `null | number` |
| `mode` | `string` |
| `parentId` | `string` |
| `preferredTimeRange` | `string` |
| `specificDays` | `array of string` |
| `status` | `string` |
| `studentIds` | `array of string` |
| `teacherGenderPreference` | `string` |
| `updatedAt` | `number` |

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
*Documents sampled: 6*

| Field Path | Data Type |
|---|---|
| `email` | `string` |
| `id` | `string` |
| `name` | `string` |
| `phone` | `string` |
| `whatsapp` | `string` |

---

## Collection: `referrals`
*Documents sampled: 4*

| Field Path | Data Type |
|---|---|
| `createdAt` | `number` |
| `estimatedReward` | `number` |
| `referralCode` | `string` |
| `referralType` | `string` |
| `referredUserId` | `string` |
| `referredUserName` | `string` |
| `referrerId` | `string` |
| `referrerName` | `string` |
| `status` | `string` |

---

## Collection: `students`
*Documents sampled: 20*

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
| `groupId` | `string` |
| `guardianName` | `string` |
| `id` | `string` |
| `languages` | `array | array of string` |
| `learningGoal` | `string` |
| `name` | `string` |
| `parentId` | `string` |
| `pendingRequests` | `array of string | array` |
| `phoneNumber` | `string` |
| `specialRequirements` | `string` |
| `studentType` | `string` |
| `subjects` | `array of string | array` |
| `technologies` | `array | array of string` |
| `whatsappNumber` | `string` |

---

## Collection: `tuition_requests`
*Documents sampled: 7*

| Field Path | Data Type |
|---|---|
| `acceptedTutorId` | `string` |
| `area` | `string` |
| `category` | `string` |
| `city` | `string` |
| `combinedBudget` | `number` |
| `combinedLanguages` | `array` |
| `combinedSubjects` | `array | array of string` |
| `combinedTechnologies` | `array of string | array` |
| `createdAt` | `number` |
| `daysPerWeek` | `string` |
| `groupId` | `string` |
| `id` | `string` |
| `latitude` | `null` |
| `longitude` | `null` |
| `mode` | `string` |
| `parentId` | `string` |
| `preferredTimeRange` | `string` |
| `specificDays` | `array of string` |
| `status` | `string` |
| `studentId` | `string` |
| `studentsDetails` | `array of object` |
| `studentsDetails[].board` | `string` |
| `studentsDetails[].budget` | `number` |
| `studentsDetails[].classLevel` | `string` |
| `studentsDetails[].id` | `string` |
| `studentsDetails[].languages` | `array` |
| `studentsDetails[].name` | `string` |
| `studentsDetails[].subjects` | `array | array of string` |
| `studentsDetails[].technologies` | `array of string | array` |
| `teacherGenderPreference` | `string` |

---

## Collection: `tutors`
*Documents sampled: 9*

| Field Path | Data Type |
|---|---|
| `accountStatus` | `string` |
| `address` | `string` |
| `area` | `string` |
| `boards` | `array of string` |
| `category` | `string` |
| `city` | `string` |
| `classes` | `array of string` |
| `email` | `string` |
| `experience` | `string` |
| `feeRange` | `string` |
| `gender` | `string` |
| `hasProfile` | `boolean` |
| `id` | `string` |
| `knownLanguages` | `array` |
| `languagesTaught` | `array` |
| `latitude` | `number` |
| `longitude` | `number` |
| `mode` | `string` |
| `name` | `string` |
| `occupation` | `string` |
| `pendingRequests` | `array | array of string` |
| `phone` | `string` |
| `preferredLocations` | `string` |
| `preferredTimeRange` | `string` |
| `price` | `number` |
| `qualification` | `string` |
| `rating` | `number` |
| `role` | `string` |
| `schoolNames` | `string` |
| `studentCount` | `string` |
| `subjects` | `array of string` |
| `teachingApproach` | `string` |
| `technologies` | `array` |
| `travelDistance` | `string` |
| `verificationStatus` | `string` |
| `whatsapp` | `string` |

---

## Collection: `users`
*Documents sampled: 18*

| Field Path | Data Type |
|---|---|
| `email` | `string` |
| `fcmToken` | `string` |
| `hasProfile` | `boolean` |
| `id` | `string` |
| `name` | `string` |
| `referralCode` | `string` |
| `referredBy` | `string` |
| `role` | `string` |
| `walletBalance` | `number` |

---

