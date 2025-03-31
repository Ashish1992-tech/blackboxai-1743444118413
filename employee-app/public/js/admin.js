document.addEventListener('DOMContentLoaded', async () => {
    // Verify authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user || user.role !== 'admin') {
        window.location.href = '/login.html';
        return;
    }

    // Load tasks and subadmins
    await loadTasks();
    await loadSubadmins();

    // Task creation button
    document.getElementById('createTaskBtn')?.addEventListener('click', () => {
        showCreateTaskModal();
    });
});

async function loadTasks() {
    try {
        const response = await fetch('/api/tasks', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const tasks = await response.json();
        const tableBody = document.getElementById('tasksTableBody');
        
        if (tableBody) {
            tableBody.innerHTML = tasks.map(task => `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="font-medium text-gray-900">${task.title}</div>
                        <div class="text-sm text-gray-500">${task.description}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${task.assignedToName || 'Subadmin #' + task.assignedTo}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              task.status === 'in progress' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'}">
                            ${task.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-indigo-600 hover:text-indigo-900">View</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function loadSubadmins() {
    try {
        const response = await fetch('/api/users?role=subadmin', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const subadmins = await response.json();
        const container = document.getElementById('subadminsContainer');
        
        if (container) {
            container.innerHTML = subadmins.map(subadmin => `
                <div class="bg-white rounded-lg shadow p-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <div>
                            <h4 class="font-medium">${subadmin.name}</h4>
                            <p class="text-sm text-gray-500">${subadmin.username}</p>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <button class="w-full bg-indigo-100 text-indigo-700 py-1 px-3 rounded text-sm hover:bg-indigo-200">
                            Assign Task
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading subadmins:', error);
    }
}

function showCreateTaskModal() {
    // In a real implementation, this would show a modal with a form
    // to create a new task and assign to a subadmin
    alert('Create task functionality would be implemented here');
    console.log('Showing create task modal');
}