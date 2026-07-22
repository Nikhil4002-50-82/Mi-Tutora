# Firestore Database Schema Report

Generated on: 2026-07-22T19:32:31.224Z

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
| `demoHours` | `string` |
| `finalPrice` | `number` |
| `groupId` | `string` |
| `initialBudget` | `number` |
| `lastUpdatedBy` | `string` |
| `mode` | `string` |
| `parentId` | `string` |
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
*Documents sampled: 4*

| Field Path | Data Type |
|---|---|
| `address` | `string` |
| `email` | `string` |
| `id` | `string` |
| `name` | `string` |
| `phone` | `string` |
| `preferredMode` | `string` |
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
*Documents sampled: 11*

| Field Path | Data Type |
|---|---|
| `address` | `string` |
| `board` | `string` |
| `budget` | `number` |
| `category` | `string` |
| `classLevel` | `string` |
| `createdAt` | `number` |
| `daysPerWeek` | `string` |
| `dob` | `string` |
| `email` | `string` |
| `gender` | `string` |
| `groupId` | `string` |
| `guardianName` | `string` |
| `hoursPerDay` | `string` |
| `id` | `string` |
| `languages` | `array` |
| `learningGoal` | `string` |
| `name` | `string` |
| `parentId` | `string` |
| `phoneNumber` | `string` |
| `preferredMode` | `string` |
| `specialRequirements` | `string` |
| `specificDays` | `array of string` |
| `studentType` | `string` |
| `subjects` | `array of string` |
| `technologies` | `array` |
| `whatsappNumber` | `string` |

---

## Collection: `tuition_requests`
*Documents sampled: 1*

| Field Path | Data Type |
|---|---|
| `acceptedTutorId` | `string` |
| `area` | `string` |
| `board` | `string` |
| `budget` | `number` |
| `category` | `string` |
| `city` | `string` |
| `classLevel` | `string` |
| `createdAt` | `number` |
| `id` | `string` |
| `languages` | `array` |
| `latitude` | `number` |
| `longitude` | `number` |
| `mode` | `string` |
| `parentId` | `string` |
| `preferredTimeRange` | `string` |
| `status` | `string` |
| `studentId` | `string` |
| `studentName` | `string` |
| `subjects` | `array of string` |
| `technologies` | `array` |

---

## Collection: `tutors`
*Documents sampled: 7*

| Field Path | Data Type |
|---|---|
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
| `phone` | `string` |
| `preferredLocations` | `string` |
| `preferredTimeRange` | `string` |
| `price` | `number` |
| `qualification` | `string` |
| `rating` | `number` |
| `schoolNames` | `string` |
| `studentCount` | `string` |
| `subjects` | `array of string` |
| `teachingApproach` | `string` |
| `technologies` | `array` |
| `travelDistance` | `string` |
| `whatsapp` | `string` |

---

## Collection: `users`
*Documents sampled: 13*

| Field Path | Data Type |
|---|---|
| `email` | `string` |
| `hasProfile` | `boolean` |
| `id` | `string` |
| `name` | `string` |
| `referralCode` | `string` |
| `referredBy` | `string` |
| `role` | `string` |
| `walletBalance` | `number` |

---

