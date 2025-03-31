const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authMiddleware } = require('../helpers/authMiddleware');

const tasksPath = path.join(__dirname, '../data/tasks.json');
const usersPath = path.join(__dirname, '../data/users.json');

// Admin creates task and assigns to subadmin
router.post('/', authMiddleware('admin'), (req, res) => {
  const { title, description, dueDate, subadminId } = req.body;
  
  const users = JSON.parse(fs.readFileSync(usersPath));
  const subadmin = users.find(u => u.id === subadminId && u.role === 'subadmin');
  
  if (!subadmin) {
    return res.status(400).json({ message: 'Invalid subadmin ID' });
  }

  const tasks = JSON.parse(fs.readFileSync(tasksPath));
  const newTask = {
    id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    title,
    description,
    dueDate,
    status: 'pending',
    createdBy: req.user.id,
    assignedTo: subadminId,
    assignedEmployees: [],
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
  res.status(201).json(newTask);
});

// Subadmin assigns task to employees
router.put('/:id/assign', authMiddleware('subadmin'), (req, res) => {
  const taskId = parseInt(req.params.id);
  const { employeeIds } = req.body;

  const users = JSON.parse(fs.readFileSync(usersPath));
  const tasks = JSON.parse(fs.readFileSync(tasksPath));
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (tasks[taskIndex].assignedTo !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to assign this task' });
  }

  const validEmployees = employeeIds.every(id => 
    users.some(u => u.id === id && u.role === 'employee')
  );

  if (!validEmployees) {
    return res.status(400).json({ message: 'Invalid employee IDs' });
  }

  tasks[taskIndex].assignedEmployees = employeeIds;
  tasks[taskIndex].status = 'assigned';
  fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
  res.json(tasks[taskIndex]);
});

// Employee updates task status
router.put('/:id/status', authMiddleware('employee'), (req, res) => {
  const taskId = parseInt(req.params.id);
  const { status } = req.body;

  const tasks = JSON.parse(fs.readFileSync(tasksPath));
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (!tasks[taskIndex].assignedEmployees.includes(req.user.id)) {
    return res.status(403).json({ message: 'Not assigned to this task' });
  }

  tasks[taskIndex].status = status;
  fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
  res.json(tasks[taskIndex]);
});

module.exports = router;