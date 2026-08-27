# Firestore Data Dump

Generated on: 2026-08-27T20:43:10.951Z

This file contains the raw data from all documents in the database to help trace foreign keys and logic.

## Collection: `admin_activity`

### Document: `1u2jC5NLLZtnyvljOiPq`
```json
{
  "type": "PLATFORM_CONFIG_CHANGED",
  "message": "Platform configuration updated (platformStatus)",
  "entityType": "platform_config",
  "entityId": "app",
  "entityName": "platformStatus",
  "adminUid": "CKY05uxqU9Wl1untK9EwQ3EWnNo1",
  "adminEmail": "admin@mitutora.in",
  "timestamp": {
    "_seconds": 1785763904,
    "_nanoseconds": 225000000
  }
}
```

### Document: `KB2OzfxzJ1VK0ZFVfufz`
```json
{
  "type": "TUTOR_REACTIVATED",
  "message": "Tutor \"School Tutor \" reactivated",
  "entityType": "tutor",
  "entityId": "M4Xr6mJ95KfBG0kurQbhQtD9Dxz1",
  "entityName": "School Tutor ",
  "adminUid": "CKY05uxqU9Wl1untK9EwQ3EWnNo1",
  "adminEmail": "admin@mitutora.in",
  "timestamp": {
    "_seconds": 1783190348,
    "_nanoseconds": 79000000
  }
}
```

### Document: `bG0iVxGdVaKTkSQrrDn9`
```json
{
  "type": "PRICING_UPDATED",
  "message": "Pricing updated for \"Class 10 School Tuition\" to ₹300",
  "entityType": "pricing",
  "entityId": "school_class_10",
  "entityName": "Class 10 School Tuition",
  "adminUid": "CKY05uxqU9Wl1untK9EwQ3EWnNo1",
  "adminEmail": "admin@mitutora.in",
  "timestamp": {
    "_seconds": 1785763861,
    "_nanoseconds": 788000000
  }
}
```

### Document: `dG5NfDDhEu7VUIXqd82O`
```json
{
  "type": "PLATFORM_CONFIG_CHANGED",
  "message": "Platform configuration updated (featureFlags)",
  "entityType": "platform_config",
  "entityId": "app",
  "entityName": "featureFlags",
  "adminUid": "CKY05uxqU9Wl1untK9EwQ3EWnNo1",
  "adminEmail": "admin@mitutora.in",
  "timestamp": {
    "_seconds": 1785763955,
    "_nanoseconds": 216000000
  }
}
```

### Document: `h9TqzItmNQORv6ZTTPFR`
```json
{
  "type": "TUTOR_SUSPENDED",
  "message": "Tutor \"School Tutor \" suspended",
  "entityType": "tutor",
  "entityId": "M4Xr6mJ95KfBG0kurQbhQtD9Dxz1",
  "entityName": "School Tutor ",
  "adminUid": "CKY05uxqU9Wl1untK9EwQ3EWnNo1",
  "adminEmail": "admin@mitutora.in",
  "timestamp": {
    "_seconds": 1783190326,
    "_nanoseconds": 970000000
  }
}
```

### Document: `yv3wNHDy2sXD9WQwyHMo`
```json
{
  "type": "PLATFORM_CONFIG_CHANGED",
  "message": "Platform configuration updated (platformStatus)",
  "entityType": "platform_config",
  "entityId": "app",
  "entityName": "platformStatus",
  "adminUid": "CKY05uxqU9Wl1untK9EwQ3EWnNo1",
  "adminEmail": "admin@mitutora.in",
  "timestamp": {
    "_seconds": 1785763915,
    "_nanoseconds": 868000000
  }
}
```

---

## Collection: `applications`

