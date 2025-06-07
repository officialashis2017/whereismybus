// Admin functionality
function adminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'admin' && password === 'admin123') {
        document.getElementById('adminLogin').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        loadAdminData();
    } else {
        alert('Invalid credentials!');
    }
}

function adminLogout() {
    document.getElementById('adminLogin').classList.remove('hidden');
    document.getElementById('adminPanel').classList.add('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function loadAdminData() {
    loadBusTable();
    loadRouteTable();
    loadStopTable();
}

// Bus management
function addBus(event) {
    event.preventDefault();
    
    const busNumber = document.getElementById('busNumber').value;
    const busRoute = document.getElementById('busRoute').value;
    const departureTime = document.getElementById('departureTime').value;
    const arrivalTime = document.getElementById('arrivalTime').value;
    
    const routeInfo = routes.find(r => r.name === busRoute);
    if (!routeInfo) {
        alert('Invalid route selected!');
        return;
    }
    
    // Get stops for this route
    const routeStops = stops.filter(stop => stop.route === busRoute);
    
    // Create initial stops array with origin and destination
    const initialStops = [
        { name: routeInfo.origin, arrival: departureTime, departure: departureTime },
        { name: routeInfo.destination, arrival: arrivalTime, departure: arrivalTime }
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
                arrival: stop.arrival,
                departure: stop.departure
            });
        });
        
        // Sort by arrival time
        allStops.sort((a, b) => {
            // Convert time strings to minutes for comparison
            const timeToMinutes = (timeStr) => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                return hours * 60 + minutes;
            };
            return timeToMinutes(a.arrival) - timeToMinutes(b.arrival);
        });
        
        // Reconstruct stops array with origin and destination
        allStops = [origin, ...allStops, destination];
    }
    
    const newBus = {
        id: busData.length + 1,
        number: busNumber,
        route: `${routeInfo.origin} - ${routeInfo.destination}`,
        from: routeInfo.origin.toLowerCase(),
        to: routeInfo.destination.toLowerCase(),
        departure: departureTime,
        arrival: arrivalTime,
        status: 'stopped',
        currentStop: routeInfo.origin,
        stops: allStops
    };
    
    busData.push(newBus);
    loadBusTable();
    
    // Update search options with the new bus data
    updateSearchOptions();
    
    // Save data to localStorage
    saveData();
    
    // Reset form
    document.getElementById('busNumber').value = '';
    document.getElementById('busRoute').value = '';
    document.getElementById('departureTime').value = '';
    document.getElementById('arrivalTime').value = '';
    
    alert('Bus added successfully!');
}

function loadBusTable() {
    const tbody = document.getElementById('busTableBody');
    tbody.innerHTML = busData.map(bus => `
        <tr>
            <td>${bus.number}</td>
            <td>${bus.route}</td>
            <td>${bus.departure}</td>
            <td>${bus.arrival}</td>
            <td>
                <span class="bus-status ${bus.status === 'running' ? 'status-running' : 'status-stopped'}">
                    ${bus.status === 'running' ? 'Running' : 'Stopped'}
                </span>
            </td>
            <td>
                <button class="btn" onclick="toggleBusStatus(${bus.id})" style="margin-right: 0.5rem; padding: 0.5rem 1rem; font-size: 0.8rem;">
                    ${bus.status === 'running' ? 'Stop' : 'Start'}
                </button>
                <button class="btn" onclick="editBus(${bus.id})" style="margin-right: 0.5rem; background: #4CAF50; padding: 0.5rem 1rem; font-size: 0.8rem;">
                    Edit
                </button>
                <button class="btn btn-danger" onclick="deleteBus(${bus.id})" style="padding: 0.5rem 1rem; font-size: 0.8rem;">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function toggleBusStatus(busId) {
    const bus = busData.find(b => b.id === busId);
    if (bus) {
        bus.status = bus.status === 'running' ? 'stopped' : 'running';
        loadBusTable();
        // Save data to localStorage
        saveData();
    }
}

function deleteBus(busId) {
    if (confirm('Are you sure you want to delete this bus?')) {
        busData = busData.filter(b => b.id !== busId);
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
    const stopArrival = document.getElementById('stopArrival').value;
    const stopDeparture = document.getElementById('stopDeparture').value;
    
    // Validate times
    if (!stopArrival || !stopDeparture) {
        alert('Please enter both arrival and departure times.');
        return;
    }
    
    // Check if route exists
    const routeExists = routes.some(r => r.name === stopRoute);
    if (!routeExists) {
        alert('Selected route does not exist.');
        return;
    }
    
    const newStop = {
        id: stops.length + 1,
        name: stopName,
        route: stopRoute,
        arrival: stopArrival,
        departure: stopDeparture
    };
    
    // Add stop to stops array
    stops.push(newStop);
    loadStopTable();
    
    // Update bus stops for all buses on this route
    updateBusStopsForRoute(stopRoute, newStop);
    
    // Update stoppage options
    updateStoppageOptions();
    
    // Save data to localStorage
    saveData();
    
    // Reset form
    document.getElementById('stopName').value = '';
    document.getElementById('stopRoute').value = '';
    document.getElementById('stopArrival').value = '';
    document.getElementById('stopDeparture').value = '';
    
    alert('Stop added successfully!');
}

function loadStopTable() {
    const tbody = document.getElementById('stopTableBody');
    tbody.innerHTML = stops.map(stop => `
        <tr>
            <td>${stop.name}</td>
            <td>${stop.route}</td>
            <td>${stop.arrival}</td>
            <td>${stop.departure}</td>
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