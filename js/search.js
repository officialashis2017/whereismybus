// Function to filter dropdown suggestions based on user input
function filterSuggestions(inputId, datalistId, allOptions) {
    const input = document.getElementById(inputId);
    const datalist = document.getElementById(datalistId);
    
    if (!input || !datalist) return;
    
    input.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        
        // Clear existing options
        datalist.innerHTML = '';
        
        // If no input, show nothing
        if (!value) return;
        
        // Filter options that start with the input value
        let matchingOptions = allOptions.filter(option => 
            option.toLowerCase().startsWith(value)
        );
        
        // If no options start with the input, try to find options that include the input
        if (matchingOptions.length === 0) {
            matchingOptions = allOptions.filter(option => 
                option.toLowerCase().includes(value)
            );
        }
        
        // Limit to 5 suggestions
        matchingOptions = matchingOptions.slice(0, 5);
        
        // Add filtered options to datalist
        matchingOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            datalist.appendChild(optionElement);
        });
    });
}

// Add new function to update search form options
function updateSearchOptions() {
    // Get all unique stoppages from all buses
    const allStoppages = new Set();
    
    busData.forEach(bus => {
        if (bus.stops && bus.stops.length > 0) {
            bus.stops.forEach(stop => {
                allStoppages.add(stop.name);
            });
        }
    });
    
    // Convert Set to sorted Array
    allStoppagesGlobal = [...allStoppages].sort();
    
    // Clear datalists initially
    document.getElementById('fromOptions').innerHTML = '';
    document.getElementById('toOptions').innerHTML = '';
    document.getElementById('stoppageOptions').innerHTML = '';
    
    // Set up filtering for from input
    filterSuggestions('from', 'fromOptions', allStoppagesGlobal);
    
    // Set up filtering for to input
    filterSuggestions('to', 'toOptions', allStoppagesGlobal);
    
    // Set up filtering for stoppage input
    filterSuggestions('stoppage', 'stoppageOptions', allStoppagesGlobal);
    
    // Trigger input event on fields that already have values to update their suggestions
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    const stoppageInput = document.getElementById('stoppage');
    
    if (fromInput && fromInput.value) {
        fromInput.dispatchEvent(new Event('input'));
    }
    
    if (toInput && toInput.value) {
        toInput.dispatchEvent(new Event('input'));
    }
    
    if (stoppageInput && stoppageInput.value) {
        stoppageInput.dispatchEvent(new Event('input'));
    }
}

// Function to update stoppage options - now just updates the global list
function updateStoppageOptions() {
    // Just call updateSearchOptions which will update everything
    updateSearchOptions();
}

// Search functionality
function searchBuses(event) {
    event.preventDefault();
    
    const from = document.getElementById('from').value.trim();
    const to = document.getElementById('to').value.trim();
    const date = document.getElementById('date').value;
    
    if (!from || !to) {
        alert('Please enter both origin and destination');
        return;
    }

    // Find buses that have the specified stops in their route
    const filteredBuses = busData.filter(bus => {
        if (!bus.stops || bus.stops.length < 2) return false;
        
        // Check if both stops exist in this bus's route
        const hasFromStop = bus.stops.some(stop => stop.name === from);
        const hasToStop = bus.stops.some(stop => stop.name === to);
        
        if (!hasFromStop || !hasToStop) return false;
        
        // Check if 'from' stop comes before 'to' stop in the route
        const fromIndex = bus.stops.findIndex(stop => stop.name === from);
        const toIndex = bus.stops.findIndex(stop => stop.name === to);
        
        return fromIndex < toIndex;
    });

    displayBuses(filteredBuses);
}

// Function to search buses by stoppage
function searchByStoppage(event) {
    event.preventDefault();
    
    const stoppage = document.getElementById('stoppage').value.trim();
    const date = document.getElementById('stopDate').value;
    
    if (!stoppage) {
        alert('Please enter a stoppage');
        return;
    }
    
    // Find buses that pass through this stoppage
    const filteredBuses = busData.filter(bus => {
        if (!bus.stops || bus.stops.length === 0) return false;
        
        // Check if any stop name contains the search term (case insensitive)
        const searchTerm = stoppage.toLowerCase();
        return bus.stops.some(stop => 
            stop.name.toLowerCase() === searchTerm || 
            stop.name.toLowerCase().includes(searchTerm)
        );
    });
    
    // Display results
    displayBuses(filteredBuses);
} 