### Document: `rXAgexdkTyYMKQU5KbeE`
```json
{
  "applicationId": "MTAZ7J2FI",
  "tutorDocId": "DiJjAkrHDVdu3pLxvH0DHEXbSK03",
  "tutorName": "Krishna",
  "requestDocId": "",
  "parentDocId": "t6GWjTyqutOz3Epun8ZzU0MrOsw2",
  "studentDocId": "NtSGYn21EBSO0NkzLMsZ",
  "groupDocId": "csM0DqXLPDeWfUPAFSw9",
  "studentDocIds": [
    "NtSGYn21EBSO0NkzLMsZ",
    "QPWemAvX2cXy2VsQtAaz"
  ],
  "studentName": "Group: Nikhil R Nambiar, Abhilash V",
  "currentOffer": 7000,
  "finalPrice": 7000,
  "initialBudget": 7000,
  "absoluteMin": 7000,
  "absoluteMax": 9800,
  "initiator": "teacher",
  "source": "direct",
  "category": "school",
  "mode": "Online",
  "demoHours": "Flexible",
  "createdAt": {
    "_seconds": 1787833980,
    "_nanoseconds": 911000000
  },
  "demoPaymentPaid": true,
  "proposedDate": "2026-08-27",
  "proposedTime": "18:05",
  "lastUpdatedBy": "student",
  "demoDate": "2026-08-27",
  "demoTime": "18:05",
  "updatedAt": {
    "_seconds": 1787834055,
    "_nanoseconds": 713000000
  },
  "feePaid": false,
  "startDate": {
    "_seconds": 1787834197,
    "_nanoseconds": 171000000
  },
  "status": "tuition_started",
  "applicationDocId": "rXAgexdkTyYMKQU5KbeE"
}
```

---

## Collection: `global_config`

### Document: `app`
```json
{
  "latestVersionName": "1.0",
  "recommendedVersionCode": 1,
  "minSupportedVersionCode": 1,
  "updatedBy": "CKY05uxqU9Wl1untK9EwQ3EWnNo1",
  "disabledMessage": "",
  "disabledTitle": "",
  "maintenanceMessage": "",
  "maintenanceTitle": "",
  "appEnabled": true,
  "maintenanceMode": false,
  "paymentsEnabled": true,
  "referralsEnabled": true,
  "recommendationsEnabled": true,
  "verificationEnabled": true,
  "marketplaceEnabled": true,
  "internationalLeadsEnabled": true,
  "reportsEnabled": true,
  "updatedAt": {
    "_seconds": 1785763954,
    "_nanoseconds": 609000000
  }
}
```

---

## Collection: `groups`

### Document: `AuAw1IzaU0Cw5hQ9QyK7`
```json
{
  "groupId": "MTG9QFZ9I",
  "groupDocId": "AuAw1IzaU0Cw5hQ9QyK7",
  "parentDocId": "YkGaGgyWy2YYOD1ApNk7tbzBzAX2",
  "studentDocIds": [
    "dOIfMcI055ZkNq9eZd7w"
  ],
  "mode": "Online",
  "area": "",
  "city": "",
  "latitude": null,
  "longitude": null,
  "teacherGenderPreference": "No Preference",
  "preferredTimeRange": "1 Hour/Day",
  "daysPerWeek": "4 Days/Week",
  "specificDays": [
    "Tuesday",
    "Wednesday",
    "Friday",
    "Thursday"
  ],
  "status": "active",
  "createdAt": 1787835361667
}
```

### Document: `csM0DqXLPDeWfUPAFSw9`
```json
{
  "groupId": "MTGS1OQME",
  "groupDocId": "csM0DqXLPDeWfUPAFSw9",
  "parentDocId": "t6GWjTyqutOz3Epun8ZzU0MrOsw2",
  "studentDocIds": [
    "NtSGYn21EBSO0NkzLMsZ",
    "QPWemAvX2cXy2VsQtAaz"
  ],
  "mode": "Online",
  "area": "",
  "city": "",
  "latitude": null,
  "longitude": null,
  "teacherGenderPreference": "No Preference",
  "preferredTimeRange": "1 Hour/Day",
  "daysPerWeek": "2 Days/Week",
  "specificDays": [
    "Saturday",
    "Sunday"
  ],
  "status": "active",
  "createdAt": 1787833897017
}
```

---

## Collection: `id_counters`

### Document: `application`
```json
{
  "lastValue": 0
}
```

### Document: `parent`
```json
{
  "lastValue": 3
}
```

### Document: `student`
```json
{
  "lastValue": 0
}
```

### Document: `tuition_request`
```json
{
  "lastValue": 0
}
```

### Document: `tutor`
```json
{
  "lastValue": 0
}
```

---

## Collection: `marketplace_pricing`

### Document: `competitive_banking`
```json
{
  "price": 250,
  "currency": "INR",
  "displayName": "Banking Exams Preparation",
  "updatedBy": "CKY05uxqU9Wl1untK9EwQ3EWnNo1",
  "enabled": false,
  "updatedAt": {
    "_seconds": 1783180882,
    "_nanoseconds": 234000000
  }
}
```

