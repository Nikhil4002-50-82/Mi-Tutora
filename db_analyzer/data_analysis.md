# Firestore Data Dump

Generated on: 2026-08-25T10:09:28.552Z

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

### Document: `aCXknmv3C2B3jF1dAGE1`
```json
{
  "applicationId": "APP66RANI",
  "tutorDocId": "45qBwQ8ctHQgdzA9J2uHykNuwbP2",
  "tutorName": "Krishna",
  "parentDocId": "KM5d3Dfphmetm1GiApxDJeR2NP72",
  "groupDocId": "Ra0cVSCGj6smOEAP7CMg",
  "studentDocIds": [
    "zG75TxRvroHwLuS0r6Lv",
    "d94AHQlOs4LMTcIiOlwT"
  ],
  "studentName": "Group: Nikhil R Nambiar, Abhilash V",
  "currentOffer": 5000,
  "initialBudget": 7000,
  "absoluteMin": 4200,
  "absoluteMax": 7000,
  "initiator": "student",
  "source": "direct",
  "category": "school",
  "mode": "Online",
  "demoHours": "1 Hour/Day",
  "createdAt": 1787648981517,
  "finalPrice": 5000,
  "demoPaymentPaid": true,
  "proposedDate": "2026-08-26",
  "proposedTime": "16:30",
  "lastUpdatedBy": "student",
  "demoDate": "2026-08-26",
  "demoTime": "16:30",
  "status": "demo_scheduled",
  "updatedAt": 1787649037145
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

### Document: `Ra0cVSCGj6smOEAP7CMg`
```json
{
  "groupDocId": "Ra0cVSCGj6smOEAP7CMg",
  "parentDocId": "KM5d3Dfphmetm1GiApxDJeR2NP72",
  "studentDocIds": [
    "zG75TxRvroHwLuS0r6Lv",
    "d94AHQlOs4LMTcIiOlwT"
  ],
  "mode": "Online",
  "area": "",
  "city": "",
  "latitude": null,
  "longitude": null,
  "teacherGenderPreference": "No Preference",
  "preferredTimeRange": "1 Hour/Day",
  "daysPerWeek": "5 Days/Week",
  "specificDays": [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday"
  ],
  "status": "active",
  "createdAt": 1787637799078
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

### Document: `KM5d3Dfphmetm1GiApxDJeR2NP72`
```json
{
  "parentId": "MTPJ0N9CK",
  "authUid": "KM5d3Dfphmetm1GiApxDJeR2NP72",
  "whatsapp": "9148018041",
  "phone": "9148018041",
  "name": "Ramachandran M M",
  "parentDocId": "KM5d3Dfphmetm1GiApxDJeR2NP72",
  "email": "nikhil.4002.50.82@gmail.com",
  "dailyUsage": {
    "date": "2026-08-25",
    "count": 2,
    "lastUpdated": {
      "_seconds": 1787648981,
      "_nanoseconds": 507000000
    }
  }
}
```

---

## Collection: `payments`

### Document: `ETPsDJFiUtbw973AKXkE`
```json
{
  "razorpayOrderId": "mock_order_1787649013926",
  "applicationId": "aCXknmv3C2B3jF1dAGE1",
  "userId": "45qBwQ8ctHQgdzA9J2uHykNuwbP2",
  "amount": 531,
  "currency": "INR",
  "createdAt": {
    "_seconds": 1787649013,
    "_nanoseconds": 926000000
  },
  "razorpayPaymentId": "mock_payment_id",
  "status": "paid",
  "updatedAt": {
    "_seconds": 1787649014,
    "_nanoseconds": 727000000
  }
}
```

---

## Collection: `referrals`

### Document: `M8CZ07I6tmgsX9Un6u5D`
```json
{
  "referrerId": "KM5d3Dfphmetm1GiApxDJeR2NP72",
  "referrerName": "Ramachandran M M",
  "referredUserId": "45qBwQ8ctHQgdzA9J2uHykNuwbP2",
  "referralCode": "RAMA-3DFPHM",
  "referralType": "teacher",
  "status": "pending",
  "estimatedReward": 0,
  "createdAt": 1787637865131,
  "referredUserName": "Krishna"
}
```

---

## Collection: `students`

### Document: `d94AHQlOs4LMTcIiOlwT`
```json
{
  "id": "d94AHQlOs4LMTcIiOlwT",
  "guardianName": "Ramachandran M M",
  "dob": "",
  "parentDocId": "KM5d3Dfphmetm1GiApxDJeR2NP72",
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
    "Mathematics"
  ],
  "budget": 2000,
  "technologies": [],
  "languages": [],
  "createdAt": 1787637798449,
  "groupDocId": "Ra0cVSCGj6smOEAP7CMg",
  "pendingRequests": [],
  "isAvailable": false
}
```

### Document: `zG75TxRvroHwLuS0r6Lv`
```json
{
  "id": "zG75TxRvroHwLuS0r6Lv",
  "guardianName": "Ramachandran M M",
  "dob": "",
  "parentDocId": "KM5d3Dfphmetm1GiApxDJeR2NP72",
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
  "budget": 4000,
  "technologies": [],
  "languages": [],
  "createdAt": 1787637798448,
  "groupDocId": "Ra0cVSCGj6smOEAP7CMg",
  "pendingRequests": [],
  "isAvailable": false
}
```

---

## Collection: `tuition_requests`

### Document: `PE62Sz3P6Ly6hFDtkKJ4`
```json
{
  "requestId": "REQZ2VYNZ",
  "groupDocId": "Ra0cVSCGj6smOEAP7CMg",
  "parentDocId": "KM5d3Dfphmetm1GiApxDJeR2NP72",
  "category": "school",
  "mode": "Online",
  "area": "",
  "city": "",
  "latitude": null,
  "longitude": null,
  "teacherGenderPreference": "No Preference",
  "preferredTimeRange": "1 Hour/Day",
  "daysPerWeek": "5 Days/Week",
  "specificDays": [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday"
  ],
  "studentsDetails": [
    {
      "id": "zG75TxRvroHwLuS0r6Lv",
      "name": "Nikhil R Nambiar",
      "classLevel": "10th Standard",
      "board": "ICSE",
      "subjects": [
        "Mathematics"
      ],
      "technologies": [],
      "languages": [],
      "budget": 4000
    },
    {
      "id": "d94AHQlOs4LMTcIiOlwT",
      "name": "Abhilash V",
      "classLevel": "6th Standard",
      "board": "CBSE",
      "subjects": [
        "Mathematics"
      ],
      "technologies": [],
      "languages": [],
      "budget": 2000
    }
  ],
  "combinedSubjects": [
    "Mathematics"
  ],
  "combinedTechnologies": [],
  "combinedLanguages": [],
  "combinedBudget": 6000,
  "status": "open",
  "acceptedTutorId": "",
  "createdAt": 1787637799225
}
```

---

## Collection: `tutors`

### Document: `45qBwQ8ctHQgdzA9J2uHykNuwbP2`
```json
{
  "tutorId": "MTTUHI0YB",
  "authUid": "45qBwQ8ctHQgdzA9J2uHykNuwbP2",
  "email": "krishnarnambiar760@gmail.com",
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
  "rating": 0,
  "boards": [
    "CBSE",
    "ICSE"
  ],
  "experience": "Less than 1 Year",
  "knownLanguages": [],
  "feeRange": "7000",
  "mode": "Online",
  "createdAt": 1787637910574,
  "price": 0,
  "travelDistance": "",
  "hasProfile": true,
  "preferredTimeRange": "",
  "schoolNames": "",
  "longitude": 0,
  "area": "",
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
  "pendingRequests": []
}
```

---

## Collection: `users`

### Document: `45qBwQ8ctHQgdzA9J2uHykNuwbP2`
```json
{
  "id": "45qBwQ8ctHQgdzA9J2uHykNuwbP2",
  "email": "krishnarnambiar760@gmail.com",
  "roles": [
    "teacher"
  ],
  "referredBy": "RAMA-3DFPHM",
  "referrerName": "Ramachandran M M",
  "referralCode": "KRIS-WQ8CTH",
  "name": "Krishna",
  "hasProfile": true
}
```

### Document: `KM5d3Dfphmetm1GiApxDJeR2NP72`
```json
{
  "id": "KM5d3Dfphmetm1GiApxDJeR2NP72",
  "email": "nikhil.4002.50.82@gmail.com",
  "roles": [
    "student"
  ],
  "referredBy": "",
  "referralCode": "RAMA-3DFPHM",
  "name": "Ramachandran M M",
  "hasProfile": true
}
```

---

