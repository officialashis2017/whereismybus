// Standalone login script without modules
// This is used as a fallback in case the ES modules don't work properly

// Login function
function handleAdminLogin(event) {
    if (event) event.preventDefault();
    
    console.log("Standalone login function called");
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log("Login attempt with:", username, password);
    
    // Simple demo authentication
    if (username === 'admin' && password === 'admin123') {
        console.log("Demo login successful");
        
        // Show success message
        const statusElement = document.getElementById('loginStatus');
        statusElement.textContent = "Demo login successful!";
        statusElement.className = "login-status success";
        
        // Complete login process
        completeStandaloneLogin();
    } else {
        // Show error message
        console.log("Demo login failed");
        const statusElement = document.getElementById('loginStatus');
        statusElement.textContent = "Invalid username or password.";
        statusElement.className = "login-status error";
    }
}

// Function to complete the login process
function completeStandaloneLogin() {
    // Hide login form and show admin panel
    document.getElementById('adminLogin').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    
    // Keep admin header visible
    document.getElementById('adminHeader').style.display = 'block';
    document.getElementById('mainHeader').style.display = 'none';
    
    // Reset button state
    document.getElementById('loginButton').innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    document.getElementById('loginButton').disabled = false;
    
    // Note: Can't call module functions, so we'll try to use the global versions if available
    if (typeof window.updateRouteSelects === 'function') {
        window.updateRouteSelects();
    }
    
    if (typeof window.loadAdminData === 'function') {
        window.loadAdminData();
    }
}

// Make the function globally available
window.handleAdminLogin = handleAdminLogin;

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Standalone login script loaded");
    
    // Find the admin login form and attach our handler directly
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        console.log("Found admin login form, attaching standalone handler");
        adminLoginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            handleAdminLogin(event);
            return false;
        });
    } else {
        console.log("Admin login form not found");
    }
}); 