### Document: `competitive_cat`
```json
{
  "price": 300,
  "currency": "INR",
  "displayName": "CAT Preparation",
  "enabled": false
}
```

### Document: `competitive_gate`
```json
{
  "price": 300,
  "currency": "INR",
  "displayName": "GATE Preparation",
  "enabled": false
}
```

### Document: `competitive_jee`
```json
{
  "price": 350,
  "currency": "INR",
  "displayName": "JEE Preparation",
  "enabled": false
}
```

### Document: `competitive_neet`
```json
{
  "price": 350,
  "currency": "INR",
  "displayName": "NEET Preparation",
  "enabled": false
}
```

### Document: `competitive_ssc`
```json
{
  "price": 250,
  "currency": "INR",
  "displayName": "SSC Preparation",
  "enabled": false
}
```

### Document: `competitive_upsc`
```json
{
  "price": 300,
  "currency": "INR",
  "displayName": "UPSC Preparation",
  "enabled": false
}
```

### Document: `general`
```json
{
  "price": 100,
  "currency": "INR",
  "displayName": "General Tuition",
  "enabled": false
}
```

### Document: `international_general`
```json
{
  "price": 350,
  "currency": "INR",
  "displayName": "International Curriculum Tuition",
  "enabled": false
}
```

### Document: `languages_general`
```json
{
  "price": 200,
  "currency": "INR",
  "displayName": "Language Tuition",
  "enabled": false
}
```

### Document: `programming_advanced`
```json
{
  "price": 400,
  "currency": "INR",
  "displayName": "Programming — Advanced",
  "enabled": false
}
```

### Document: `programming_beginner`
```json
{
  "price": 150,
  "currency": "INR",
  "displayName": "Programming — Beginner",
  "enabled": false
}
```

### Document: `programming_intermediate`
```json
{
  "price": 250,
  "currency": "INR",
  "displayName": "Programming — Intermediate",
  "enabled": false
}
```

### Document: `school_class_1`
```json
{
  "price": 100,
  "currency": "INR",
  "displayName": "Class 1 School Tuition",
  "enabled": false
}
```

### Document: `school_class_10`
```json
{
  "currency": "INR",
  "displayName": "Class 10 School Tuition",
  "enabled": false,
  "updatedBy": "CKY05uxqU9Wl1untK9EwQ3EWnNo1",
  "price": 300,
  "updatedAt": {
    "_seconds": 1785763861,
    "_nanoseconds": 643000000
  }
}
```

### Document: `school_class_11`
```json
{
  "price": 250,
  "currency": "INR",
  "displayName": "Class 11 School Tuition",
  "enabled": false
}
```

### Document: `school_class_12`
```json
{
  "price": 250,
  "currency": "INR",
  "displayName": "Class 12 School Tuition",
  "enabled": false
}
```

### Document: `school_class_2`
```json
{
  "price": 100,
  "currency": "INR",
  "displayName": "Class 2 School Tuition",
  "enabled": false
}
```

### Document: `school_class_3`
```json
{
  "price": 100,
  "currency": "INR",
  "displayName": "Class 3 School Tuition",
  "enabled": false
}
```

### Document: `school_class_4`
```json
{
  "price": 100,
  "currency": "INR",
  "displayName": "Class 4 School Tuition",
  "enabled": false
}
```

### Document: `school_class_5`
```json
{
  "currency": "INR",
  "displayName": "Class 5 School Tuition",
  "enabled": false,
  "price": 500
}
```

### Document: `school_class_6`
```json
{
  "price": 150,
  "currency": "INR",
  "displayName": "Class 6 School Tuition",
  "enabled": false
}
```

### Document: `school_class_7`
```json
{
  "price": 150,
  "currency": "INR",
  "displayName": "Class 7 School Tuition",
  "enabled": false
}
```

### Document: `school_class_8`
```json
{
  "price": 150,
  "currency": "INR",
  "displayName": "Class 8 School Tuition",
  "enabled": false
}
```

### Document: `school_class_9`
```json
{
  "price": 200,
  "currency": "INR",
  "displayName": "Class 9 School Tuition",
  "enabled": false
}
```

