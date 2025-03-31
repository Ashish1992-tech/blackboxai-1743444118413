const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8000;

// Initialize data files
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

['users.json', 'tasks.json', 'reports.json'].forEach(file => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]');
});

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/reports', require('./routes/reports'));

// View Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/dashboard-super', (req, res) => res.sendFile(path.join(__dirname, 'views', 'dashboard-super.html')));
app.get('/dashboard-admin', (req, res) => res.sendFile(path.join(__dirname, 'views', 'dashboard-admin.html')));
app.get('/dashboard-subadmin', (req, res) => res.sendFile(path.join(__dirname, 'views', 'dashboard-subadmin.html')));
app.get('/dashboard-employee', (req, res) => res.sendFile(path.join(__dirname, 'views', 'dashboard-employee.html')));

// 404 Handler
app.use((req, res) => res.status(404).send('Not found'));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));