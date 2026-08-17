# Firestore Data Dump

Generated on: 2026-08-17T17:36:50.615Z

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

### Document: `LGHyQqaXnEFnwkEja1s8`
```json
{
  "applicationId": "APP6DDN1I",
  "tutorDocId": "0dVv3aHqZ1UQXFSMY38Mfb9XKHu1",
  "tutorName": "Ram",
  "requestDocId": "",
  "parentDocId": "zPFD1EnIy8g4r41MeB9jPi661dG3",
  "studentDocId": "E1NgXeWf5fYJatvFyjDc",
  "groupDocId": "BF0OVQ8AFarlfq0mf9rj",
  "studentDocIds": [
    "E1NgXeWf5fYJatvFyjDc"
  ],
  "studentName": "Kushi",
  "currentOffer": 3000,
  "finalPrice": 3000,
  "initialBudget": 3000,
  "absoluteMin": 3000,
  "absoluteMax": 4200,
  "initiator": "teacher",
  "source": "direct",
  "category": "school",
  "demoHours": "Flexible",
  "createdAt": 1786708597932,
  "demoPaymentPaid": true,
  "proposedDate": "2026-08-15",
  "proposedTime": "18:30",
  "lastUpdatedBy": "student",
  "demoDate": "2026-08-15",
  "demoTime": "18:30",
  "status": "demo_scheduled",
  "updatedAt": 1786711806712
}
```

### Document: `ZUqzWRidAJ1P3y6jDawG`
```json
{
  "applicationId": "APPQ9LUTZ",
  "tutorDocId": "0dVv3aHqZ1UQXFSMY38Mfb9XKHu1",
  "tutorName": "Ram",
  "parentDocId": "zPFD1EnIy8g4r41MeB9jPi661dG3",
  "groupDocId": "xsNzUkm3bn1PlZbmPti4",
  "studentDocIds": [
    "fg8BIutPeoGSnmh2IaRI",
    "uXA7ER7mBUgd7zjKdyLs",
    "uuBCDiq0KjlGBmjtfefA"
  ],
  "studentName": "Group: Nikhil R Nambiar, Abhilash V, Vilas R Naik",
  "currentOffer": 6000,
  "finalPrice": 6000,
  "initialBudget": 6000,
  "absoluteMin": 3600,
  "absoluteMax": 6000,
  "initiator": "student",
  "lastUpdatedBy": "student",
  "source": "direct",
  "category": "school",
  "mode": "Online",
  "demoHours": "1 Hour/Day",
  "createdAt": 1786710948310,
  "declinedAt": 1786715785165,
  "status": "declined",
  "updatedAt": 1786715785165
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

### Document: `3ilXPGP8BKN1vsGHfgkx`
```json
{
  "groupDocId": "3ilXPGP8BKN1vsGHfgkx",
  "parentDocId": "Zo07IekBlnRwCJIiVdv3Dd3CY8E2",
  "studentDocIds": [
    "oXN3sjjsOqZ4AZBsDv0d"
  ],
  "mode": "Online",
  "area": "",
  "city": "",
  "latitude": null,
  "longitude": null,
  "teacherGenderPreference": "Female",
  "preferredTimeRange": "1 Hour/Day",
  "daysPerWeek": "5 Days/Week",
  "specificDays": [
    "Monday",
    "Tuesday",
    "Friday",
    "Wednesday",
    "Thursday"
  ],
  "status": "active",
  "createdAt": 1786985848421
}
```

### Document: `BF0OVQ8AFarlfq0mf9rj`
```json
{
  "groupDocId": "BF0OVQ8AFarlfq0mf9rj",
  "parentDocId": "zPFD1EnIy8g4r41MeB9jPi661dG3",
  "studentDocIds": [
    "E1NgXeWf5fYJatvFyjDc"
  ],
  "mode": "Online",
  "area": "",
  "city": "",
  "latitude": null,
  "longitude": null,
  "teacherGenderPreference": "Female",
  "preferredTimeRange": "1 Hour/Day",
  "daysPerWeek": "5 Days/Week",
  "specificDays": [
    "Monday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Tuesday"
  ],
  "status": "active",
  "createdAt": 1786706541339
}
```

### Document: `GK36WcTxYz1AmT1x4oP5`
```json
{
  "groupDocId": "GK36WcTxYz1AmT1x4oP5",
  "parentDocId": "Zo07IekBlnRwCJIiVdv3Dd3CY8E2",
  "studentDocIds": [
    "2ah10ToxLiGPYNlmVan8"
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
    "Friday",
    "Thursday"
  ],
  "status": "active",
  "createdAt": 1786985848742
}
```

### Document: `UOy1EB97KEMioCvNNjKr`
```json
{
  "groupDocId": "UOy1EB97KEMioCvNNjKr",
  "parentDocId": "zPFD1EnIy8g4r41MeB9jPi661dG3",
  "studentDocIds": [
    "joOvfrcDcZNOI33bIj5H"
  ],
  "mode": "Online",
  "area": "",
  "city": "",
  "latitude": null,
  "longitude": null,
  "teacherGenderPreference": "Female",
  "preferredTimeRange": "1 Hour/Day",
  "daysPerWeek": "5 Days/Week",
  "specificDays": [
    "Wednesday",
    "Thursday",
    "Friday",
    "Monday",
    "Tuesday"
  ],
  "status": "active",
  "createdAt": 1786712099978
}
```

### Document: `xsNzUkm3bn1PlZbmPti4`
```json
{
  "groupDocId": "xsNzUkm3bn1PlZbmPti4",
  "parentDocId": "zPFD1EnIy8g4r41MeB9jPi661dG3",
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
    "Thursday",
    "Monday"
  ],
  "status": "active",
  "createdAt": 1786705108207,
  "studentDocIds": [
    "fg8BIutPeoGSnmh2IaRI",
    "uXA7ER7mBUgd7zjKdyLs",
    "uuBCDiq0KjlGBmjtfefA"
  ]
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

