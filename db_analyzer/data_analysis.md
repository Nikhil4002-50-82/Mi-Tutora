# Firestore Data Dump

Generated on: 2026-09-08T09:06:32.561Z

This file contains the raw data from all documents in the database to help trace foreign keys and logic.

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
  "studentDocIds": [
    "YTuHh83hmE6j5qcBxFXa",
    "Py6laeTf2k0IdXVJ8Mma"
  ],
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
  "mode": "Online"
}
```

---

## Collection: `id_counters`

### Document: `parent`
```json
{
  "lastValue": 2
}
```

### Document: `student`
```json
{
  "lastValue": 3
}
```

### Document: `tuition_request`
```json
{
  "lastValue": 2
}
```

### Document: `tutor`
```json
{
  "lastValue": 2
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
  "isAvailable": true,
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
  "platformUserId": "MTS000003"
}
```

### Document: `YTuHh83hmE6j5qcBxFXa`
```json
{
  "isAvailable": true,
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
  "platformUserId": "MTS000002"
}
```

---

## Collection: `tuition_requests`

### Document: `ftw9DBYaWYePz6pKvIfR`
```json
{
  "city": "",
  "category": "school",
  "studentsDetails": [
    {
      "id": "YTuHh83hmE6j5qcBxFXa",
      "languages": [],
      "classLevel": "8th Standard",
      "budget": 3000,
      "technologies": [],
      "board": "ICSE",
      "name": "Nikhil R Nambiar",
      "subjects": [
        "Mathematics"
      ]
    },
    {
      "languages": [],
      "classLevel": "6th Standard",
      "technologies": [],
      "name": "Abhilash V",
      "subjects": [
        "Mathematics",
        "Science"
      ],
      "id": "Py6laeTf2k0IdXVJ8Mma",
      "board": "CBSE",
      "budget": 3000
    }
  ],
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
  "trackingId": "REQ000002"
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
  "upiId": "9148018043@kotakbank"
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
  "platformUserId": "MTP000002"
}
```

---

