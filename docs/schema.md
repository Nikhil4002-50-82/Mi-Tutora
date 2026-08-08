# Database Schema

## Collection: `applications`
*   `absoluteMax`
*   `absoluteMin`
*   `applicationId`
*   `category`
*   `createdAt`
*   `currentOffer`
*   `demoDate`
*   `demoHours`
*   `demoPaymentPaid`
*   `demoTime`
*   `finalPrice`
*   `groupDocId`
*   `groupId`
*   `initialBudget`
*   `initiator`
*   `lastUpdatedBy`
*   `mode`
*   `parentDocId`
*   `parentId`
*   `proposedDate`
*   `proposedTime`
*   `requestDocId`
*   `requestId`
*   `source`
*   `status`
*   `studentDocId`
*   `studentDocIds`
*   `studentId`
*   `studentIds`
*   `studentName`
*   `tutorDocId`
*   `tutorId`
*   `tutorName`
*   `updatedAt`

## Collection: `groups`
*   `addressFlat`
*   `addressPincode`
*   `addressStreet`
*   `area`
*   `city`
*   `createdAt`
*   `daysPerWeek`
*   `groupDocId`
*   `groupId`
*   `latitude`
*   `longitude`
*   `mode`
*   `parentDocId`
*   `parentId`
*   `preferredTimeRange`
*   `specificDays`
*   `status`
*   `studentDocIds`
*   `studentIds`
*   `teacherGenderPreference`
*   `updatedAt`

## Collection: `tuition_requests`
*   `acceptedTutorId`
*   `area`
*   `category`
*   `city`
*   `combinedBudget`
*   `combinedLanguages`
*   `combinedSubjects`
*   `combinedTechnologies`
*   `createdAt`
*   `daysPerWeek`
*   `groupDocId`
*   `latitude`
*   `longitude`
*   `mode`
*   `parentDocId`
*   `preferredTimeRange`
*   `requestId`
*   `specificDays`
*   `status`
*   `studentsDetails`
*   `teacherGenderPreference`

## Collection: `tutors`
*   `accountStatus`
*   `address`
*   `area`
*   `authUid`
*   `boards`
*   `category`
*   `city`
*   `classes`
*   `email`
*   `experience`
*   `feeRange`
*   `gender`
*   `hasProfile`
*   `knownLanguages`
*   `languagesTaught`
*   `latitude`
*   `longitude`
*   `mode`
*   `name`
*   `occupation`
*   `pendingRequests`
*   `phone`
*   `preferredLocations`
*   `preferredTimeRange`
*   `price`
*   `qualification`
*   `rating`
*   `role`
*   `schoolNames`
*   `studentCount`
*   `subjects`
*   `teachingApproach`
*   `technologies`
*   `travelDistance`
*   `tutorId`
*   `verificationStatus`
*   `whatsapp`

## Collection: `students`
*   `board`
*   `budget`
*   `category`
*   `classLevel`
*   `createdAt`
*   `dob`
*   `email`
*   `gender`
*   `groupDocId`
*   `groupId`
*   `guardianName`
*   `id`
*   `languages`
*   `learningGoal`
*   `name`
*   `parentDocId`
*   `parentId`
*   `pendingRequests`
*   `phoneNumber`
*   `specialRequirements`
*   `studentId`
*   `studentType`
*   `subjects`
*   `technologies`
*   `whatsappNumber`

## Collection: `global_config`
*   `appEnabled`
*   `disabledMessage`
*   `disabledTitle`
*   `internationalLeadsEnabled`
*   `latestVersionName`
*   `maintenanceMessage`
*   `maintenanceMode`
*   `maintenanceTitle`
*   `marketplaceEnabled`
*   `minSupportedVersionCode`
*   `paymentsEnabled`
*   `recommendationsEnabled`
*   `recommendedVersionCode`
*   `referralsEnabled`
*   `reportsEnabled`
*   `updatedAt`
*   `updatedBy`
*   `verificationEnabled`

## Collection: `users`
*   `email`
*   `fcmToken`
*   `hasProfile`
*   `id`
*   `name`
*   `referralCode`
*   `referredBy`
*   `role`
*   `roles`
*   `walletBalance`

## Collection: `parents`
*   `authUid`
*   `email`
*   `name`
*   `parentDocId`
*   `parentId`
*   `phone`
*   `whatsapp`

## Collection: `referrals`
*   `createdAt`
*   `estimatedReward`
*   `referralCode`
*   `referralType`
*   `referredUserId`
*   `referredUserName`
*   `referrerId`
*   `referrerName`
*   `status`

## Collection: `admin_activity`
*   `adminEmail`
*   `adminUid`
*   `entityId`
*   `entityName`
*   `entityType`
*   `message`
*   `timestamp`
*   `type`

## Collection: `notifications`
*   `applicationId`
*   `createdAt`
*   `message`
*   `read`
*   `role`
*   `title`
*   `type`
*   `userId`

## Collection: `marketplace_pricing`
*   `currency`
*   `displayName`
*   `enabled`
*   `price`
*   `updatedAt`
*   `updatedBy`

## Collection: `id_counters`
*   `lastValue`
