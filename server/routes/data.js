const express = require('express');
const router = express.Router();
const { users, teacherRequests } = require('../mockDB');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = Buffer.from(token, 'base64').toString('ascii');
    const [email, role] = decoded.split(':');
    req.user = { email, role };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

router.get('/student/dashboard', requireAuth, (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  // Find all teachers
  const availableTeachers = users.filter(u => u.role === 'teacher').map(t => ({
    id: t.id,
    name: t.name,
    subjects: t.subjects,
    experience: t.experience,
    feeRange: t.feeRange,
    mode: t.mode,
    description: t.description
  }));

  // Find upcoming classes for this student
  const studentInfo = users.find(u => u.email === req.user.email);
  const myRequests = teacherRequests.filter(r => r.studentName === studentInfo?.name);

  res.json({
    success: true,
    data: {
      availableTeachers,
      upcomingClasses: myRequests,
      progress: {
        hoursStudied: 12,
        coursesCompleted: 2
      }
    }
  });
});

router.get('/teacher/dashboard', requireAuth, (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  // Find requests for this teacher
  const requests = teacherRequests.filter(r => r.teacherEmail === req.user.email);

  res.json({
    success: true,
    data: {
      schedule: requests,
      earnings: {
        total: requests.filter(r => r.status === 'confirmed').length * 500,
        pending: requests.filter(r => r.status === 'pending').length * 500
      }
    }
  });
});

module.exports = router;