### Document: `school_lkg`
```json
{
  "price": 50,
  "currency": "INR",
  "displayName": "LKG School Tuition",
  "enabled": false
}
```

### Document: `school_ukg`
```json
{
  "price": 50,
  "currency": "INR",
  "displayName": "UKG School Tuition",
  "enabled": false
}
```

---

## Collection: `parents`

### Document: `YkGaGgyWy2YYOD1ApNk7tbzBzAX2`
```json
{
  "whatsapp": "0861824288",
  "phone": "0861824288",
  "name": "Varshini P",
  "parentDocId": "YkGaGgyWy2YYOD1ApNk7tbzBzAX2",
  "authUid": "YkGaGgyWy2YYOD1ApNk7tbzBzAX2",
  "email": "varshinivarsh1304@gmail.com",
  "parentId": "MTPRSHTPQ"
}
```

### Document: `t6GWjTyqutOz3Epun8ZzU0MrOsw2`
```json
{
  "whatsapp": "9148018041",
  "phone": "9148018041",
  "name": "Ramachandran M M",
  "parentDocId": "t6GWjTyqutOz3Epun8ZzU0MrOsw2",
  "authUid": "t6GWjTyqutOz3Epun8ZzU0MrOsw2",
  "email": "nikhil.4002.50.82@gmail.com",
  "parentId": "MTPHQBA2W"
}
```

---

## Collection: `payments`

### Document: `dkfHDWg7sxEk3VcBMxdE`
```json
{
  "razorpayOrderId": "mock_order_1787834040102",
  "userId": "DiJjAkrHDVdu3pLxvH0DHEXbSK03",
  "amount": 531,
  "currency": "INR",
  "createdAt": {
    "_seconds": 1787834040,
    "_nanoseconds": 103000000
  },
  "razorpayPaymentId": "mock_payment_id",
  "status": "paid",
  "updatedAt": {
    "_seconds": 1787834040,
    "_nanoseconds": 807000000
  },
  "applicationDocId": "rXAgexdkTyYMKQU5KbeE"
}
```

---

## Collection: `referrals`

### Document: `Y9tq7MXgr0HlwW4G3Jyg`
```json
{
  "referrerId": "t6GWjTyqutOz3Epun8ZzU0MrOsw2",
  "referrerName": "Ramachandran M M",
  "referredUserId": "DiJjAkrHDVdu3pLxvH0DHEXbSK03",
  "referralCode": "RAMA-JTYQUT",
  "referralType": "teacher",
  "estimatedReward": 0,
  "createdAt": 1787833924950,
  "referredUserName": "Krishna",
  "status": "pending"
}
```

### Document: `reH0zhuGhsnUGXIc7Zm0`
```json
{
  "referrerId": "t6GWjTyqutOz3Epun8ZzU0MrOsw2",
  "referrerName": "Ramachandran M M",
  "referredUserId": "YkGaGgyWy2YYOD1ApNk7tbzBzAX2",
  "referredUserName": "Varshini P",
  "referralCode": "RAMA-JTYQUT",
  "referralType": "student",
  "status": "pending",
  "estimatedReward": 0,
  "createdAt": 1787835317360
}
```

---

## Collection: `reviews`

### Document: `odrT9QmFbZDkrGYrzvZE`
```json
{
  "tutorDocId": "DiJjAkrHDVdu3pLxvH0DHEXbSK03",
  "parentDocId": "t6GWjTyqutOz3Epun8ZzU0MrOsw2",
  "rating": 5,
  "comment": "very good teacher",
  "createdAt": 1787834219495,
  "applicationDocId": "rXAgexdkTyYMKQU5KbeE"
}
```

---

## Collection: `students`

### Document: `NtSGYn21EBSO0NkzLMsZ`
```json
{
  "studentId": "MTSMA0H7X",
  "id": "NtSGYn21EBSO0NkzLMsZ",
  "guardianName": "Ramachandran M M",
  "dob": "",
  "parentDocId": "t6GWjTyqutOz3Epun8ZzU0MrOsw2",
  "category": "school",
  "name": "Nikhil R Nambiar",
  "gender": "Male",
  "phoneNumber": "9148018041",
  "whatsappNumber": "9148018041",
  "email": "nikhil.4002.50.82@gmail.com",
  "studentType": "School Student",
  "classLevel": "10th Standard",
  "board": "ICSE",
  "subjects": [
    "Mathematics"
  ],
  "budget": 3000,
  "technologies": [],
  "languages": [],
  "createdAt": 1787833896372,
  "groupDocId": "csM0DqXLPDeWfUPAFSw9",
  "isAvailable": false,
  "pendingRequests": []
}
```

