// Admin functionality
function adminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simple authentication (in a real app, this would be server-side)
    if (username === 'admin' && password === 'admin123') {
        // Hide login form and show admin panel
        document.getElementById('adminLogin').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        
        // Keep admin header visible
        document.getElementById('adminHeader').style.display = 'block';
        document.getElementById('mainHeader').style.display = 'none';
        
        // Load admin data
        updateRouteSelects();
        loadAdminData();
    } else {
        // Show error message
        alert('Invalid username or password. Please try again.');
    }
}

function adminLogout() {
    document.getElementById('adminPanel').classList.add('hidden');
    document.getElementById('adminLogin').classList.remove('hidden');
    
    // Clear admin form fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
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
function addBus(event) {
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
    
    // Generate a unique ID as a string
    const newId = String(Date.now());
    console.log("Generated new bus ID:", newId, "type:", typeof newId);
    
    const newBus = {
        id: newId,
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
    
    busData.push(newBus);
    loadBusTable();
    
    // Update search options with the new bus data
    updateSearchOptions();
    
    // Save data to localStorage
    saveData();
    
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

function toggleBusStatus(busId) {
    const bus = busData.find(b => String(b.id) === String(busId));
    if (bus) {
        bus.status = bus.status === 'running' ? 'stopped' : 'running';
        loadBusTable();
        // Save data to localStorage
        saveData();
    } else {
        console.error(`Bus with ID ${busId} not found when toggling status`);
    }
}

function deleteBus(busId) {
    if (confirm('Are you sure you want to delete this bus?')) {
        const initialCount = busData.length;
        busData = busData.filter(b => String(b.id) !== String(busId));
        
        if (busData.length === initialCount) {
            console.error(`Bus with ID ${busId} not found when deleting`);
        }
        
        loadBusTable();
        // Update search options after bus deletion
        updateSearchOptions();
        // Save data to localStorage
        saveData();
    }
}

// Route management
function addRoute(event) {
    event.preventDefault();
    
    const routeName = document.getElementById('routeName').value;
    const routeOrigin = document.getElementById('routeOrigin').value;
    const routeDestination = document.getElementById('routeDestination').value;
    const routeDistance = parseInt(document.getElementById('routeDistance').value);
    
    const newRoute = {
        id: routes.length + 1,
        name: routeName.toLowerCase().replace(/\s+/g, '-'),
        origin: routeOrigin,
        destination: routeDestination,
        distance: routeDistance
    };
    
    routes.push(newRoute);
    loadRouteTable();
    updateRouteSelects();
    // Save data to localStorage
    saveData();
    
    // Reset form
    document.getElementById('routeName').value = '';
    document.getElementById('routeOrigin').value = '';
    document.getElementById('routeDestination').value = '';
    document.getElementById('routeDistance').value = '';
    
    alert('Route added successfully!');
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

function deleteRoute(routeId) {
    if (confirm('Are you sure you want to delete this route?')) {
        routes = routes.filter(r => r.id !== routeId);
        loadRouteTable();
        updateRouteSelects();
        // Save data to localStorage
        saveData();
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
function addStop(event) {
    event.preventDefault();
    
    const stopName = document.getElementById('stopName').value;
    const stopRoute = document.getElementById('stopRoute').value;
    
    // Get time values from the new input fields
    const arrivalHour = document.getElementById('stopArrivalHour').value;
    const arrivalMinute = document.getElementById('stopArrivalMinute').value;
    const arrivalAmPm = document.getElementById('stopArrivalAmPm').value;
    
    const departureHour = document.getElementById('stopDepartureHour').value;
    const departureMinute = document.getElementById('stopDepartureMinute').value;
    const departureAmPm = document.getElementById('stopDepartureAmPm').value;
    
    // Convert to 24-hour format for storage
    const arrivalTime = convertTo24Hour(arrivalHour, arrivalMinute, arrivalAmPm);
    const departureTime = convertTo24Hour(departureHour, departureMinute, departureAmPm);
    
    // Check if stop already exists for this route
    const existingStop = stops.find(s => s.name === stopName && s.route === stopRoute);
    if (existingStop) {
        alert('This stop already exists for this route!');
        return;
    }
    
    // Add stop to stops array
    const newStop = {
        id: stops.length + 1,
        name: stopName,
        route: stopRoute,
        arrival: arrivalTime,
        departure: departureTime,
        time: arrivalTime // Add the time field for compatibility with the new structure
    };
    
    stops.push(newStop);
    loadStopTable();
    
    // Update bus stops for this route
    updateBusStopsForRoute(stopRoute, {
        name: stopName,
        time: arrivalTime // Use arrival time as the single time value
    });
    
    // Update search options with the new stop
    updateSearchOptions();
    
    // Save data to localStorage
    saveData();
    
    // Reset form
    document.getElementById('stopName').value = '';
    document.getElementById('stopRoute').value = '';
    document.getElementById('stopArrivalHour').value = '';
    document.getElementById('stopArrivalMinute').value = '';
    document.getElementById('stopArrivalAmPm').value = 'AM';
    document.getElementById('stopDepartureHour').value = '';
    document.getElementById('stopDepartureMinute').value = '';
    document.getElementById('stopDepartureAmPm').value = 'AM';
    
    alert('Stop added successfully!');
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

function deleteStop(stopId) {
    if (confirm('Are you sure you want to delete this stop?')) {
        // Get the stop before deleting it
        const stopToDelete = stops.find(s => s.id === stopId);
        
        if (stopToDelete) {
            // Remove stop from all buses that have it
            busData.forEach(bus => {
                if (bus.route.toLowerCase().replace(/\s+/g, '-') === stopToDelete.route) {
                    bus.stops = bus.stops.filter(s => s.name !== stopToDelete.name);
                }
            });
            
            // Delete the stop from the stops array
            stops = stops.filter(s => s.id !== stopId);
            loadStopTable();
            
            // Update stoppage options
            updateStoppageOptions();
            
            // Save data to localStorage
            saveData();
        }
    }
} 