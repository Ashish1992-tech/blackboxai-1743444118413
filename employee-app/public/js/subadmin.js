document.addEventListener('DOMContentLoaded', async () => {
    // Verify authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user || user.role !== 'subadmin') {
        window.location.href = '/login.html';
        return;
    }

    // Load tasks and employees
    await loadTasks();
    await loadEmployees();

    // Task assignment button
    document.getElementById('assignTaskBtn')?.addEventListener('click', () => {
        showAssignTaskModal();
    });

    // Report form submission
    document.getElementById('reportForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitDailyReport();
    });
});

async function loadTasks() {
    try {
        const response = await fetch('/api/tasks?assignedTo=' + JSON.parse(localStorage.getItem('user')).id, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const tasks = await response.json();
        const container = document.getElementById('tasksContainer');
        
        if (container) {
            container.innerHTML = tasks.map(task => `
                <div class="bg-white rounded-lg shadow p-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h4 class="font-medium text-gray-800">${task.title}</h4>
                            <p class="text-sm text-gray-600 mt-1">${task.description}</p>
                            <div class="mt-2 flex items-center text-sm text-gray-500">
                                <i class="fas fa-calendar-alt mr-1"></i>
                                <span>Due: ${new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <span class="px-2 py-1 text-xs font-semibold rounded-full 
                            ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              task.status === 'in progress' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'}">
                            ${task.status}
                        </span>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <h5 class="text-sm font-medium text-gray-700 mb-2">Assigned Employees</h5>
                        <div class="flex flex-wrap gap-2">
                            ${task.assignedEmployees && task.assignedEmployees.length > 0 ? 
                              task.assignedEmployees.map(id => `
                                <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                    Employee #${id}
                                </span>
                              `).join('') : 
                              '<span class="text-sm text-gray-500">No employees assigned</span>'}
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function loadEmployees() {
    try {
        // In a real app, this would fetch employees assigned to this subadmin
        const response = await fetch('/api/users?role=employee', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const employees = await response.json();
        const tableBody = document.getElementById('employeesTableBody');
        
        if (tableBody) {
            tableBody.innerHTML = employees.map(employee => `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${employee.name}</div>
                                <div class="text-sm text-gray-500">${employee.username}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">3</div> <!-- Sample task count -->
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                        </span>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

async function submitDailyReport() {
    const content = document.getElementById('reportContent').value;
    const taskUpdates = []; // Would collect from form in real implementation
    
    try {
        const response = await fetch('/api/reports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ content, taskUpdates })
        });

        if (response.ok) {
            alert('Report submitted successfully');
            document.getElementById('reportForm').reset();
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to submit report');
        }
    } catch (error) {
        console.error('Error submitting report:', error);
        alert('An error occurred while submitting the report');
    }
}

function showAssignTaskModal() {
    // In a real implementation, this would show a modal with a form
    // to assign tasks to employees
    alert('Assign task functionality would be implemented here');
    console.log('Showing assign task modal');
}