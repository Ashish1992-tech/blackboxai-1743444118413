const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const SECRET_KEY = 'employee-app-secret';
const usersPath = path.join(__dirname, '../data/users.json');

const authMiddleware = (requiredRole) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'Authentication required' });

      const decoded = jwt.verify(token, SECRET_KEY);
      const users = JSON.parse(fs.readFileSync(usersPath));
      const user = users.find(u => u.id === decoded.userId);

      if (!user) return res.status(401).json({ message: 'User not found' });
      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};

module.exports = {
  authMiddleware,
  SECRET_KEY
};