### Document: `Zo07IekBlnRwCJIiVdv3Dd3CY8E2`
```json
{
  "parentId": "MTPHEWTR4",
  "authUid": "Zo07IekBlnRwCJIiVdv3Dd3CY8E2",
  "whatsapp": "8618242887",
  "phone": "8618242887",
  "name": "Varshini P",
  "parentDocId": "Zo07IekBlnRwCJIiVdv3Dd3CY8E2",
  "email": "varshinivarsh1304@gmail.com"
}
```

### Document: `zPFD1EnIy8g4r41MeB9jPi661dG3`
```json
{
  "parentId": "MTPM9622F",
  "authUid": "zPFD1EnIy8g4r41MeB9jPi661dG3",
  "whatsapp": "9148018043",
  "phone": "9148018043",
  "name": "Ramachandran M M",
  "parentDocId": "zPFD1EnIy8g4r41MeB9jPi661dG3",
  "email": "nikhil.4002.50.82@gmail.com",
  "dailyUsage": {
    "date": "2026-08-14",
    "count": 1
  }
}
```

---

## Collection: `students`

### Document: `2ah10ToxLiGPYNlmVan8`
```json
{
  "id": "2ah10ToxLiGPYNlmVan8",
  "guardianName": "Varshini P",
  "dob": "",
  "parentDocId": "Zo07IekBlnRwCJIiVdv3Dd3CY8E2",
  "category": "school",
  "name": "Tharun Kumar P",
  "gender": "Male",
  "phoneNumber": "8618242887",
  "whatsappNumber": "8618242887",
  "email": "varshinivarsh1304@gmail.com",
  "studentType": "School Student",
  "classLevel": "6th Standard",
  "board": "CBSE",
  "subjects": [
    "Mathematics"
  ],
  "budget": 4000,
  "technologies": [],
  "languages": [],
  "isAvailable": true,
  "createdAt": 1786985848096,
  "groupDocId": "GK36WcTxYz1AmT1x4oP5"
}
```

