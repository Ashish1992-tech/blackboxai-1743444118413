const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../helpers/authMiddleware');

const usersPath = path.join(__dirname, '../data/users.json');

// Initialize with default admin if no users exist
if (fs.readFileSync(usersPath).length === 0) {
  const defaultUsers = [
    {
      id: 1,
      username: 'superadmin',
      password: 'admin123',
      role: 'superadmin',
      name: 'Default Super Admin'
    }
  ];
  fs.writeFileSync(usersPath, JSON.stringify(defaultUsers, null, 2));
}

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersPath));
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    SECRET_KEY,
    { expiresIn: '1h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role
    }
  });
});

module.exports = router;