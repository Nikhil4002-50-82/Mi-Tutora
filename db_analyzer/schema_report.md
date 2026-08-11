# Firestore Database Schema Report

Generated on: 2026-08-11T11:18:13.790Z

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
| `demoHours` | `string` |
| `finalPrice` | `number` |
| `groupDocId` | `string` |
| `initialBudget` | `number` |
| `initiator` | `string` |
| `lastUpdatedBy` | `string` |
| `mode` | `string` |
| `parentDocId` | `string` |
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
*Documents sampled: 19*

| Field Path | Data Type |
|---|---|
| `addressFlat` | `string` |
| `addressPincode` | `string` |
| `addressStreet` | `string` |
| `area` | `string` |
| `city` | `string` |
| `createdAt` | `number` |
| `daysPerWeek` | `string` |
| `groupDocId` | `string` |
| `groupId` | `string` |
| `latitude` | `null | number` |
| `longitude` | `null | number` |
| `mode` | `string` |
| `parentDocId` | `string` |
| `parentId` | `string` |
| `preferredTimeRange` | `string` |
| `specificDays` | `array of string | array` |
| `status` | `string` |
| `studentDocIds` | `array of string` |
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

## Collection: `notifications`
*Documents sampled: 1*

| Field Path | Data Type |
|---|---|
| `applicationId` | `string` |
| `createdAt` | `number` |
| `message` | `string` |
| `read` | `boolean` |
| `role` | `string` |
| `title` | `string` |
| `type` | `string` |
| `userId` | `string` |

---

## Collection: `parents`
*Documents sampled: 7*

| Field Path | Data Type |
|---|---|
| `authUid` | `string` |
| `email` | `string` |
| `name` | `string` |
| `parentDocId` | `string` |
| `parentId` | `string` |
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
*Documents sampled: 31*

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
| `groupId` | `string` |
| `guardianName` | `string` |
| `id` | `string` |
| `languages` | `array | array of string` |
| `learningGoal` | `string` |
| `name` | `string` |
| `parentDocId` | `string` |
| `parentId` | `string` |
| `pendingRequests` | `array of string | array` |
| `phoneNumber` | `string` |
| `specialRequirements` | `string` |
| `studentId` | `string` |
| `studentType` | `string` |
| `subjects` | `array of string | array` |
| `technologies` | `array | array of string` |
| `whatsappNumber` | `string` |

---

## Collection: `tuition_requests`
*Documents sampled: 1*

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
| `latitude` | `null` |
| `longitude` | `null` |
| `mode` | `string` |
| `parentDocId` | `string` |
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
*Documents sampled: 13*

| Field Path | Data Type |
|---|---|
| `accountStatus` | `string` |
| `address` | `string` |
| `area` | `string` |
| `authUid` | `string` |
| `boards` | `array of string | array` |
| `category` | `string` |
| `city` | `string` |
| `classes` | `array of string | array` |
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
| `pendingRequests` | `array of string` |
| `phone` | `string` |
| `preferredLocations` | `string` |
| `preferredTimeRange` | `string` |
| `price` | `number` |
| `qualification` | `string` |
| `rating` | `number` |
| `role` | `string` |
| `schoolNames` | `string` |
| `studentCount` | `string` |
| `subjects` | `array of string | array` |
| `teachingApproach` | `string` |
| `technologies` | `array | array of string` |
| `travelDistance` | `string` |
| `tutorId` | `string` |
| `verificationStatus` | `string` |
| `whatsapp` | `string` |

---

## Collection: `users`
*Documents sampled: 16*

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
| `roles` | `array of string` |
| `walletBalance` | `number` |

---

