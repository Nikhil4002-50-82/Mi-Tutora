const express = require('express');
const router = express.Router();
const { users } = require('../mockDB');

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    const token = Buffer.from(`${user.email}:${user.role}`).toString('base64');
    
    res.json({
      success: true,
      token,
      user: {
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

router.post('/register-teacher', (req, res) => {
  const data = req.body;
  
  // Basic check
  if (!data.email || !data.password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  // Check if email already exists
  if (users.some(u => u.email === data.email)) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  const newTeacher = {
    id: users.length + 1,
    email: data.email,
    password: data.password,
    role: 'teacher',
    name: data.fullName,
    subjects: data.subjects || data.category,
    experience: data.experience || 'Not specified',
    feeRange: data.feeRange || 'Not specified',
    mode: data.mode || 'Online',
    description: data.description || 'No description provided.',
    ...data
  };

  users.push(newTeacher);

  const token = Buffer.from(`${newTeacher.email}:${newTeacher.role}`).toString('base64');

  res.json({
    success: true,
    token,
    user: {
      email: newTeacher.email,
      role: newTeacher.role,
      name: newTeacher.name
    }
  });
});

module.exports = router;