### Document: `QPWemAvX2cXy2VsQtAaz`
```json
{
  "studentId": "MTSULYKV7",
  "id": "QPWemAvX2cXy2VsQtAaz",
  "guardianName": "Ramachandran M M",
  "dob": "",
  "parentDocId": "t6GWjTyqutOz3Epun8ZzU0MrOsw2",
  "category": "school",
  "name": "Abhilash V",
  "gender": "Male",
  "phoneNumber": "9148018041",
  "whatsappNumber": "9148018041",
  "email": "nikhil.4002.50.82@gmail.com",
  "studentType": "School Student",
  "classLevel": "6th Standard",
  "board": "CBSE",
  "subjects": [
    "Mathematics",
    "Science"
  ],
  "budget": 4000,
  "technologies": [],
  "languages": [],
  "createdAt": 1787833896372,
  "groupDocId": "csM0DqXLPDeWfUPAFSw9",
  "isAvailable": false,
  "pendingRequests": []
}
```

### Document: `dOIfMcI055ZkNq9eZd7w`
```json
{
  "studentId": "MTS9S8ABG",
  "id": "dOIfMcI055ZkNq9eZd7w",
  "guardianName": "Varshini P",
  "dob": "",
  "parentDocId": "YkGaGgyWy2YYOD1ApNk7tbzBzAX2",
  "category": "school",
  "name": "Tharun Kumar P",
  "gender": "Male",
  "phoneNumber": "0861824288",
  "whatsappNumber": "0861824288",
  "email": "varshinivarsh1304@gmail.com",
  "studentType": "School Student",
  "classLevel": "8th Standard",
  "board": "CBSE",
  "subjects": [
    "Mathematics",
    "Science"
  ],
  "budget": 3000,
  "technologies": [],
  "languages": [],
  "isAvailable": true,
  "createdAt": 1787835361364,
  "groupDocId": "AuAw1IzaU0Cw5hQ9QyK7"
}
```

---

## Collection: `tuition_requests`

### Document: `194e2yHdZYkErXM1W7Is`
```json
{
  "requestId": "REQRJ5W1M",
  "groupDocId": "csM0DqXLPDeWfUPAFSw9",
  "parentDocId": "t6GWjTyqutOz3Epun8ZzU0MrOsw2",
  "category": "school",
  "mode": "Online",
  "area": "",
  "city": "",
  "latitude": null,
  "longitude": null,
  "teacherGenderPreference": "No Preference",
  "preferredTimeRange": "1 Hour/Day",
  "daysPerWeek": "2 Days/Week",
  "specificDays": [
    "Saturday",
    "Sunday"
  ],
  "studentsDetails": [
    {
      "id": "NtSGYn21EBSO0NkzLMsZ",
      "name": "Nikhil R Nambiar",
      "classLevel": "10th Standard",
      "board": "ICSE",
      "subjects": [
        "Mathematics"
      ],
      "technologies": [],
      "languages": [],
      "budget": 3000
    },
    {
      "id": "QPWemAvX2cXy2VsQtAaz",
      "name": "Abhilash V",
      "classLevel": "6th Standard",
      "board": "CBSE",
      "subjects": [
        "Mathematics",
        "Science"
      ],
      "technologies": [],
      "languages": [],
      "budget": 4000
    }
  ],
  "combinedSubjects": [
    "Mathematics",
    "Science"
  ],
  "combinedTechnologies": [],
  "combinedLanguages": [],
  "combinedBudget": 7000,
  "status": "open",
  "acceptedTutorId": "",
  "createdAt": 1787833897195
}
```

