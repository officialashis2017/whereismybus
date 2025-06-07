// Edit Bus Functions
function editBus(busId) {
    const bus = busData.find(b => b.id === busId);
    if (!bus) return;
    
    // Populate form fields
    document.getElementById('editBusId').value = bus.id;
    document.getElementById('editBusNumber').value = bus.number;
    document.getElementById('editBusRoute').value = bus.route.toLowerCase().replace(/\s+/g, '-');
    document.getElementById('editBusRouteDisplay').value = bus.route;
    document.getElementById('editDepartureTime').value = bus.departure;
    document.getElementById('editArrivalTime').value = bus.arrival;
    
    // Populate stops
    populateStopRows(bus.stops);
    
    // Show modal
    document.getElementById('editBusModal').style.display = 'block';
}

function closeEditBusModal() {
    document.getElementById('editBusModal').style.display = 'none';
}

function populateStopRows(stops) {
    const container = document.getElementById('editStopsContainer');
    
    // Add header row
    let html = `
        <div class="stop-row stop-header">
            <div>Stop Name</div>
            <div>Arrival</div>
            <div>Departure</div>
            <div></div>
        </div>
    `;
    
    // Add stop rows
    if (stops && stops.length > 0) {
        stops.forEach((stop, index) => {
            html += createStopRow(index, stop);
        });
    }
    
    container.innerHTML = html;
}

function createStopRow(index, stop = {}) {
    const rowId = `stop-row-${index}`;
    const inputId = `stopName-${index}`;
    const datalistId = `stopOptions-${index}`;
    
    // Create the row HTML
    const html = `
        <div class="stop-row" id="${rowId}">
            <div>
                <input type="text" id="${inputId}" name="stopName[]" value="${stop.name || ''}" placeholder="Stop Name" list="${datalistId}" required>
                <datalist id="${datalistId}"></datalist>
            </div>
            <div>
                <input type="time" name="stopArrival[]" value="${stop.arrival || ''}" required>
            </div>
            <div>
                <input type="time" name="stopDeparture[]" value="${stop.departure || ''}" required>
            </div>
            <div>
                <button type="button" onclick="removeStopRow(${index})">×</button>
            </div>
        </div>
    `;
    
    // After the row is added to DOM, set up filtering
    setTimeout(() => {
        filterSuggestions(inputId, datalistId, allStoppagesGlobal);
    }, 0);
    
    return html;
}

function addStopRow() {
    const container = document.getElementById('editStopsContainer');
    const rowCount = container.querySelectorAll('.stop-row').length - 1; // Subtract header row
    
    const newRow = document.createElement('div');
    newRow.innerHTML = createStopRow(rowCount);
    container.appendChild(newRow.firstElementChild);
    
    // Set up filtering for the new row
    const inputId = `stopName-${rowCount}`;
    const datalistId = `stopOptions-${rowCount}`;
    filterSuggestions(inputId, datalistId, allStoppagesGlobal);
}

function removeStopRow(index) {
    const row = document.getElementById(`stop-row-${index}`);
    if (row) {
        row.remove();
    }
}

function updateBus(event) {
    event.preventDefault();
    
    console.log("Update bus function called");
    
    const busId = parseInt(document.getElementById('editBusId').value);
    console.log("Bus ID:", busId);
    
    const bus = busData.find(b => b.id === busId);
    if (!bus) {
        console.error("Bus not found with ID:", busId);
        alert("Error: Bus not found!");
        return;
    }
    
    console.log("Found bus:", bus);
    
    const busNumber = document.getElementById('editBusNumber').value;
    const busRoute = document.getElementById('editBusRoute').value;
    const departureTime = document.getElementById('editDepartureTime').value;
    const arrivalTime = document.getElementById('editArrivalTime').value;
    
    console.log("Form values:", {
        busNumber,
        busRoute,
        departureTime,
        arrivalTime
    });
    
    // Use the existing route info from the bus since we don't allow route changes
    // This ensures we always have valid route info
    const routeParts = bus.route.split(' - ');
    const routeInfo = {
        origin: routeParts[0],
        destination: routeParts[1]
    };
    
    console.log("Route info:", routeInfo);
    
    // Get all stop inputs
    const stopNames = Array.from(document.getElementsByName('stopName[]')).map(input => input.value);
    const stopArrivals = Array.from(document.getElementsByName('stopArrival[]')).map(input => input.value);
    const stopDepartures = Array.from(document.getElementsByName('stopDeparture[]')).map(input => input.value);
    
    // Create stops array
    const stops = [];
    for (let i = 0; i < stopNames.length; i++) {
        stops.push({
            name: stopNames[i],
            arrival: stopArrivals[i],
            departure: stopDepartures[i]
        });
    }
    
    // Update bus data
    bus.number = busNumber;
    // Keep the existing route
    // bus.route = `${routeInfo.origin} - ${routeInfo.destination}`;
    // bus.from = routeInfo.origin.toLowerCase();
    // bus.to = routeInfo.destination.toLowerCase();
    bus.departure = departureTime;
    bus.arrival = arrivalTime;
    bus.stops = stops;
    
    console.log("Updated bus data:", bus);
    
    // If current stop is no longer in the stops list, reset to first stop
    if (!stops.some(stop => stop.name === bus.currentStop)) {
        bus.currentStop = stops[0]?.name || '';
    }
    
    try {
        // Update UI
        loadBusTable();
        updateSearchOptions();
        
        // Save to localStorage
        saveData();
        
        // Close modal
        closeEditBusModal();
        
        alert('Bus updated successfully!');
    } catch (error) {
        console.error("Error updating bus:", error);
        alert('An error occurred while updating the bus. Please try again.');
    }
} 