### Document: `E1NgXeWf5fYJatvFyjDc`
```json
{
  "id": "E1NgXeWf5fYJatvFyjDc",
  "guardianName": "Ramachandran M M",
  "dob": "",
  "parentDocId": "zPFD1EnIy8g4r41MeB9jPi661dG3",
  "category": "school",
  "name": "Kushi",
  "gender": "Female",
  "phoneNumber": "9148018043",
  "whatsappNumber": "9148018043",
  "email": "nikhil.4002.50.82@gmail.com",
  "studentType": "School Student",
  "classLevel": "6th Standard",
  "board": "CBSE",
  "subjects": [
    "Mathematics",
    "Science"
  ],
  "budget": 3000,
  "technologies": [],
  "languages": [],
  "createdAt": 1786706540964,
  "groupDocId": "BF0OVQ8AFarlfq0mf9rj",
  "pendingRequests": [],
  "isAvailable": false
}
```

### Document: `fg8BIutPeoGSnmh2IaRI`
```json
{
  "id": "fg8BIutPeoGSnmh2IaRI",
  "guardianName": "Ramachandran M M",
  "dob": "",
  "parentDocId": "zPFD1EnIy8g4r41MeB9jPi661dG3",
  "category": "school",
  "name": "Nikhil R Nambiar",
  "gender": "Male",
  "phoneNumber": "9148018043",
  "whatsappNumber": "9148018043",
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
  "isAvailable": true,
  "createdAt": 1786705107441,
  "groupDocId": "xsNzUkm3bn1PlZbmPti4",
  "pendingRequests": []
}
```

### Document: `joOvfrcDcZNOI33bIj5H`
```json
{
  "id": "joOvfrcDcZNOI33bIj5H",
  "guardianName": "Ramachandran M M",
  "dob": "",
  "parentDocId": "zPFD1EnIy8g4r41MeB9jPi661dG3",
  "category": "school",
  "name": "Chinju",
  "gender": "Female",
  "phoneNumber": "9148018043",
  "whatsappNumber": "9148018043",
  "email": "nikhil.4002.50.82@gmail.com",
  "studentType": "School Student",
  "classLevel": "10th Standard",
  "board": "CBSE",
  "subjects": [
    "Science",
    "Mathematics"
  ],
  "budget": 4000,
  "technologies": [],
  "languages": [],
  "isAvailable": true,
  "createdAt": 1786712099619,
  "groupDocId": "UOy1EB97KEMioCvNNjKr"
}
```

### Document: `oXN3sjjsOqZ4AZBsDv0d`
```json
{
  "id": "oXN3sjjsOqZ4AZBsDv0d",
  "guardianName": "Varshini P",
  "dob": "",
  "parentDocId": "Zo07IekBlnRwCJIiVdv3Dd3CY8E2",
  "category": "school",
  "name": "Supriya",
  "gender": "Female",
  "phoneNumber": "8618242887",
  "whatsappNumber": "8618242887",
  "email": "varshinivarsh1304@gmail.com",
  "studentType": "School Student",
  "classLevel": "10th Standard",
  "board": "CBSE",
  "subjects": [
    "Mathematics"
  ],
  "budget": 4000,
  "technologies": [],
  "languages": [],
  "isAvailable": true,
  "createdAt": 1786985848096,
  "groupDocId": "3ilXPGP8BKN1vsGHfgkx"
}
```

### Document: `uXA7ER7mBUgd7zjKdyLs`
```json
{
  "id": "uXA7ER7mBUgd7zjKdyLs",
  "guardianName": "Ramachandran M M",
  "dob": "",
  "parentDocId": "zPFD1EnIy8g4r41MeB9jPi661dG3",
  "category": "school",
  "name": "Abhilash V",
  "gender": "Male",
  "phoneNumber": "9148018043",
  "whatsappNumber": "9148018043",
  "email": "nikhil.4002.50.82@gmail.com",
  "studentType": "School Student",
  "classLevel": "6th Standard",
  "board": "CBSE",
  "subjects": [
    "Mathematics",
    "Science"
  ],
  "budget": 2500,
  "technologies": [],
  "languages": [],
  "isAvailable": true,
  "createdAt": 1786705107441,
  "groupDocId": "xsNzUkm3bn1PlZbmPti4",
  "pendingRequests": []
}
```

