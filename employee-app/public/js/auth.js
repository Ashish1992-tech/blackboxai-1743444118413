document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();
                
                if (response.ok) {
                    // Store token and user data
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // Redirect based on role
                    switch(data.user.role) {
                        case 'superadmin':
                            window.location.href = '/dashboard-super.html';
                            break;
                        case 'admin':
                            window.location.href = '/dashboard-admin.html';
                            break;
                        case 'subadmin':
                            window.location.href = '/dashboard-subadmin.html';
                            break;
                        case 'employee':
                            window.location.href = '/dashboard-employee.html';
                            break;
                        default:
                            window.location.href = '/login.html';
                    }
                } else {
                    alert(data.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred during login');
            }
        });
    }

    // Logout functionality
    const logoutButtons = document.querySelectorAll('#logoutBtn');
    logoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        });
    });

    // Check authentication on protected pages
    const protectedPages = [
        'dashboard-super.html',
        'dashboard-admin.html',
        'dashboard-subadmin.html',
        'dashboard-employee.html'
    ];

    if (protectedPages.some(page => window.location.pathname.endsWith(page))) {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !user) {
            window.location.href = '/login.html';
            return;
        }

        // Display user name
        const userNameElements = document.querySelectorAll('#userName');
        userNameElements.forEach(el => {
            if (el && user.name) {
                el.textContent = user.name;
            }
        });
    }
});