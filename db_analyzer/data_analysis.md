# Firestore Data Dump

Generated on: 2026-08-26T12:11:47.744Z

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

### Document: `8KTQRWuKJitdjHnn4FrH`
```json
{
  "applicationId": "MTAT5X8FE",
  "tutorDocId": "sWlHosCiP8Xyopk6Bqf7O6BjG252",
  "tutorName": "KK",
  "parentDocId": "VTEVCwSGvkVmOrTPoZNmDjjZ2Sb2",
  "groupDocId": "MEuYCpjQfV4UClxjQTj5",
  "studentDocIds": [
    "ljPHXhnLM14KFf20y2ZY"
  ],
  "studentName": "Nikhil R Nambiar",
  "finalPrice": 4000,
  "initialBudget": 5000,
  "absoluteMin": 3000,
  "absoluteMax": 5000,
  "initiator": "student",
  "source": "direct",
  "category": "school",
  "mode": "Online",
  "demoHours": "1 Hour/Day",
  "createdAt": {
    "_seconds": 1787745768,
    "_nanoseconds": 655000000
  },
  "currentOffer": 4500,
  "lastUpdatedBy": "student",
  "declinedAt": {
    "_seconds": 1787745818,
    "_nanoseconds": 978000000
  },
  "status": "declined",
  "updatedAt": {
    "_seconds": 1787745818,
    "_nanoseconds": 978000000
  }
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

### Document: `MEuYCpjQfV4UClxjQTj5`
```json
{
  "groupId": "MTGO1MKQK",
  "groupDocId": "MEuYCpjQfV4UClxjQTj5",
  "parentDocId": "VTEVCwSGvkVmOrTPoZNmDjjZ2Sb2",
  "studentDocIds": [
    "ljPHXhnLM14KFf20y2ZY"
  ],
  "mode": "Online",
  "area": "",
  "city": "",
  "latitude": null,
  "longitude": null,
  "teacherGenderPreference": "No Preference",
  "preferredTimeRange": "1 Hour/Day",
  "daysPerWeek": "1 Day/Week",
  "specificDays": [
    "Sunday"
  ],
  "status": "active",
  "createdAt": 1787745534431
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

### Document: `VTEVCwSGvkVmOrTPoZNmDjjZ2Sb2`
```json
{
  "whatsapp": "9148018041",
  "phone": "9148018041",
  "name": "Ramachandran M M",
  "parentDocId": "VTEVCwSGvkVmOrTPoZNmDjjZ2Sb2",
  "authUid": "VTEVCwSGvkVmOrTPoZNmDjjZ2Sb2",
  "email": "nikhil.4002.50.82@gmail.com",
  "parentId": "MTPUH23NM",
  "dailyUsage": {
    "date": "2026-08-26",
    "count": 2,
    "lastUpdated": {
      "_seconds": 1787745768,
      "_nanoseconds": 655000000
    }
  }
}
```

---

## Collection: `referrals`

### Document: `xUqREoegHIna0Vq3mTF4`
```json
{
  "referrerId": "VTEVCwSGvkVmOrTPoZNmDjjZ2Sb2",
  "referrerName": "Ramachandran M M",
  "referredUserId": "sWlHosCiP8Xyopk6Bqf7O6BjG252",
  "referralCode": "RAMA-CWSGVK",
  "referralType": "teacher",
  "status": "pending",
  "estimatedReward": 0,
  "createdAt": 1787745558352,
  "referredUserName": "KK"
}
```

---

## Collection: `students`

### Document: `ljPHXhnLM14KFf20y2ZY`
```json
{
  "studentId": "MTSXWSWR7",
  "id": "ljPHXhnLM14KFf20y2ZY",
  "guardianName": "Ramachandran M M",
  "dob": "",
  "parentDocId": "VTEVCwSGvkVmOrTPoZNmDjjZ2Sb2",
  "category": "school",
  "name": "Nikhil R Nambiar",
  "gender": "Male",
  "phoneNumber": "9148018041",
  "whatsappNumber": "9148018041",
  "email": "nikhil.4002.50.82@gmail.com",
  "studentType": "School Student",
  "classLevel": "9th Standard",
  "board": "ICSE",
  "subjects": [
    "Mathematics"
  ],
  "budget": 3000,
  "technologies": [],
  "languages": [],
  "isAvailable": true,
  "createdAt": 1787745534112,
  "groupDocId": "MEuYCpjQfV4UClxjQTj5",
  "pendingRequests": []
}
```

---

## Collection: `tuition_requests`

### Document: `ZoGThRwmB3QrlqN92GKh`
```json
{
  "requestId": "REQ8IGM3P",
  "groupDocId": "MEuYCpjQfV4UClxjQTj5",
  "parentDocId": "VTEVCwSGvkVmOrTPoZNmDjjZ2Sb2",
  "category": "school",
  "mode": "Online",
  "area": "",
  "city": "",
  "latitude": null,
  "longitude": null,
  "teacherGenderPreference": "No Preference",
  "preferredTimeRange": "1 Hour/Day",
  "daysPerWeek": "1 Day/Week",
  "specificDays": [
    "Sunday"
  ],
  "studentsDetails": [
    {
      "id": "ljPHXhnLM14KFf20y2ZY",
      "name": "Nikhil R Nambiar",
      "classLevel": "9th Standard",
      "board": "ICSE",
      "subjects": [
        "Mathematics"
      ],
      "technologies": [],
      "languages": [],
      "budget": 3000
    }
  ],
  "combinedSubjects": [
    "Mathematics"
  ],
  "combinedTechnologies": [],
  "combinedLanguages": [],
  "combinedBudget": 3000,
  "status": "open",
  "acceptedTutorId": "",
  "createdAt": 1787745534600
}
```

---

## Collection: `tutors`

### Document: `sWlHosCiP8Xyopk6Bqf7O6BjG252`
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
  "rating": 0,
  "boards": [
    "CBSE",
    "ICSE"
  ],
  "experience": "Less than 1 Year",
  "knownLanguages": [],
  "feeRange": "5000",
  "mode": "Online",
  "createdAt": 1787745597777,
  "price": 0,
  "travelDistance": "",
  "hasProfile": true,
  "preferredTimeRange": "",
  "email": "krishnarnambiar760@gmail.com",
  "schoolNames": "",
  "longitude": 0,
  "area": "",
  "tutorId": "MTTDNJXMY",
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
  "name": "KK",
  "teachingApproach": "",
  "preferredLocations": "",
  "category": "school",
  "authUid": "sWlHosCiP8Xyopk6Bqf7O6BjG252",
  "pendingRequests": []
}
```

---

## Collection: `users`

### Document: `VTEVCwSGvkVmOrTPoZNmDjjZ2Sb2`
```json
{
  "id": "VTEVCwSGvkVmOrTPoZNmDjjZ2Sb2",
  "email": "nikhil.4002.50.82@gmail.com",
  "roles": [
    "student"
  ],
  "referredBy": "",
  "referralCode": "RAMA-CWSGVK",
  "name": "Ramachandran M M",
  "hasProfile": true
}
```

### Document: `sWlHosCiP8Xyopk6Bqf7O6BjG252`
```json
{
  "id": "sWlHosCiP8Xyopk6Bqf7O6BjG252",
  "email": "krishnarnambiar760@gmail.com",
  "roles": [
    "teacher"
  ],
  "referredBy": "RAMA-CWSGVK",
  "referrerName": "Ramachandran M M",
  "referralCode": "KKXX-OSCIP8",
  "name": "KK",
  "hasProfile": true
}
```

---