### Document: `uuBCDiq0KjlGBmjtfefA`
```json
{
  "id": "uuBCDiq0KjlGBmjtfefA",
  "guardianName": "Ramachandran M M",
  "dob": "",
  "parentDocId": "zPFD1EnIy8g4r41MeB9jPi661dG3",
  "category": "school",
  "name": "Vilas R Naik",
  "gender": "Male",
  "phoneNumber": "9148018043",
  "whatsappNumber": "9148018043",
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
  "isAvailable": true,
  "createdAt": 1786705107441,
  "groupDocId": "xsNzUkm3bn1PlZbmPti4",
  "pendingRequests": []
}
```

---

## Collection: `tuition_requests`

### Document: `9b3BfYQTo4VvK21irAw8`
```json
{
  "requestId": "REQ03HURL",
  "groupDocId": "BF0OVQ8AFarlfq0mf9rj",
  "parentDocId": "zPFD1EnIy8g4r41MeB9jPi661dG3",
  "category": "school",
  "mode": "Online",
  "area": "",
  "city": "",
  "latitude": null,
  "longitude": null,
  "teacherGenderPreference": "Female",
  "preferredTimeRange": "1 Hour/Day",
  "daysPerWeek": "5 Days/Week",
  "specificDays": [
    "Monday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Tuesday"
  ],
  "studentsDetails": [
    {
      "id": "E1NgXeWf5fYJatvFyjDc",
      "name": "Kushi",
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
  "combinedSubjects": [
    "Mathematics",
    "Science"
  ],
  "combinedTechnologies": [],
  "combinedLanguages": [],
  "combinedBudget": 3000,
  "status": "open",
  "acceptedTutorId": "",
  "createdAt": 1786706541461
}
```

### Document: `I7kzwEcV4Gig5jqEXoeU`
```json
{
  "requestId": "REQVVQBAH",
  "groupDocId": "GK36WcTxYz1AmT1x4oP5",
  "parentDocId": "Zo07IekBlnRwCJIiVdv3Dd3CY8E2",
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
    "Friday",
    "Thursday"
  ],
  "studentsDetails": [
    {
      "id": "2ah10ToxLiGPYNlmVan8",
      "name": "Tharun Kumar P",
      "classLevel": "6th Standard",
      "board": "CBSE",
      "subjects": [
        "Mathematics"
      ],
      "technologies": [],
      "languages": [],
      "budget": 4000
    }
  ],
  "combinedSubjects": [
    "Mathematics"
  ],
  "combinedTechnologies": [],
  "combinedLanguages": [],
  "combinedBudget": 4000,
  "status": "open",
  "acceptedTutorId": "",
  "createdAt": 1786985848860
}
```

### Document: `POZKZnXcaXZLGkKebuuB`
```json
{
  "requestId": "REQ8CB8NU",
  "groupDocId": "3ilXPGP8BKN1vsGHfgkx",
  "parentDocId": "Zo07IekBlnRwCJIiVdv3Dd3CY8E2",
  "category": "school",
  "mode": "Online",
  "area": "",
  "city": "",
  "latitude": null,
  "longitude": null,
  "teacherGenderPreference": "Female",
  "preferredTimeRange": "1 Hour/Day",
  "daysPerWeek": "5 Days/Week",
  "specificDays": [
    "Monday",
    "Tuesday",
    "Friday",
    "Wednesday",
    "Thursday"
  ],
  "studentsDetails": [
    {
      "id": "oXN3sjjsOqZ4AZBsDv0d",
      "name": "Supriya",
      "classLevel": "10th Standard",
      "board": "CBSE",
      "subjects": [
        "Mathematics"
      ],
      "technologies": [],
      "languages": [],
      "budget": 4000
    }
  ],
  "combinedSubjects": [
    "Mathematics"
  ],
  "combinedTechnologies": [],
  "combinedLanguages": [],
  "combinedBudget": 4000,
  "status": "open",
  "acceptedTutorId": "",
  "createdAt": 1786985848534
}
```

