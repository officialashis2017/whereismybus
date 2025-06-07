// Import Firebase services
import { 
    busData, 
    routes, 
    stops,
    saveBusData,
    deleteBusData, 
    saveRouteData, 
    deleteRouteData,
    saveStopData,
    deleteStopData
} from './data.js';

import { updateSearchOptions } from './search.js';
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Admin functionality
function adminLogin(event) {
    event.preventDefault();
    
    console.log("Admin login function called");
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log("Login attempt with:", username, password);
    
    // First try Firebase authentication if proper email format
    if (username.includes('@')) {
        // Show loading indicator
        document.getElementById('loginButton').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        document.getElementById('loginButton').disabled = true;
        
        // Attempt Firebase login
        signInWithEmailAndPassword(auth, username, password)
            .then((userCredential) => {
                console.log("Firebase login successful", userCredential.user);
                // Show success message
                const statusElement = document.getElementById('loginStatus');
                statusElement.textContent = "Login successful!";
                statusElement.className = "login-status success";
                
                // Complete login process
                completeLogin();
            })
            .catch((error) => {
                console.error("Firebase login error:", error.code, error.message);
                
                // Show error message
                const statusElement = document.getElementById('loginStatus');
                statusElement.textContent = "Login failed: " + error.message;
                statusElement.className = "login-status error";
                
                // Reset button
                document.getElementById('loginButton').innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
                document.getElementById('loginButton').disabled = false;
            });
    } 
    // Fallback to demo authentication
    else if (username === 'admin' && password === 'admin123') {
        console.log("Demo login successful");
        
        // Show success message
        const statusElement = document.getElementById('loginStatus');
        statusElement.textContent = "Demo login successful!";
        statusElement.className = "login-status success";
        
        // Complete login process
        completeLogin();
    } else {
        // Show error message
        console.log("Demo login failed");
        const statusElement = document.getElementById('loginStatus');
        statusElement.textContent = "Invalid username or password.";
        statusElement.className = "login-status error";
    }
}

// Function to complete the login process (common for both auth methods)
function completeLogin() {
    // Hide login form and show admin panel
    document.getElementById('adminLogin').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    
    // Keep admin header visible
    document.getElementById('adminHeader').style.display = 'block';
    document.getElementById('mainHeader').style.display = 'none';
    
    // Load admin data
    updateRouteSelects();
    loadAdminData();
    
    // Reset button state
    document.getElementById('loginButton').innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    document.getElementById('loginButton').disabled = false;
}

function adminLogout() {
    // If logged in with Firebase, sign out
    if (auth.currentUser) {
        signOut(auth).then(() => {
            console.log("Firebase sign out successful");
        }).catch((error) => {
            console.error("Firebase sign out error:", error);
        });
    }
    
    document.getElementById('adminPanel').classList.add('hidden');
    document.getElementById('adminLogin').classList.remove('hidden');
    
    // Clear admin form fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    // Clear any status message
    const statusElement = document.getElementById('loginStatus');
    if (statusElement) {
        statusElement.textContent = "";
        statusElement.className = "login-status";
    }
    
    // Switch headers and return to home page
    document.getElementById('mainHeader').style.display = 'block';
    document.getElementById('adminHeader').style.display = 'none';
    
    // Return to home page
    showPage('home', document.querySelector('.nav-link'));
}

function loadAdminData() {
    loadBusTable();
    loadRouteTable();
    loadStopTable();
}

// Time conversion functions
function convertTo24Hour(hour, minute, ampm) {
    hour = parseInt(hour);
    minute = parseInt(minute);
    
    if (ampm === 'PM' && hour < 12) {
        hour += 12;
    }
    if (ampm === 'AM' && hour === 12) {
        hour = 0;
    }
    
    // Format with leading zeros
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    
    return `${formattedHour}:${formattedMinute}`;
}

function convertTo12Hour(time24) {
    if (!time24) return { hour: '12', minute: '00', ampm: 'AM' };
    
    const [hours, minutes] = time24.split(':');
    let hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hour = hour % 12;
    hour = hour ? hour : 12; // Convert 0 to 12
    
    return {
        hour: hour.toString(),
        minute: minutes,
        ampm: ampm
    };
}

