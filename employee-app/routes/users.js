const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authMiddleware } = require('../helpers/authMiddleware');

const usersPath = path.join(__dirname, '../data/users.json');

// Get all users (Super Admin only)
router.get('/', authMiddleware('superadmin'), (req, res) => {
    const users = JSON.parse(fs.readFileSync(usersPath));
    res.json(users.filter(u => u.role !== 'superadmin'));
});

// Create new user (Super Admin can create all roles, Admin can create subadmin/employee)
router.post('/', authMiddleware(), (req, res) => {
    const { role } = req.user;
    const { username, password, name, newRole } = req.body;

    if (role === 'admin' && !['subadmin', 'employee'].includes(newRole)) {
        return res.status(403).json({ message: 'Admin can only create subadmins or employees' });
    }

    const users = JSON.parse(fs.readFileSync(usersPath));
    if (users.some(u => u.username === username)) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        username,
        password,
        name,
        role: newRole
    };

    users.push(newUser);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    res.status(201).json(newUser);
});

module.exports = router;