### Document: `dBVB3BIKhwEAnpW3zcVb`
```json
{
  "requestId": "REQDD83OT",
  "groupDocId": "xsNzUkm3bn1PlZbmPti4",
  "parentDocId": "zPFD1EnIy8g4r41MeB9jPi661dG3",
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
    "Thursday",
    "Monday"
  ],
  "combinedTechnologies": [],
  "combinedLanguages": [],
  "status": "open",
  "acceptedTutorId": "",
  "createdAt": 1786705108329,
  "groupId": "xsNzUkm3bn1PlZbmPti4",
  "parentId": "zPFD1EnIy8g4r41MeB9jPi661dG3",
  "studentsDetails": [
    {
      "id": "fg8BIutPeoGSnmh2IaRI",
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
      "id": "uXA7ER7mBUgd7zjKdyLs",
      "name": "Abhilash V",
      "classLevel": "6th Standard",
      "board": "CBSE",
      "subjects": [
        "Mathematics",
        "Science"
      ],
      "technologies": [],
      "languages": [],
      "budget": 2500
    },
    {
      "id": "uuBCDiq0KjlGBmjtfefA",
      "name": "Vilas R Naik",
      "classLevel": "10th Standard",
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
    "Mathematics",
    "Science"
  ],
  "combinedBudget": 8500
}
```

### Document: `iDaRFyoqbuUPixCQALWt`
```json
{
  "requestId": "REQNR953K",
  "groupDocId": "UOy1EB97KEMioCvNNjKr",
  "parentDocId": "zPFD1EnIy8g4r41MeB9jPi661dG3",
  "category": "school",
  "mode": "Online",
  "area": "",
  "city": "",
  "latitude": null,
  "longitude": null,
  "teacherGenderPreference": "Female",
  "preferredTimeRange": "1 Hour/Day",
  "daysPerWeek": "5 Days/Week",
  "specificDays": [
    "Wednesday",
    "Thursday",
    "Friday",
    "Monday",
    "Tuesday"
  ],
  "studentsDetails": [
    {
      "id": "joOvfrcDcZNOI33bIj5H",
      "name": "Chinju",
      "classLevel": "10th Standard",
      "board": "CBSE",
      "subjects": [
        "Science",
        "Mathematics"
      ],
      "technologies": [],
      "languages": [],
      "budget": 4000
    }
  ],
  "combinedSubjects": [
    "Science",
    "Mathematics"
  ],
  "combinedTechnologies": [],
  "combinedLanguages": [],
  "combinedBudget": 4000,
  "status": "open",
  "acceptedTutorId": "",
  "createdAt": 1786712100132
}
```

---

## Collection: `tutors`

### Document: `0dVv3aHqZ1UQXFSMY38Mfb9XKHu1`
```json
{
  "tutorId": "MTTFKM45O",
  "authUid": "0dVv3aHqZ1UQXFSMY38Mfb9XKHu1",
  "email": "ambisonuram@gmail.com",
  "whatsapp": "9148018041",
  "studentCount": "14",
  "occupation": "Full-Time Teacher",
  "gender": "Male",
  "city": "",
  "classes": [
    "6th - 8th",
    "9th - 10th",
    "1st - 5th"
  ],
  "latitude": 0,
  "rating": 0,
  "boards": [
    "CBSE",
    "ICSE"
  ],
  "experience": "Less than 1 Year",
  "knownLanguages": [],
  "feeRange": "6000",
  "mode": "Online",
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
    "English",
    "English Language",
    "English Literature",
    "Mathematics",
    "Science"
  ],
  "languagesTaught": [],
  "technologies": [],
  "qualification": "B.Sc",
  "phone": "9148018041",
  "name": "Ram",
  "teachingApproach": "",
  "preferredLocations": "",
  "category": "school",
  "dailyUsage": {
    "date": "2026-08-14",
    "count": 1
  },
  "pendingRequests": []
}
```

