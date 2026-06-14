const users = [
  { 
    id: 1, 
    email: 'student@test.com', 
    password: 'password', 
    role: 'student', 
    name: 'John Doe',
    grade: '10th',
    interests: ['Math', 'Science']
  },
  { 
    id: 2, 
    email: 'student2@test.com', 
    password: 'password', 
    role: 'student', 
    name: 'Alice Johnson',
    grade: '12th',
    interests: ['Physics', 'Coding']
  },
  { 
    id: 3, 
    email: 'student3@test.com', 
    password: 'password', 
    role: 'student', 
    name: 'Michael Brown',
    grade: '8th',
    interests: ['English', 'History']
  },
  { 
    id: 4, 
    email: 'teacher@test.com', 
    password: 'password', 
    role: 'teacher', 
    name: 'Jane Smith',
    subjects: 'Math, Physics',
    experience: '5 Years',
    feeRange: '₹500/hr',
    mode: 'Online',
    description: 'I specialize in making complex mathematical concepts easy to understand.'
  },
  { 
    id: 5, 
    email: 'teacher2@test.com', 
    password: 'password', 
    role: 'teacher', 
    name: 'Albert Einstein',
    subjects: 'Physics, Coding',
    experience: '10 Years',
    feeRange: '₹800/hr',
    mode: 'Online & Offline',
    description: 'Passionate about theoretical physics and teaching Python to beginners.'
  },
  { 
    id: 6, 
    email: 'teacher3@test.com', 
    password: 'password', 
    role: 'teacher', 
    name: 'Marie Curie',
    subjects: 'Chemistry, Science',
    experience: '8 Years',
    feeRange: '₹600/hr',
    mode: 'Online',
    description: 'Dedicated to helping students excel in chemistry and general science.'
  }
];

const teacherRequests = [
  { id: 1, teacherEmail: 'teacher@test.com', studentName: 'John Doe', subject: 'Math', date: '2026-06-20T10:00:00Z', status: 'confirmed' },
  { id: 2, teacherEmail: 'teacher@test.com', studentName: 'Alice Johnson', subject: 'Physics', date: '2026-06-21T09:00:00Z', status: 'pending' },
  { id: 3, teacherEmail: 'teacher2@test.com', studentName: 'Michael Brown', subject: 'Coding', date: '2026-06-22T15:00:00Z', status: 'pending' }
];

module.exports = {
  users,
  teacherRequests
};