// Bus management
async function addBus(event) {
    event.preventDefault();
    
    const busNumber = document.getElementById('busNumber').value;
    const busRoute = document.getElementById('busRoute').value;
    
    console.log("Adding new bus:", busNumber, "Route:", busRoute);
    
    // Get time values from the new input fields
    const departureHour = document.getElementById('departureHour').value;
    const departureMinute = document.getElementById('departureMinute').value;
    const departureAmPm = document.getElementById('departureAmPm').value;
    
    const arrivalHour = document.getElementById('arrivalHour').value;
    const arrivalMinute = document.getElementById('arrivalMinute').value;
    const arrivalAmPm = document.getElementById('arrivalAmPm').value;
    
    // Convert to 24-hour format for storage
    const departureTime = convertTo24Hour(departureHour, departureMinute, departureAmPm);
    const arrivalTime = convertTo24Hour(arrivalHour, arrivalMinute, arrivalAmPm);
    
    const routeInfo = routes.find(r => r.name === busRoute);
    if (!routeInfo) {
        alert('Invalid route selected!');
        return;
    }
    
    // Get stops for this route
    const routeStops = stops.filter(stop => stop.route === busRoute);
    
    // Create initial stops array with origin and destination
    const initialStops = [
        { name: routeInfo.origin, time: departureTime },
        { name: routeInfo.destination, time: arrivalTime }
    ];
    
    // Add intermediate stops
    let allStops = [...initialStops];
    if (routeStops.length > 0) {
        // Remove origin and destination which will be added back
        const origin = allStops.shift();
        const destination = allStops.pop();
        
        // Add all route stops
        routeStops.forEach(stop => {
            allStops.push({
                name: stop.name,
                time: stop.arrival // Use arrival time as the single time value
            });
        });
        
        // Sort by time
        allStops.sort((a, b) => {
            // Convert time strings to minutes for comparison
            const timeToMinutes = (timeStr) => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                return hours * 60 + minutes;
            };
            return timeToMinutes(a.time) - timeToMinutes(b.time);
        });
        
        // Reconstruct stops array with origin and destination
        allStops = [origin, ...allStops, destination];
    }
    
    const newBus = {
        number: busNumber,
        name: `${routeInfo.origin} Express`,
        type: 'Standard',
        route: `${routeInfo.origin} - ${routeInfo.destination}`,
        from: routeInfo.origin.toLowerCase(),
        to: routeInfo.destination.toLowerCase(),
        departure: departureTime,
        arrival: arrivalTime,
        status: 'stopped',
        currentStop: routeInfo.origin,
        stops: allStops
    };
    
    console.log("Created new bus:", newBus);
    
    try {
        // Save to Firebase
        const success = await saveBusData(newBus);
        
        if (success) {
            // Add to local array (will be updated by Firebase listener)
            busData.push(newBus);
            loadBusTable();
            
            // Update search options with the new bus data
            updateSearchOptions();
            
            // Reset form
            document.getElementById('busNumber').value = '';
            document.getElementById('busRoute').value = '';
            document.getElementById('departureHour').value = '';
            document.getElementById('departureMinute').value = '';
            document.getElementById('departureAmPm').value = 'AM';
            document.getElementById('arrivalHour').value = '';
            document.getElementById('arrivalMinute').value = '';
            document.getElementById('arrivalAmPm').value = 'AM';
            
            alert('Bus added successfully!');
        } else {
            alert('Failed to add bus. Please try again.');
        }
    } catch (error) {
        console.error("Error adding bus:", error);
        alert('An error occurred while adding the bus.');
    }
}

