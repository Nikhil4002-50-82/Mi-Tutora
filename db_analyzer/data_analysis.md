# Firestore Data Dump

Generated on: 2026-08-28T08:18:36.664Z

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

### Document: `Cmg1V1eA7EqRuYQlHWM3`
```json
{
  "longitude": null,
  "mode": "Online",
  "area": "",
  "groupDocId": "Cmg1V1eA7EqRuYQlHWM3",
  "parentDocId": "VuPaItyqNFfZo7LFG0MB4JZVrU73",
  "groupId": "MTGILF0YZ",
  "specificDays": [
    "Saturday",
    "Sunday"
  ],
  "createdAt": 1787902683453,
  "city": "",
  "studentDocIds": [
    "EjZ77JdzmQJ91G6XXjxA",
    "9oKjT6eVoUP1wJ6AxoEO"
  ],
  "daysPerWeek": "2 Days/Week",
  "latitude": null,
  "teacherGenderPreference": "No Preference",
  "status": "active",
  "preferredTimeRange": "Evening (4 PM - 8 PM)"
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

### Document: `VuPaItyqNFfZo7LFG0MB4JZVrU73`
```json
{
  "whatsapp": "9148018041",
  "phone": "9148018041",
  "name": "Ramachandran M M",
  "parentDocId": "VuPaItyqNFfZo7LFG0MB4JZVrU73",
  "authUid": "VuPaItyqNFfZo7LFG0MB4JZVrU73",
  "email": "nikhil.4002.50.82@gmail.com",
  "parentId": "MTPPFC8Z1"
}
```

---

## Collection: `referrals`

### Document: `DysNvl2BlYOq2FeD5JCH`
```json
{
  "referralCode": "RAMA-ITYQNF",
  "referrerName": "Ramachandran M M",
  "createdAt": 1787902728982,
  "referredUserId": "1FvKT8311basBtfPQcYNfStf0Un2",
  "status": "pending",
  "referrerId": "VuPaItyqNFfZo7LFG0MB4JZVrU73",
  "referralType": "teacher",
  "estimatedReward": 0,
  "referredUserName": "Krishna"
}
```

---

## Collection: `students`

### Document: `9oKjT6eVoUP1wJ6AxoEO`
```json
{
  "subjects": [
    "Mathematics",
    "Science"
  ],
  "category": "school",
  "guardianName": "Ramachandran M M",
  "parentDocId": "VuPaItyqNFfZo7LFG0MB4JZVrU73",
  "whatsappNumber": "9148018041",
  "createdAt": 1787902682971,
  "budget": 3000,
  "id": "9oKjT6eVoUP1wJ6AxoEO",
  "email": "nikhil.4002.50.82@gmail.com",
  "isAvailable": true,
  "technologies": [],
  "studentId": "MTSCPJ4ZJ",
  "languages": [],
  "name": "Abhilash V",
  "board": "CBSE",
  "classLevel": "6th Standard",
  "studentType": "School Student",
  "dob": "",
  "phoneNumber": "9148018041",
  "gender": "Male",
  "groupDocId": "Cmg1V1eA7EqRuYQlHWM3"
}
```

### Document: `EjZ77JdzmQJ91G6XXjxA`
```json
{
  "technologies": [],
  "subjects": [
    "Mathematics"
  ],
  "category": "school",
  "budget": 3000,
  "isAvailable": true,
  "board": "ICSE",
  "parentDocId": "VuPaItyqNFfZo7LFG0MB4JZVrU73",
  "guardianName": "Ramachandran M M",
  "languages": [],
  "studentType": "School Student",
  "studentId": "MTS25FKWG",
  "whatsappNumber": "9148018041",
  "gender": "Male",
  "phoneNumber": "9148018041",
  "createdAt": 1787902682971,
  "name": "Nikhil R Nambiar",
  "classLevel": "10th Standard",
  "id": "EjZ77JdzmQJ91G6XXjxA",
  "dob": "",
  "email": "nikhil.4002.50.82@gmail.com",
  "groupDocId": "Cmg1V1eA7EqRuYQlHWM3"
}
```

---

## Collection: `tuition_requests`

### Document: `l17glmSyRSBguaPq9eC1`
```json
{
  "category": "school",
  "preferredTimeRange": "Evening (4 PM - 8 PM)",
  "city": "",
  "combinedSubjects": [
    "Mathematics",
    "Science"
  ],
  "combinedLanguages": [],
  "groupDocId": "Cmg1V1eA7EqRuYQlHWM3",
  "parentDocId": "VuPaItyqNFfZo7LFG0MB4JZVrU73",
  "specificDays": [
    "Saturday",
    "Sunday"
  ],
  "latitude": null,
  "status": "open",
  "combinedTechnologies": [],
  "studentsDetails": [
    {
      "id": "EjZ77JdzmQJ91G6XXjxA",
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
      "id": "9oKjT6eVoUP1wJ6AxoEO",
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
  "daysPerWeek": "2 Days/Week",
  "acceptedTutorId": "",
  "combinedBudget": 6000,
  "area": "",
  "createdAt": 1787902683595,
  "mode": "Online",
  "teacherGenderPreference": "No Preference",
  "longitude": null,
  "requestId": "REQIFIY7R"
}
```

---

## Collection: `tutors`

### Document: `1FvKT8311basBtfPQcYNfStf0Un2`
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
  "experience": "Fresher (No experience)",
  "knownLanguages": [],
  "feeRange": "8000",
  "mode": "Online",
  "createdAt": 1787902777389,
  "price": 0,
  "travelDistance": "",
  "hasProfile": true,
  "preferredTimeRange": "",
  "email": "krishnarnambiar760@gmail.com",
  "schoolNames": "",
  "longitude": 0,
  "area": "",
  "tutorId": "MTTFVUKHJ",
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
  "authUid": "1FvKT8311basBtfPQcYNfStf0Un2"
}
```

---

## Collection: `users`

### Document: `1FvKT8311basBtfPQcYNfStf0Un2`
```json
{
  "referredBy": "RAMA-ITYQNF",
  "id": "1FvKT8311basBtfPQcYNfStf0Un2",
  "referrerName": "Ramachandran M M",
  "email": "krishnarnambiar760@gmail.com",
  "roles": [
    "teacher"
  ],
  "referralCode": "KRIS-T8311B",
  "name": "Krishna",
  "hasProfile": true
}
```

### Document: `VuPaItyqNFfZo7LFG0MB4JZVrU73`
```json
{
  "referredBy": "",
  "email": "nikhil.4002.50.82@gmail.com",
  "roles": [
    "student"
  ],
  "id": "VuPaItyqNFfZo7LFG0MB4JZVrU73",
  "referralCode": "RAMA-ITYQNF",
  "name": "Ramachandran M M",
  "hasProfile": true
}
```

---

