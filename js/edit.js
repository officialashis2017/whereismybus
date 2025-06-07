// Edit Bus Functions
function editBus(busId) {
    console.log("Editing bus with ID:", busId, "type:", typeof busId);
    
    const bus = busData.find(b => String(b.id) === String(busId));
    if (!bus) {
        console.error(`Bus with ID ${busId} not found when editing`);
        alert("Error: Bus not found!");
        return;
    }
    
    console.log("Found bus for editing:", bus);
    
    // Populate form fields
    document.getElementById('editBusId').value = bus.id;
    document.getElementById('editBusNumber').value = bus.number;
    document.getElementById('editBusRoute').value = bus.route.toLowerCase().replace(/\s+/g, '-');
    document.getElementById('editBusRouteDisplay').value = bus.route;
    
    // Convert 24-hour times to 12-hour format for the inputs
    const departureTimes = convertTo12Hour(bus.departure);
    const arrivalTimes = convertTo12Hour(bus.arrival);
    
    // Set the time input fields
    document.getElementById('editDepartureHour').value = departureTimes.hour;
    document.getElementById('editDepartureMinute').value = departureTimes.minute;
    document.getElementById('editDepartureAmPm').value = departureTimes.ampm;
    
    document.getElementById('editArrivalHour').value = arrivalTimes.hour;
    document.getElementById('editArrivalMinute').value = arrivalTimes.minute;
    document.getElementById('editArrivalAmPm').value = arrivalTimes.ampm;
    
    // Store the original 24-hour times in hidden fields
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
            <div>Time</div>
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
    
    // Convert 24-hour time to 12-hour format
    const timeParts = convertTo12Hour(stop.time);
    
    // Create the row HTML with AM/PM time inputs
    const html = `
        <div class="stop-row" id="${rowId}">
            <div>
                <input type="text" id="${inputId}" name="stopName[]" value="${stop.name || ''}" placeholder="Stop Name" list="${datalistId}" required>
                <datalist id="${datalistId}"></datalist>
            </div>
            <div class="time-input-container">
                <input type="number" name="stopTimeHour[]" min="1" max="12" placeholder="HH" value="${timeParts.hour}" required style="width: 40px">
                <span>:</span>
                <input type="number" name="stopTimeMinute[]" min="0" max="59" placeholder="MM" value="${timeParts.minute}" required style="width: 40px">
                <select name="stopTimeAmPm[]" style="width: 60px">
                    <option value="AM" ${timeParts.ampm === 'AM' ? 'selected' : ''}>AM</option>
                    <option value="PM" ${timeParts.ampm === 'PM' ? 'selected' : ''}>PM</option>
                </select>
                <input type="hidden" name="stopTime[]" value="${stop.time || ''}">
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
    
    const busId = document.getElementById('editBusId').value;
    console.log("Bus ID:", busId, "type:", typeof busId);
    
    const bus = busData.find(b => String(b.id) === String(busId));
    if (!bus) {
        console.error("Bus not found with ID:", busId);
        alert("Error: Bus not found!");
        return;
    }
    
    console.log("Found bus:", bus);
    
    const busNumber = document.getElementById('editBusNumber').value;
    const busRoute = document.getElementById('editBusRoute').value;
    
    // Get time values from the new input fields
    const departureHour = document.getElementById('editDepartureHour').value;
    const departureMinute = document.getElementById('editDepartureMinute').value;
    const departureAmPm = document.getElementById('editDepartureAmPm').value;
    
    const arrivalHour = document.getElementById('editArrivalHour').value;
    const arrivalMinute = document.getElementById('editArrivalMinute').value;
    const arrivalAmPm = document.getElementById('editArrivalAmPm').value;
    
    // Convert to 24-hour format for storage
    const departureTime = convertTo24Hour(departureHour, departureMinute, departureAmPm);
    const arrivalTime = convertTo24Hour(arrivalHour, arrivalMinute, arrivalAmPm);
    
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
    
    // Get time values from the new input fields
    const stopTimeHours = Array.from(document.getElementsByName('stopTimeHour[]')).map(input => input.value);
    const stopTimeMinutes = Array.from(document.getElementsByName('stopTimeMinute[]')).map(input => input.value);
    const stopTimeAmPms = Array.from(document.getElementsByName('stopTimeAmPm[]')).map(input => input.value);
    
    // Create stops array
    const stops = [];
    for (let i = 0; i < stopNames.length; i++) {
        // Convert to 24-hour format
        const time = convertTo24Hour(stopTimeHours[i], stopTimeMinutes[i], stopTimeAmPms[i]);
        
        stops.push({
            name: stopNames[i],
            time: time
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