function loadBusTable() {
    const tbody = document.getElementById('busTableBody');
    tbody.innerHTML = busData.map(bus => `
        <tr>
            <td>${bus.number}</td>
            <td>${bus.route}</td>
            <td>${formatTime(bus.departure)}</td>
            <td>${formatTime(bus.arrival)}</td>
            <td>
                <span class="bus-status ${bus.status === 'running' ? 'status-running' : 'status-stopped'}">
                    ${bus.status === 'running' ? 'Running' : 'Stopped'}
                </span>
            </td>
            <td>
                <button class="btn" onclick="toggleBusStatus('${bus.id}')" style="margin-right: 0.5rem; padding: 0.5rem 1rem; font-size: 0.8rem;">
                    ${bus.status === 'running' ? 'Stop' : 'Start'}
                </button>
                <button class="btn" onclick="editBus('${bus.id}')" style="margin-right: 0.5rem; background: #4CAF50; padding: 0.5rem 1rem; font-size: 0.8rem;">
                    Edit
                </button>
                <button class="btn btn-danger" onclick="deleteBus('${bus.id}')" style="padding: 0.5rem 1rem; font-size: 0.8rem;">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

async function toggleBusStatus(busId) {
    const bus = busData.find(b => String(b.id) === String(busId));
    if (bus) {
        const newStatus = bus.status === 'running' ? 'stopped' : 'running';
        
        try {
            // Update status in Firebase
            bus.status = newStatus;
            const success = await saveBusData(bus);
            
            if (success) {
                loadBusTable();
            } else {
                alert('Failed to update bus status. Please try again.');
                // Revert the status change
                bus.status = bus.status === 'running' ? 'stopped' : 'running';
            }
        } catch (error) {
            console.error(`Error updating bus status for ID ${busId}:`, error);
            alert('An error occurred while updating the bus status.');
            // Revert the status change
            bus.status = bus.status === 'running' ? 'stopped' : 'running';
        }
    } else {
        console.error(`Bus with ID ${busId} not found when toggling status`);
    }
}

async function deleteBus(busId) {
    if (confirm('Are you sure you want to delete this bus?')) {
        try {
            // Delete from Firebase
            const success = await deleteBusData(busId);
            
            if (success) {
                // Remove from local array
                const initialCount = busData.length;
                busData = busData.filter(b => String(b.id) !== String(busId));
                
                if (busData.length === initialCount) {
                    console.error(`Bus with ID ${busId} not found when deleting`);
                }
                
                loadBusTable();
                // Update search options after bus deletion
                updateSearchOptions();
            } else {
                alert('Failed to delete bus. Please try again.');
            }
        } catch (error) {
            console.error(`Error deleting bus with ID ${busId}:`, error);
            alert('An error occurred while deleting the bus.');
        }
    }
}

// Route management
async function addRoute(event) {
    event.preventDefault();
    
    const routeName = document.getElementById('routeName').value;
    const routeOrigin = document.getElementById('routeOrigin').value;
    const routeDestination = document.getElementById('routeDestination').value;
    const routeDistance = parseInt(document.getElementById('routeDistance').value);
    
    const newRoute = {
        name: routeName.toLowerCase().replace(/\s+/g, '-'),
        origin: routeOrigin,
        destination: routeDestination,
        distance: routeDistance
    };
    
    try {
        // Save to Firebase
        const success = await saveRouteData(newRoute);
        
        if (success) {
            // Add to local array
            routes.push(newRoute);
            loadRouteTable();
            updateRouteSelects();
            
            // Reset form
            document.getElementById('routeName').value = '';
            document.getElementById('routeOrigin').value = '';
            document.getElementById('routeDestination').value = '';
            document.getElementById('routeDistance').value = '';
            
            alert('Route added successfully!');
        } else {
            alert('Failed to add route. Please try again.');
        }
    } catch (error) {
        console.error("Error adding route:", error);
        alert('An error occurred while adding the route.');
    }
}

function loadRouteTable() {
    const tbody = document.getElementById('routeTableBody');
    tbody.innerHTML = routes.map(route => `
        <tr>
            <td>${route.name}</td>
            <td>${route.origin}</td>
            <td>${route.destination}</td>
            <td>${route.distance} km</td>
            <td>
                <button class="btn btn-danger" onclick="deleteRoute(${route.id})" style="padding: 0.5rem 1rem; font-size: 0.8rem;">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

async function deleteRoute(routeId) {
    if (confirm('Are you sure you want to delete this route?')) {
        try {
            // Delete from Firebase
            const success = await deleteRouteData(routeId);
            
            if (success) {
                // Remove from local array
                routes = routes.filter(r => String(r.id) !== String(routeId));
                loadRouteTable();
                updateRouteSelects();
                
                alert('Route deleted successfully!');
            } else {
                alert('Failed to delete route. Please try again.');
            }
        } catch (error) {
            console.error(`Error deleting route with ID ${routeId}:`, error);
            alert('An error occurred while deleting the route.');
        }
    }
}

function updateRouteSelects() {
    const selects = ['busRoute', 'stopRoute'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select Route</option>' + 
            routes.map(route => `<option value="${route.name}">${route.origin} - ${route.destination}</option>`).join('');
        select.value = currentValue;
    });
}

// Stop management
async function addStop(event) {
    event.preventDefault();
    
    const stopRoute = document.getElementById('stopRoute').value;
    const stopName = document.getElementById('stopName').value;
    
    // Time inputs
    const arrivalHour = document.getElementById('stopArrivalHour').value;
    const arrivalMinute = document.getElementById('stopArrivalMinute').value;
    const arrivalAmPm = document.getElementById('stopArrivalAmPm').value;
    
    // Validate inputs
    if (!stopRoute || !stopName || !arrivalHour || !arrivalMinute) {
        alert('Please fill all fields');
        return;
    }
    
    // Convert times to 24-hour format
    const arrivalTime = convertTo24Hour(arrivalHour, arrivalMinute, arrivalAmPm);
    
    const newStop = {
        route: stopRoute,
        name: stopName,
        arrival: arrivalTime
    };
    
    try {
        // Save to Firebase
        const success = await saveStopData(newStop);
        
        if (success) {
            // Add to local array
            stops.push(newStop);
            loadStopTable();
            
            // Add this stop to buses with this route
            // This is now handled by Firebase listeners
            
            // Reset form
            document.getElementById('stopRoute').value = '';
            document.getElementById('stopName').value = '';
            document.getElementById('stopArrivalHour').value = '';
            document.getElementById('stopArrivalMinute').value = '';
            document.getElementById('stopArrivalAmPm').value = 'AM';
            
            alert('Stop added successfully!');
        } else {
            alert('Failed to add stop. Please try again.');
        }
    } catch (error) {
        console.error("Error adding stop:", error);
        alert('An error occurred while adding the stop.');
    }
}

function loadStopTable() {
    const tbody = document.getElementById('stopTableBody');
    tbody.innerHTML = stops.map(stop => `
        <tr>
            <td>${stop.name}</td>
            <td>${stop.route}</td>
            <td>${formatTime(stop.arrival)}</td>
            <td>${formatTime(stop.departure)}</td>
            <td>
                <button class="btn btn-danger" onclick="deleteStop(${stop.id})" style="padding: 0.5rem 1rem; font-size: 0.8rem;">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

async function deleteStop(stopId) {
    if (confirm('Are you sure you want to delete this stop?')) {
        try {
            // Delete from Firebase
            const success = await deleteStopData(stopId);
            
            if (success) {
                // Remove from local array
                stops = stops.filter(s => String(s.id) !== String(stopId));
                loadStopTable();
                
                alert('Stop deleted successfully!');
            } else {
                alert('Failed to delete stop. Please try again.');
            }
        } catch (error) {
            console.error(`Error deleting stop with ID ${stopId}:`, error);
            alert('An error occurred while deleting the stop.');
        }
    }
}

// Export functions for use in other modules
export {
    adminLogin,
    adminLogout,
    loadAdminData,
    convertTo24Hour,
    convertTo12Hour,
    addBus,
    loadBusTable,
    toggleBusStatus,
    deleteBus,
    addRoute,
    loadRouteTable,
    deleteRoute,
    updateRouteSelects,
    addStop,
    loadStopTable,
    deleteStop
}; 