### Document: `IFxX6vDqa7UynMQhn4IM`
```json
{
  "requestId": "REQENRHX5",
  "groupDocId": "AuAw1IzaU0Cw5hQ9QyK7",
  "parentDocId": "YkGaGgyWy2YYOD1ApNk7tbzBzAX2",
  "category": "school",
  "mode": "Online",
  "area": "",
  "city": "",
  "latitude": null,
  "longitude": null,
  "teacherGenderPreference": "No Preference",
  "preferredTimeRange": "1 Hour/Day",
  "daysPerWeek": "4 Days/Week",
  "specificDays": [
    "Tuesday",
    "Wednesday",
    "Friday",
    "Thursday"
  ],
  "studentsDetails": [
    {
      "id": "dOIfMcI055ZkNq9eZd7w",
      "name": "Tharun Kumar P",
      "classLevel": "8th Standard",
      "board": "CBSE",
      "subjects": [
        "Mathematics",
        "Science"
      ],
      "technologies": [],
      "languages": [],
      "budget": 3000
    }
  ],
  "combinedSubjects": [
    "Mathematics",
    "Science"
  ],
  "combinedTechnologies": [],
  "combinedLanguages": [],
  "combinedBudget": 3000,
  "status": "open",
  "acceptedTutorId": "",
  "createdAt": 1787835361798
}
```

---

## Collection: `tutors`

### Document: `DiJjAkrHDVdu3pLxvH0DHEXbSK03`
```json
{
  "whatsapp": "9148018043",
  "studentCount": "",
  "occupation": "",
  "gender": "Male",
  "city": "",
  "classes": [
    "6th - 8th",
    "9th - 10th"
  ],
  "latitude": 0,
  "boards": [
    "CBSE",
    "ICSE"
  ],
  "experience": "Less than 1 Year",
  "knownLanguages": [],
  "feeRange": "7000",
  "mode": "Online",
  "createdAt": 1787833965372,
  "price": 0,
  "travelDistance": "",
  "hasProfile": true,
  "preferredTimeRange": "",
  "email": "krishnarnambiar760@gmail.com",
  "schoolNames": "",
  "longitude": 0,
  "area": "",
  "tutorId": "MTTVUH7S9",
  "address": "",
  "subjects": [
    "Biology",
    "Chemistry",
    "Mathematics",
    "Science"
  ],
  "languagesTaught": [],
  "technologies": [],
  "qualification": "B.E / B.Tech",
  "phone": "9148018043",
  "name": "Krishna",
  "teachingApproach": "",
  "preferredLocations": "",
  "category": "school",
  "authUid": "DiJjAkrHDVdu3pLxvH0DHEXbSK03",
  "weeklyQuota": {
    "weekStartDate": "2026-08-23",
    "tokensUsed": 1,
    "lastUpdated": {
      "_seconds": 1787833980,
      "_nanoseconds": 911000000
    }
  },
  "pendingRequests": [],
  "reviewCount": 1,
  "rating": 5
}
```

---

## Collection: `users`

### Document: `DiJjAkrHDVdu3pLxvH0DHEXbSK03`
```json
{
  "id": "DiJjAkrHDVdu3pLxvH0DHEXbSK03",
  "email": "krishnarnambiar760@gmail.com",
  "roles": [
    "teacher"
  ],
  "referredBy": "RAMA-JTYQUT",
  "referrerName": "Ramachandran M M",
  "referralCode": "KRIS-AKRHDV",
  "name": "Krishna",
  "hasProfile": true
}
```

### Document: `YkGaGgyWy2YYOD1ApNk7tbzBzAX2`
```json
{
  "id": "YkGaGgyWy2YYOD1ApNk7tbzBzAX2",
  "email": "varshinivarsh1304@gmail.com",
  "name": "Varshini P",
  "roles": [
    "student"
  ],
  "referredBy": "RAMA-JTYQUT",
  "referrerName": "Ramachandran M M",
  "referralCode": "VARS-GGYWY2",
  "hasProfile": true
}
```

### Document: `fJ0fqNtywLY2HUFo3qElLSsP3aA2`
```json
{
  "id": "fJ0fqNtywLY2HUFo3qElLSsP3aA2",
  "email": "musharrafak07@gmail.com",
  "name": "Musharraf Khan",
  "roles": [
    "student"
  ],
  "referredBy": ""
}
```

### Document: `t6GWjTyqutOz3Epun8ZzU0MrOsw2`
```json
{
  "id": "t6GWjTyqutOz3Epun8ZzU0MrOsw2",
  "email": "nikhil.4002.50.82@gmail.com",
  "roles": [
    "student"
  ],
  "referredBy": "",
  "referralCode": "RAMA-JTYQUT",
  "name": "Ramachandran M M",
  "hasProfile": true,
  "walletBalance": 1750
}
```

---