### Document: `2TOQOnqT4RZvSTY9U6i8vmB8g843`
```json
{
  "tutorId": "MTT6KFPAB",
  "authUid": "2TOQOnqT4RZvSTY9U6i8vmB8g843",
  "name": "Areesha afak",
  "email": "areeshaafak@gmail.com"
}
```

### Document: `8PfsQ4hxAzL2AIE0B72JXsbA55o2`
```json
{
  "tutorId": "MTTRAVGV8",
  "authUid": "8PfsQ4hxAzL2AIE0B72JXsbA55o2",
  "name": "Avinash Abbigeri",
  "email": "avinashabbigeri1@gmail.com",
  "whatsapp": "1010101010",
  "studentCount": "",
  "occupation": "",
  "gender": "Male",
  "city": "",
  "classes": [
    "UKG",
    "LKG"
  ],
  "latitude": 0,
  "rating": 0,
  "boards": [
    "CBSE"
  ],
  "experience": "4-6 Years",
  "knownLanguages": [],
  "feeRange": "20000",
  "mode": "Online",
  "createdAt": 1786901778668,
  "price": 0,
  "travelDistance": "",
  "hasProfile": true,
  "preferredTimeRange": "",
  "schoolNames": "",
  "longitude": 0,
  "area": "",
  "address": "",
  "subjects": [
    "Art"
  ],
  "languagesTaught": [],
  "technologies": [],
  "qualification": "10th",
  "phone": "1010101010",
  "teachingApproach": "",
  "preferredLocations": "",
  "category": "school"
}
```

---

## Collection: `users`

### Document: `0dVv3aHqZ1UQXFSMY38Mfb9XKHu1`
```json
{
  "id": "0dVv3aHqZ1UQXFSMY38Mfb9XKHu1",
  "email": "ambisonuram@gmail.com",
  "name": "Ramachandran",
  "role": "teacher",
  "roles": [
    "teacher"
  ],
  "referralCode": "RAMA-3AHQZ1",
  "hasProfile": true,
  "dismissedNotifications": [
    "LGHyQqaXnEFnwkEja1s8",
    "ZUqzWRidAJ1P3y6jDawG"
  ]
}
```

### Document: `2TOQOnqT4RZvSTY9U6i8vmB8g843`
```json
{
  "id": "2TOQOnqT4RZvSTY9U6i8vmB8g843",
  "email": "areeshaafak@gmail.com",
  "name": "Areesha afak",
  "role": "teacher",
  "roles": [
    "teacher"
  ],
  "referredBy": ""
}
```

### Document: `8PfsQ4hxAzL2AIE0B72JXsbA55o2`
```json
{
  "id": "8PfsQ4hxAzL2AIE0B72JXsbA55o2",
  "email": "avinashabbigeri1@gmail.com",
  "name": "Avinash Abbigeri",
  "role": "teacher",
  "roles": [
    "teacher"
  ],
  "referredBy": "",
  "referralCode": "AVIN-Q4HXAZ",
  "hasProfile": true
}
```

### Document: `Zo07IekBlnRwCJIiVdv3Dd3CY8E2`
```json
{
  "id": "Zo07IekBlnRwCJIiVdv3Dd3CY8E2",
  "email": "varshinivarsh1304@gmail.com",
  "name": "Varshini P",
  "role": "student",
  "roles": [
    "student"
  ],
  "referralCode": "VARS-IEKBLN",
  "hasProfile": true
}
```

### Document: `zPFD1EnIy8g4r41MeB9jPi661dG3`
```json
{
  "id": "zPFD1EnIy8g4r41MeB9jPi661dG3",
  "email": "nikhil.4002.50.82@gmail.com",
  "name": "Nikhil",
  "role": "student",
  "roles": [
    "student"
  ],
  "referralCode": "NIKH-1ENIY8",
  "hasProfile": true,
  "dismissedNotifications": [
    "LGHyQqaXnEFnwkEja1s8",
    "ZUqzWRidAJ1P3y6jDawG"
  ]
}
```

---

