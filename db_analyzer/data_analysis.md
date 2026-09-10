# Firestore Data Dump

Generated on: 2026-09-10T13:58:31.523Z

This file contains the raw data from all documents in the database to help trace foreign keys and logic.

## Collection: `applications`

### Document: `HBMTd1d4yjfAC976JEKS`
```json
{
  "applicationDocId": "HBMTd1d4yjfAC976JEKS",
  "applicationId": "MTALYPGX3",
  "tutorDocId": "Va1weJ2oPGdsYOyUCZCZX9LAu9V2",
  "tutorName": "Krishna",
  "requestDocId": "",
  "parentDocId": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "studentDocId": "Py6laeTf2k0IdXVJ8Mma",
  "groupDocId": "E3BBBHUMIY5Ypo5BmBG3",
  "studentDocIds": [
    "Py6laeTf2k0IdXVJ8Mma",
    "YTuHh83hmE6j5qcBxFXa"
  ],
  "studentName": "Group: Abhilash V, Nikhil R Nambiar",
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
    "_seconds": 1788860801,
    "_nanoseconds": 658000000
  },
  "trackingId": "APP000001",
  "demoPaymentPaid": true,
  "proposedDate": "2026-09-10",
  "proposedTime": "13:15",
  "demoDate": "2026-09-10",
  "demoTime": "13:15",
  "lastUpdatedBy": "teacher",
  "updatedAt": {
    "_seconds": 1789026545,
    "_nanoseconds": 29000000
  },
  "feePaid": false,
  "status": "tuition_started",
  "startDate": {
    "_seconds": 1789026575,
    "_nanoseconds": 0
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

### Document: `E3BBBHUMIY5Ypo5BmBG3`
```json
{
  "groupId": "MTGUBFH3G",
  "teacherGenderPreference": "No Preference",
  "groupDocId": "E3BBBHUMIY5Ypo5BmBG3",
  "latitude": null,
  "daysPerWeek": "2 Days/Week",
  "preferredTimeRange": "Evening (4 PM - 8 PM)",
  "area": "",
  "status": "active",
  "specificDays": [
    "Saturday",
    "Sunday"
  ],
  "longitude": null,
  "city": "",
  "parentDocId": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "createdAt": 1788855295067,
  "mode": "Online",
  "studentDocIds": [
    "Py6laeTf2k0IdXVJ8Mma",
    "YTuHh83hmE6j5qcBxFXa"
  ]
}
```

### Document: `X49IiepR5EGJ8sTM7fDd`
```json
{
  "specificDays": [
    "Saturday",
    "Sunday"
  ],
  "groupId": "MTG6OBI26",
  "groupDocId": "X49IiepR5EGJ8sTM7fDd",
  "status": "active",
  "createdAt": 1789037548885,
  "longitude": null,
  "preferredTimeRange": "Evening (4 PM - 8 PM)",
  "daysPerWeek": "2 Days/Week",
  "latitude": null,
  "teacherGenderPreference": "Female",
  "parentDocId": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "city": "560076",
  "studentDocIds": [
    "jIG8TaCcfV3KdUnb2EyZ",
    "Z8SqaGMd7RMHl35wJxMK"
  ],
  "area": "177/A, First Floor, 2nd Cross, Surabhinagar, Bengaluru, 560076, 560076",
  "mode": "Offline (Home Tuition)",
  "parentId": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "updatedAt": 1789045906883
}
```

---

## Collection: `id_counters`

### Document: `application`
```json
{
  "lastValue": 1
}
```

### Document: `parent`
```json
{
  "lastValue": 2
}
```

### Document: `student`
```json
{
  "lastValue": 7
}
```

### Document: `tuition_request`
```json
{
  "lastValue": 6
}
```

### Document: `tutor`
```json
{
  "lastValue": 3
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

### Document: `YY1TJevQdyQcv3G9I4STyxTnaAj1`
```json
{
  "whatsapp": "9148018041",
  "phone": "9148018041",
  "name": "Ramachandran M M",
  "parentDocId": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "authUid": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "email": "nikhil.4002.50.82@gmail.com",
  "parentId": "MTPNCYZ9P",
  "platformUserId": "MTP000002"
}
```

---

## Collection: `payments`

### Document: `13Aa6JfM6m7wMoS22NNr`
```json
{
  "razorpayOrderId": "order_TaIEUGeZjsPr0i",
  "applicationDocId": "HBMTd1d4yjfAC976JEKS",
  "userId": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "amount": 7080,
  "walletDiscountApplied": 0,
  "currency": "INR",
  "status": "created",
  "type": "tuition",
  "isRemoval": false,
  "createdAt": {
    "_seconds": 1789034365,
    "_nanoseconds": 900000000
  },
  "updatedAt": {
    "_seconds": 1789034365,
    "_nanoseconds": 900000000
  }
}
```

### Document: `BjR0LhRmmLPueU3eLwZZ`
```json
{
  "razorpayOrderId": "order_TaFt4w3ks4tg9G",
  "applicationDocId": "HBMTd1d4yjfAC976JEKS",
  "userId": "Va1weJ2oPGdsYOyUCZCZX9LAu9V2",
  "amount": 354,
  "walletDiscountApplied": 0,
  "currency": "INR",
  "type": "demo",
  "isRemoval": false,
  "createdAt": {
    "_seconds": 1789026106,
    "_nanoseconds": 684000000
  },
  "verifiedAt": {
    "_seconds": 1789026136,
    "_nanoseconds": 857000000
  },
  "razorpayPaymentId": "pay_TaFtIYuXxemOor",
  "verifiedVia": "client",
  "status": "paid",
  "updatedAt": {
    "_seconds": 1789026137,
    "_nanoseconds": 298000000
  }
}
```

### Document: `L6xTFolHvUB8HQLKBIVm`
```json
{
  "razorpayOrderId": "order_TaHr15pct63TeU",
  "applicationDocId": "HBMTd1d4yjfAC976JEKS",
  "userId": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "amount": 7080,
  "walletDiscountApplied": 0,
  "currency": "INR",
  "status": "created",
  "type": "tuition",
  "isRemoval": false,
  "createdAt": {
    "_seconds": 1789033032,
    "_nanoseconds": 748000000
  },
  "updatedAt": {
    "_seconds": 1789033032,
    "_nanoseconds": 748000000
  }
}
```

### Document: `xqsoIAxjS5FxVorJgcE7`
```json
{
  "razorpayOrderId": "order_TZUxGXyyMzcBpU",
  "applicationDocId": "HBMTd1d4yjfAC976JEKS",
  "userId": "Va1weJ2oPGdsYOyUCZCZX9LAu9V2",
  "amount": 354,
  "walletDiscountApplied": 0,
  "currency": "INR",
  "status": "created",
  "type": "demo",
  "isRemoval": false,
  "createdAt": {
    "_seconds": 1788860830,
    "_nanoseconds": 274000000
  },
  "updatedAt": {
    "_seconds": 1788860830,
    "_nanoseconds": 274000000
  }
}
```

---

## Collection: `pending_tuition_fees`

### Document: `HBMTd1d4yjfAC976JEKS`
```json
{
  "applicationDocId": "HBMTd1d4yjfAC976JEKS",
  "studentDocId": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "tutorDocId": "Va1weJ2oPGdsYOyUCZCZX9LAu9V2",
  "status": "pending",
  "amount": 6000,
  "startDate": {
    "_seconds": 1789026575,
    "_nanoseconds": 709000000
  }
}
```

---

## Collection: `referrals`

### Document: `kOWox4VxtCPTl1FaLQTJ`
```json
{
  "createdAt": 1788855329308,
  "referralCode": "RAMA-JEVQDY",
  "estimatedReward": 0,
  "referralType": "teacher",
  "referrerName": "Ramachandran M M",
  "referrerId": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "referredUserId": "Va1weJ2oPGdsYOyUCZCZX9LAu9V2",
  "status": "pending",
  "referredUserName": "Krishna"
}
```

---

## Collection: `students`

### Document: `Py6laeTf2k0IdXVJ8Mma`
```json
{
  "dob": "",
  "budget": 3000,
  "name": "Abhilash V",
  "email": "nikhil.4002.50.82@gmail.com",
  "board": "CBSE",
  "subjects": [
    "Mathematics",
    "Science"
  ],
  "classLevel": "6th Standard",
  "gender": "Male",
  "category": "school",
  "studentType": "School Student",
  "parentDocId": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "technologies": [],
  "guardianName": "Ramachandran M M",
  "studentId": "MTSCCZTA5",
  "whatsappNumber": "9148018041",
  "id": "Py6laeTf2k0IdXVJ8Mma",
  "phoneNumber": "9148018041",
  "languages": [],
  "createdAt": 1788855294298,
  "groupDocId": "E3BBBHUMIY5Ypo5BmBG3",
  "platformUserId": "MTS000003",
  "isAvailable": false,
  "pendingRequests": []
}
```

### Document: `YTuHh83hmE6j5qcBxFXa`
```json
{
  "technologies": [],
  "guardianName": "Ramachandran M M",
  "gender": "Male",
  "whatsappNumber": "9148018041",
  "classLevel": "8th Standard",
  "createdAt": 1788855294298,
  "board": "ICSE",
  "languages": [],
  "email": "nikhil.4002.50.82@gmail.com",
  "studentType": "School Student",
  "parentDocId": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "budget": 3000,
  "studentId": "MTS49RUHN",
  "name": "Nikhil R Nambiar",
  "subjects": [
    "Mathematics"
  ],
  "phoneNumber": "9148018041",
  "category": "school",
  "id": "YTuHh83hmE6j5qcBxFXa",
  "dob": "",
  "groupDocId": "E3BBBHUMIY5Ypo5BmBG3",
  "platformUserId": "MTS000002",
  "isAvailable": false,
  "pendingRequests": []
}
```

### Document: `Z8SqaGMd7RMHl35wJxMK`
```json
{
  "guardianName": "Ramachandran M M",
  "whatsappNumber": "9148018041",
  "parentDocId": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "budget": 3000,
  "subjects": [
    "Mathematics"
  ],
  "createdAt": 1789038896481,
  "isAvailable": true,
  "studentId": "MTSRO671D",
  "id": "Z8SqaGMd7RMHl35wJxMK",
  "dob": "",
  "gender": "Female",
  "board": "CBSE",
  "languages": [],
  "technologies": [],
  "email": "nikhil.4002.50.82@gmail.com",
  "studentType": "School Student",
  "classLevel": "6th Standard",
  "phoneNumber": "9148018041",
  "name": "Kushi",
  "category": "school",
  "platformUserId": "MTS000005",
  "groupDocId": "X49IiepR5EGJ8sTM7fDd"
}
```

### Document: `jIG8TaCcfV3KdUnb2EyZ`
```json
{
  "email": "nikhil.4002.50.82@gmail.com",
  "category": "school",
  "languages": [],
  "gender": "Female",
  "parentDocId": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "id": "jIG8TaCcfV3KdUnb2EyZ",
  "guardianName": "Ramachandran M M",
  "studentType": "School Student",
  "whatsappNumber": "9148018041",
  "subjects": [
    "Mathematics",
    "Science"
  ],
  "technologies": [],
  "isAvailable": true,
  "name": "Chinju",
  "classLevel": "10th Standard",
  "createdAt": 1789037547470,
  "board": "CBSE",
  "phoneNumber": "9148018041",
  "dob": "",
  "budget": 4000,
  "studentId": "MTS8HFZ7L",
  "groupDocId": "X49IiepR5EGJ8sTM7fDd",
  "platformUserId": "MTS000004"
}
```

---

## Collection: `tuition_requests`

### Document: `3J5btPIz7UO8xDxveD5u`
```json
{
  "parentDocId": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "city": "560076",
  "longitude": null,
  "latitude": null,
  "specificDays": [
    "Saturday",
    "Sunday"
  ],
  "requestId": "REQ2WCF5P",
  "mode": "Offline",
  "daysPerWeek": "2 Days/Week",
  "combinedSubjects": [
    "Mathematics",
    "Science"
  ],
  "category": "school",
  "area": "177/A, First Floor, 2nd Cross, Surabhinagar, Bengaluru, 560076",
  "preferredTimeRange": "Evening (4 PM - 8 PM)",
  "status": "open",
  "combinedLanguages": [],
  "combinedTechnologies": [],
  "teacherGenderPreference": "Female",
  "groupDocId": "X49IiepR5EGJ8sTM7fDd",
  "createdAt": 1789037549035,
  "acceptedTutorId": "",
  "trackingId": "REQ000003",
  "parentId": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "studentsDetails": [
    {
      "languages": [],
      "id": "Z8SqaGMd7RMHl35wJxMK",
      "technologies": [],
      "board": "CBSE",
      "budget": 3000,
      "name": "Kushi",
      "classLevel": "6th Standard",
      "subjects": [
        "Mathematics"
      ]
    },
    {
      "classLevel": "10th Standard",
      "budget": 4000,
      "id": "jIG8TaCcfV3KdUnb2EyZ",
      "languages": [],
      "board": "CBSE",
      "name": "Chinju",
      "subjects": [
        "Mathematics",
        "Science"
      ],
      "technologies": []
    }
  ],
  "combinedBudget": 7000
}
```

### Document: `5oDB5h3FuLajYqeF71us`
```json
{
  "longitude": null,
  "combinedSubjects": [
    "Mathematics",
    "Science"
  ],
  "parentDocId": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "specificDays": [],
  "combinedBudget": 3000,
  "status": "open",
  "daysPerWeek": "",
  "combinedLanguages": [],
  "teacherGenderPreference": "No Preference",
  "studentsDetails": [
    {
      "name": "Manish",
      "budget": 3000,
      "subjects": [
        "Mathematics",
        "Science"
      ],
      "languages": [],
      "id": "y3el5qzAsTvZ0xBWjoIL",
      "classLevel": "8th Standard",
      "technologies": [],
      "board": "CBSE"
    }
  ],
  "groupDocId": "fxh5gz6tGcHJvUKel7Tc",
  "mode": "",
  "city": "",
  "createdAt": 1789039052138,
  "area": "",
  "acceptedTutorId": "",
  "latitude": null,
  "requestId": "REQLLS5JO",
  "preferredTimeRange": "",
  "combinedTechnologies": [],
  "category": "school",
  "trackingId": "REQ000005"
}
```

### Document: `ftw9DBYaWYePz6pKvIfR`
```json
{
  "city": "",
  "category": "school",
  "createdAt": 1788855295232,
  "mode": "Online",
  "specificDays": [
    "Saturday",
    "Sunday"
  ],
  "parentDocId": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "latitude": null,
  "combinedSubjects": [
    "Mathematics",
    "Science"
  ],
  "longitude": null,
  "acceptedTutorId": "",
  "area": "",
  "combinedLanguages": [],
  "requestId": "REQNWSSUO",
  "teacherGenderPreference": "No Preference",
  "daysPerWeek": "2 Days/Week",
  "groupDocId": "E3BBBHUMIY5Ypo5BmBG3",
  "combinedBudget": 6000,
  "preferredTimeRange": "Evening (4 PM - 8 PM)",
  "status": "open",
  "combinedTechnologies": [],
  "trackingId": "REQ000002",
  "studentsDetails": [
    {
      "board": "CBSE",
      "languages": [],
      "id": "Py6laeTf2k0IdXVJ8Mma",
      "name": "Abhilash V",
      "classLevel": "6th Standard",
      "subjects": [
        "Mathematics",
        "Science"
      ],
      "technologies": [],
      "budget": 3000
    },
    {
      "subjects": [
        "Mathematics"
      ],
      "technologies": [],
      "name": "Nikhil R Nambiar",
      "budget": 3000,
      "languages": [],
      "board": "ICSE",
      "classLevel": "8th Standard",
      "id": "YTuHh83hmE6j5qcBxFXa"
    }
  ],
  "parentId": "YY1TJevQdyQcv3G9I4STyxTnaAj1"
}
```

---

## Collection: `tutors`

### Document: `Va1weJ2oPGdsYOyUCZCZX9LAu9V2`
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
    "ICSE",
    "CBSE"
  ],
  "experience": "Less than 1 Year",
  "knownLanguages": [],
  "feeRange": "7000",
  "mode": "Online",
  "resumeUrl": "https://firebasestorage.googleapis.com/v0/b/tutor-app-1e394.firebasestorage.app/o/tutor_documents%2FVa1weJ2oPGdsYOyUCZCZX9LAu9V2%2Fresume_1788857402601_Nikhil_R_Nambiar.pdf?alt=media&token=6b8047d0-e75d-45f0-931a-7304fa2452fd",
  "createdAt": 1788857406625,
  "price": 0,
  "travelDistance": "",
  "hasProfile": true,
  "preferredTimeRange": "",
  "email": "krishnarnambiar760@gmail.com",
  "schoolNames": "",
  "longitude": 0,
  "area": "",
  "resume": {
    "fileName": "Nikhil_R_Nambiar.pdf",
    "uploadedAt": 1788857406624,
    "url": "https://firebasestorage.googleapis.com/v0/b/tutor-app-1e394.firebasestorage.app/o/tutor_documents%2FVa1weJ2oPGdsYOyUCZCZX9LAu9V2%2Fresume_1788857402601_Nikhil_R_Nambiar.pdf?alt=media&token=6b8047d0-e75d-45f0-931a-7304fa2452fd"
  },
  "tutorId": "MTTJD39VP",
  "address": "",
  "verificationSubmittedAt": 1788857406624,
  "verificationStatus": "unsubmitted",
  "subjects": [
    "Biology",
    "Chemistry",
    "Mathematics",
    "Science"
  ],
  "languagesTaught": [],
  "technologies": [],
  "qualification": "B.E / B.Tech",
  "verificationDocs": {},
  "phone": "9148018043",
  "name": "Krishna",
  "teachingApproach": "",
  "preferredLocations": "",
  "category": "school",
  "authUid": "Va1weJ2oPGdsYOyUCZCZX9LAu9V2",
  "platformUserId": "MTT000002",
  "upiId": "9148018043@kotakbank",
  "weeklyQuota": {
    "lastUpdated": {
      "_seconds": 1788860801,
      "_nanoseconds": 658000000
    },
    "weekStartDate": "2026-09-06",
    "tokensUsed": 1
  },
  "pendingRequests": []
}
```

### Document: `u2X0Y9VX8CQJU3xJoFQfWhBKfqE2`
```json
{
  "whatsapp": "8618242887",
  "studentCount": "4",
  "occupation": "Full-Time Teacher",
  "gender": "Female",
  "city": "Bangalore",
  "classes": [
    "6th - 8th",
    "9th - 10th",
    "1st - 5th"
  ],
  "latitude": 0,
  "rating": 0,
  "boards": [
    "ICSE",
    "CBSE",
    "State Board"
  ],
  "experience": "Less than 1 Year",
  "knownLanguages": [],
  "feeRange": "9000",
  "mode": "Offline",
  "resumeUrl": "https://firebasestorage.googleapis.com/v0/b/tutor-app-1e394.firebasestorage.app/o/tutor_documents%2Fu2X0Y9VX8CQJU3xJoFQfWhBKfqE2%2Fresume_1789046049463_Nikhil_R_Nambiar.pdf?alt=media&token=92e6deca-28bc-4535-8ff7-b27ff300655b",
  "createdAt": 1789046053843,
  "price": 0,
  "travelDistance": "10km",
  "hasProfile": true,
  "preferredTimeRange": "",
  "email": "varshinivarsh1304@gmail.com",
  "schoolNames": "",
  "longitude": 0,
  "area": "No 8, Saraswathipuram Halasuru, 4th Main 4th Cross Shamanna Gowda Layout Bangalore North Bangalore Karnataka India, 560008",
  "resume": {
    "fileName": "Nikhil_R_Nambiar.pdf",
    "uploadedAt": 1789046053842,
    "url": "https://firebasestorage.googleapis.com/v0/b/tutor-app-1e394.firebasestorage.app/o/tutor_documents%2Fu2X0Y9VX8CQJU3xJoFQfWhBKfqE2%2Fresume_1789046049463_Nikhil_R_Nambiar.pdf?alt=media&token=92e6deca-28bc-4535-8ff7-b27ff300655b"
  },
  "tutorId": "MTTUB3F2T",
  "address": "No 8, Saraswathipuram Halasuru, 4th Main 4th Cross Shamanna Gowda Layout Bangalore North Bangalore Karnataka India, 560008, Bangalore, 560008",
  "verificationSubmittedAt": 1789046053843,
  "verificationStatus": "unsubmitted",
  "subjects": [
    "Biology",
    "Chemistry",
    "Mathematics",
    "Science",
    "Physics",
    "Social Science",
    "Social Studies",
    "Second Language",
    "Kannada",
    "Hindi/Third Language",
    "Hindi",
    "Geography",
    "English Literature",
    "English Language",
    "English",
    "Computer",
    "Computer Applications",
    "EVS",
    "Civics"
  ],
  "languagesTaught": [],
  "technologies": [],
  "qualification": "B.E / B.Tech",
  "verificationDocs": {},
  "phone": "8618242887",
  "name": "Varshini P",
  "teachingApproach": "",
  "preferredLocations": "J P Nagar",
  "category": "school",
  "authUid": "u2X0Y9VX8CQJU3xJoFQfWhBKfqE2",
  "platformUserId": "MTT000003"
}
```

---

## Collection: `users`

### Document: `Va1weJ2oPGdsYOyUCZCZX9LAu9V2`
```json
{
  "roles": [
    "teacher"
  ],
  "id": "Va1weJ2oPGdsYOyUCZCZX9LAu9V2",
  "email": "krishnarnambiar760@gmail.com",
  "referrerName": "Ramachandran M M",
  "referredBy": "RAMA-JEVQDY",
  "referralCode": "KRIS-EJ2OPG",
  "name": "Krishna",
  "hasProfile": true,
  "platformUserId": "MTT000002",
  "upiId": "9148018043@kotakbank"
}
```

### Document: `YY1TJevQdyQcv3G9I4STyxTnaAj1`
```json
{
  "email": "nikhil.4002.50.82@gmail.com",
  "referredBy": "",
  "id": "YY1TJevQdyQcv3G9I4STyxTnaAj1",
  "roles": [
    "student"
  ],
  "referralCode": "RAMA-JEVQDY",
  "name": "Ramachandran M M",
  "hasProfile": true,
  "platformUserId": "MTP000002",
  "upiId": "9148018043@kotakbank"
}
```

### Document: `u2X0Y9VX8CQJU3xJoFQfWhBKfqE2`
```json
{
  "id": "u2X0Y9VX8CQJU3xJoFQfWhBKfqE2",
  "referredBy": "",
  "name": "Varshini P",
  "roles": [
    "teacher"
  ],
  "email": "varshinivarsh1304@gmail.com",
  "referralCode": "VARS-Y9VX8C",
  "hasProfile": true,
  "platformUserId": "MTT000003"
}
```

---

