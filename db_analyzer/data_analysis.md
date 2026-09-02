# Firestore Data Dump

Generated on: 2026-09-02T17:51:59.783Z

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

### Document: `q79FbFfUBx8ECoBTwAV5`
```json
{
  "applicationDocId": "q79FbFfUBx8ECoBTwAV5",
  "applicationId": "MTA1G4DR0",
  "tutorDocId": "fhGEXT3GnBPGHjC3vEwFNtrDAg73",
  "tutorName": "Krishna",
  "requestDocId": "",
  "parentDocId": "5WL4MABTmFWQJ9QPfU33URxGLRW2",
  "studentDocId": "UNYgioNieFTuj9eFbeCq",
  "groupDocId": "MLOraVxLQ8PRnfE3k5pk",
  "studentDocIds": [
    "UNYgioNieFTuj9eFbeCq",
    "uxy4RnjSDS4cbXtRGqEy"
  ],
  "studentName": "Group: Nikhil R Nambiar, Abhilash V",
  "currentOffer": 6000,
  "finalPrice": 6000,
  "initialBudget": 6000,
  "absoluteMin": 6000,
  "absoluteMax": 8400,
  "initiator": "teacher",
  "source": "direct",
  "category": "school",
  "mode": "Online",
  "demoHours": "Flexible",
  "createdAt": {
    "_seconds": 1788341619,
    "_nanoseconds": 313000000
  },
  "demoPaymentPaid": true,
  "proposedDate": "2026-09-02",
  "proposedTime": "16:15",
  "demoDate": "2026-09-02",
  "demoTime": "16:15",
  "lastUpdatedBy": "teacher",
  "updatedAt": {
    "_seconds": 1788350206,
    "_nanoseconds": 602000000
  },
  "feePaid": false,
  "startDate": {
    "_seconds": 1788368679,
    "_nanoseconds": 72000000
  },
  "status": "tuition_started"
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

### Document: `MLOraVxLQ8PRnfE3k5pk`
```json
{
  "studentDocIds": [
    "UNYgioNieFTuj9eFbeCq",
    "uxy4RnjSDS4cbXtRGqEy"
  ],
  "groupId": "MTGQFCSWY",
  "longitude": null,
  "specificDays": [
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Monday"
  ],
  "groupDocId": "MLOraVxLQ8PRnfE3k5pk",
  "city": "",
  "daysPerWeek": "5 Days/Week",
  "preferredTimeRange": "Evening (4 PM - 8 PM)",
  "latitude": null,
  "status": "active",
  "mode": "Online",
  "createdAt": 1788341511052,
  "parentDocId": "5WL4MABTmFWQJ9QPfU33URxGLRW2",
  "area": "",
  "teacherGenderPreference": "No Preference"
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

### Document: `5WL4MABTmFWQJ9QPfU33URxGLRW2`
```json
{
  "whatsapp": "9148018041",
  "phone": "9148018041",
  "name": "Ramachandran M M",
  "parentDocId": "5WL4MABTmFWQJ9QPfU33URxGLRW2",
  "authUid": "5WL4MABTmFWQJ9QPfU33URxGLRW2",
  "email": "nikhil.4002.50.82@gmail.com",
  "parentId": "MTPZHVJ3P"
}
```

---

## Collection: `payments`

### Document: `GLFMJws2RHy7GUaP6SJj`
```json
{
  "razorpayOrderId": "order_TX7Wo68pkrIIt3",
  "applicationDocId": "q79FbFfUBx8ECoBTwAV5",
  "userId": "fhGEXT3GnBPGHjC3vEwFNtrDAg73",
  "amount": 354,
  "walletDiscountApplied": 0,
  "currency": "INR",
  "type": "demo",
  "isRemoval": false,
  "createdAt": {
    "_seconds": 1788341649,
    "_nanoseconds": 671000000
  },
  "razorpayPaymentId": "pay_TX7bMYc8k89ZWv",
  "status": "paid",
  "updatedAt": {
    "_seconds": 1788341939,
    "_nanoseconds": 35000000
  }
}
```

### Document: `qjL8gTo2TgzOKejEqfSE`
```json
{
  "razorpayOrderId": "order_TXA7z2pl3XYRmp",
  "userId": "fhGEXT3GnBPGHjC3vEwFNtrDAg73",
  "amount": 299,
  "currency": "INR",
  "type": "subscription",
  "createdAt": {
    "_seconds": 1788350804,
    "_nanoseconds": 494000000
  },
  "razorpayPaymentId": "pay_TXA8J4IjKWk3Ix",
  "status": "paid",
  "updatedAt": {
    "_seconds": 1788350838,
    "_nanoseconds": 212000000
  }
}
```

---

## Collection: `pending_tuition_fees`

### Document: `q79FbFfUBx8ECoBTwAV5`
```json
{
  "applicationDocId": "q79FbFfUBx8ECoBTwAV5",
  "studentDocId": "5WL4MABTmFWQJ9QPfU33URxGLRW2",
  "tutorDocId": "fhGEXT3GnBPGHjC3vEwFNtrDAg73",
  "status": "pending",
  "amount": 6000,
  "startDate": {
    "_seconds": 1788368679,
    "_nanoseconds": 72000000
  }
}
```

---

## Collection: `referrals`

### Document: `CRcP0iw7Un96AX9IB6nZ`
```json
{
  "referralCode": "RAMA-MABTMF",
  "estimatedReward": 0,
  "referralType": "teacher",
  "status": "pending",
  "createdAt": 1788341549464,
  "referrerName": "Ramachandran M M",
  "referrerId": "5WL4MABTmFWQJ9QPfU33URxGLRW2",
  "referredUserId": "fhGEXT3GnBPGHjC3vEwFNtrDAg73",
  "referredUserName": "Krishna"
}
```

---

## Collection: `reviews`

### Document: `S7op9B5E4Ra2Zn3QttFS`
```json
{
  "tutorDocId": "fhGEXT3GnBPGHjC3vEwFNtrDAg73",
  "parentDocId": "5WL4MABTmFWQJ9QPfU33URxGLRW2",
  "applicationDocId": "q79FbFfUBx8ECoBTwAV5",
  "rating": 5,
  "comment": "Very good teaching",
  "createdAt": 1788371270043
}
```

---

## Collection: `students`

### Document: `UNYgioNieFTuj9eFbeCq`
```json
{
  "name": "Nikhil R Nambiar",
  "classLevel": "8th Standard",
  "gender": "Male",
  "category": "school",
  "languages": [],
  "createdAt": 1788341510360,
  "studentId": "MTS8TGC6O",
  "guardianName": "Ramachandran M M",
  "email": "nikhil.4002.50.82@gmail.com",
  "dob": "",
  "budget": 3000,
  "technologies": [],
  "studentType": "School Student",
  "whatsappNumber": "9148018041",
  "id": "UNYgioNieFTuj9eFbeCq",
  "subjects": [
    "Mathematics"
  ],
  "board": "ICSE",
  "parentDocId": "5WL4MABTmFWQJ9QPfU33URxGLRW2",
  "phoneNumber": "9148018041",
  "groupDocId": "MLOraVxLQ8PRnfE3k5pk",
  "isAvailable": false,
  "pendingRequests": []
}
```

### Document: `uxy4RnjSDS4cbXtRGqEy`
```json
{
  "category": "school",
  "phoneNumber": "9148018041",
  "parentDocId": "5WL4MABTmFWQJ9QPfU33URxGLRW2",
  "name": "Abhilash V",
  "guardianName": "Ramachandran M M",
  "board": "CBSE",
  "studentId": "MTSICHAJP",
  "dob": "",
  "id": "uxy4RnjSDS4cbXtRGqEy",
  "languages": [],
  "studentType": "School Student",
  "createdAt": 1788341510360,
  "gender": "Male",
  "classLevel": "6th Standard",
  "technologies": [],
  "whatsappNumber": "9148018041",
  "budget": 3000,
  "subjects": [
    "Mathematics",
    "Science"
  ],
  "email": "nikhil.4002.50.82@gmail.com",
  "groupDocId": "MLOraVxLQ8PRnfE3k5pk",
  "isAvailable": false,
  "pendingRequests": []
}
```

---

## Collection: `tuition_requests`

### Document: `LFwlM4vDILY1k5qmpK5Q`
```json
{
  "parentDocId": "5WL4MABTmFWQJ9QPfU33URxGLRW2",
  "groupDocId": "MLOraVxLQ8PRnfE3k5pk",
  "longitude": null,
  "acceptedTutorId": "",
  "combinedSubjects": [
    "Mathematics",
    "Science"
  ],
  "combinedTechnologies": [],
  "city": "",
  "studentsDetails": [
    {
      "id": "UNYgioNieFTuj9eFbeCq",
      "name": "Nikhil R Nambiar",
      "classLevel": "8th Standard",
      "board": "ICSE",
      "subjects": [
        "Mathematics"
      ],
      "technologies": [],
      "languages": [],
      "budget": 3000
    },
    {
      "id": "uxy4RnjSDS4cbXtRGqEy",
      "name": "Abhilash V",
      "classLevel": "6th Standard",
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
  "status": "open",
  "combinedBudget": 6000,
  "specificDays": [
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Monday"
  ],
  "area": "",
  "latitude": null,
  "requestId": "REQLIVMX5",
  "category": "school",
  "daysPerWeek": "5 Days/Week",
  "teacherGenderPreference": "No Preference",
  "preferredTimeRange": "Evening (4 PM - 8 PM)",
  "combinedLanguages": [],
  "createdAt": 1788341511189,
  "mode": "Online"
}
```

---

## Collection: `tutors`

### Document: `fhGEXT3GnBPGHjC3vEwFNtrDAg73`
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
  "experience": "Fresher (No experience)",
  "knownLanguages": [],
  "feeRange": "8000",
  "mode": "Online",
  "createdAt": 1788341595703,
  "price": 0,
  "travelDistance": "",
  "hasProfile": true,
  "preferredTimeRange": "",
  "email": "krishnarnambiar760@gmail.com",
  "schoolNames": "",
  "longitude": 0,
  "area": "",
  "tutorId": "MTTQUJBMN",
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
  "authUid": "fhGEXT3GnBPGHjC3vEwFNtrDAg73",
  "weeklyQuota": {
    "weekStartDate": "2026-08-30",
    "tokensUsed": 1,
    "lastUpdated": {
      "_seconds": 1788341619,
      "_nanoseconds": 313000000
    }
  },
  "isSubscribed": true,
  "subscriptionExpiry": 1790942838356,
  "subscriptionUpdatedAt": {
    "_seconds": 1788350837,
    "_nanoseconds": 25000000
  },
  "subscriptionPlan": "pro",
  "kycUpdatedAt": {
    "_seconds": 1788364737,
    "_nanoseconds": 12000000
  },
  "maskedAadhar": "XXXX-XXXX-5661",
  "aadharVerified": true,
  "pendingRequests": [],
  "reviewCount": 1,
  "rating": 5
}
```

---

## Collection: `users`

### Document: `5WL4MABTmFWQJ9QPfU33URxGLRW2`
```json
{
  "id": "5WL4MABTmFWQJ9QPfU33URxGLRW2",
  "email": "nikhil.4002.50.82@gmail.com",
  "roles": [
    "student"
  ],
  "referredBy": "",
  "referralCode": "RAMA-MABTMF",
  "name": "Ramachandran M M",
  "hasProfile": true
}
```

### Document: `fhGEXT3GnBPGHjC3vEwFNtrDAg73`
```json
{
  "referredBy": "RAMA-MABTMF",
  "email": "krishnarnambiar760@gmail.com",
  "roles": [
    "teacher"
  ],
  "id": "fhGEXT3GnBPGHjC3vEwFNtrDAg73",
  "referrerName": "Ramachandran M M",
  "referralCode": "KRIS-XT3GNB",
  "name": "Krishna",
  "hasProfile": true
}
```

---

