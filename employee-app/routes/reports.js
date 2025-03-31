const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authMiddleware } = require('../helpers/authMiddleware');

const reportsPath = path.join(__dirname, '../data/reports.json');
const tasksPath = path.join(__dirname, '../data/tasks.json');

// Subadmin submits daily report
router.post('/', authMiddleware('subadmin'), (req, res) => {
    const { content, taskUpdates } = req.body;

    const reports = JSON.parse(fs.readFileSync(reportsPath));
    const newReport = {
        id: reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1,
        subadminId: req.user.id,
        content,
        date: newDate().toISOString(),
        taskUpdates: taskUpdates || []
    };

    // Update task statuses if provided
    if (taskUpdates?.length > 0) {
        const tasks = JSON.parse(fs.readFileSync(tasksPath));
        taskUpdates.forEach(update => {
            const task = tasks.find(t => t.id === update.taskId);
            if (task) {
                task.status = update.status;
                task.notes = update.notes;
            }
        });
        fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2));
    }

    reports.push(newReport);
    fs.writeFileSync(reportsPath, JSON.stringify(reports, null, 2));
    res.status(201).json(newReport);
});

// Get reports (Super Admin/Admin access)
router.get('/', authMiddleware(), (req, res) => {
    const reports = JSON.parse(fs.readFileSync(reportsPath));
    res.json(reports);
});

module.exports = router;