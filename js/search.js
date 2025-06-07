// Import data from data.js
import { busData, allStoppagesGlobal, updateCurrentStopsBasedOnTime } from './data.js';

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

// Update search options based on available data
function updateSearchOptions() {
    // Get all unique origins and destinations
    const origins = new Set();
    const destinations = new Set();
    const stoppages = new Set();
    
    // Collect all stoppages for global use
    allStoppagesGlobal = [];
    
    busData.forEach(bus => {
        if (bus.from) origins.add(bus.from);
        if (bus.to) destinations.add(bus.to);
        
        // Add all stops to the stoppages set
        if (bus.stops && Array.isArray(bus.stops)) {
            bus.stops.forEach(stop => {
                if (stop.name) {
                    stoppages.add(stop.name);
                    
                    // Add to global stoppages with bus info
                    allStoppagesGlobal.push({
                        stopName: stop.name,
                        busNumber: bus.number,
                        busId: bus.id,
                        busName: bus.name,
                        time: stop.time
                    });
                }
            });
        }
    });
    
    // Add stops from the first and last position if they exist
    busData.forEach(bus => {
        if (bus.stops && Array.isArray(bus.stops) && bus.stops.length > 0) {
            // Add first stop as origin if not already added
            if (bus.stops[0] && bus.stops[0].name) {
                origins.add(bus.stops[0].name);
            }
            
            // Add last stop as destination if not already added
            if (bus.stops.length > 1 && bus.stops[bus.stops.length - 1] && bus.stops[bus.stops.length - 1].name) {
                destinations.add(bus.stops[bus.stops.length - 1].name);
            }
        }
    });
    
    // Update datalists
    populateDatalist('fromOptions', Array.from(origins));
    populateDatalist('toOptions', Array.from(destinations));
    
    // Initialize the custom stoppage dropdown
    initializeStoppageDropdown(Array.from(stoppages));
    
    // Add input event listeners for filtering
    setupInputFiltering();
}

// Initialize custom stoppage dropdown
function initializeStoppageDropdown(stoppages) {
    const stoppageInput = document.getElementById('stoppage');
    const stoppageDropdown = document.getElementById('stoppageDropdown');
    
    if (!stoppageInput || !stoppageDropdown) return;
    
    // Sort stoppages alphabetically
    stoppages.sort();
    
    // Add event listener to input field
    stoppageInput.addEventListener('input', function() {
        const inputValue = this.value.toLowerCase();
        
        // Filter stoppages based on input
        const filteredStoppages = stoppages.filter(stop => 
            stop.toLowerCase().includes(inputValue)
        ).slice(0, 5); // Limit to 5 results
        
        // Update dropdown
        updateStoppageDropdown(filteredStoppages, inputValue);
        
        // Show dropdown if we have results and input is not empty
        if (filteredStoppages.length > 0 && inputValue.trim() !== '') {
            stoppageDropdown.classList.add('show');
        } else {
            stoppageDropdown.classList.remove('show');
        }
    });
    
    // Add event listener to handle dropdown item click
    stoppageDropdown.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('dropdown-item')) {
            stoppageInput.value = e.target.textContent;
            stoppageDropdown.classList.remove('show');
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== stoppageInput && e.target !== stoppageDropdown) {
            stoppageDropdown.classList.remove('show');
        }
    });
    
    // Prevent clicks inside dropdown from closing it
    stoppageDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// Update the stoppage dropdown with filtered results
function updateStoppageDropdown(filteredStoppages, inputValue) {
    const stoppageDropdown = document.getElementById('stoppageDropdown');
    
    if (!stoppageDropdown) return;
    
    // Clear current dropdown items
    stoppageDropdown.innerHTML = '';
    
    if (filteredStoppages.length === 0) {
        stoppageDropdown.innerHTML = '<div class="dropdown-item no-results">No stops found</div>';
        return;
    }
    
    // Add filtered items to dropdown
    filteredStoppages.forEach(stop => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        
        // Highlight the matching text
        if (inputValue) {
            const regex = new RegExp(`(${inputValue})`, 'gi');
            item.innerHTML = stop.replace(regex, '<strong>$1</strong>');
        } else {
            item.textContent = stop;
        }
        
        stoppageDropdown.appendChild(item);
    });
}

// Populate a datalist with options
function populateDatalist(datalistId, options) {
    const datalist = document.getElementById(datalistId);
    if (!datalist) return;
    
    datalist.innerHTML = '';
    options.forEach(option => {
        const optionEl = document.createElement('option');
        optionEl.value = option;
        datalist.appendChild(optionEl);
    });
}

// Set up input filtering for datalists
function setupInputFiltering() {
    // From input filtering
    const fromInput = document.getElementById('from');
    if (fromInput) {
        fromInput.addEventListener('input', function() {
            const value = this.value.toLowerCase();
            const toInput = document.getElementById('to');
            
            if (value && toInput) {
                // Filter destinations based on available routes
                const availableDestinations = new Set();
                
                busData.forEach(bus => {
                    if (bus.from && bus.from.toLowerCase() === value) {
                        availableDestinations.add(bus.to);
                    }
                    
                    // Check if any stop matches the from value
                    if (bus.stops && Array.isArray(bus.stops)) {
                        const fromStopIndex = bus.stops.findIndex(stop => 
                            stop.name && stop.name.toLowerCase() === value
                        );
                        
                        if (fromStopIndex >= 0) {
                            // Add all stops after this one as possible destinations
                            bus.stops.slice(fromStopIndex + 1).forEach(stop => {
                                if (stop.name) availableDestinations.add(stop.name);
                            });
                        }
                    }
                });
                
                populateDatalist('toOptions', Array.from(availableDestinations));
            } else {
                // Reset to all destinations
                const allDestinations = new Set();
                busData.forEach(bus => {
                    if (bus.to) allDestinations.add(bus.to);
                });
                populateDatalist('toOptions', Array.from(allDestinations));
            }
        });
    }
    
    // To input filtering
    const toInput = document.getElementById('to');
    if (toInput) {
        toInput.addEventListener('input', function() {
            const value = this.value.toLowerCase();
            const fromInput = document.getElementById('from');
            
            if (value && fromInput) {
                // Filter origins based on available routes
                const availableOrigins = new Set();
                
                busData.forEach(bus => {
                    if (bus.to && bus.to.toLowerCase() === value) {
                        availableOrigins.add(bus.from);
                    }
                    
                    // Check if any stop matches the to value
                    if (bus.stops && Array.isArray(bus.stops)) {
                        const toStopIndex = bus.stops.findIndex(stop => 
                            stop.name && stop.name.toLowerCase() === value
                        );
                        
                        if (toStopIndex >= 0) {
                            // Add all stops before this one as possible origins
                            bus.stops.slice(0, toStopIndex).forEach(stop => {
                                if (stop.name) availableOrigins.add(stop.name);
                            });
                        }
                    }
                });
                
                populateDatalist('fromOptions', Array.from(availableOrigins));
            } else {
                // Reset to all origins
                const allOrigins = new Set();
                busData.forEach(bus => {
                    if (bus.from) allOrigins.add(bus.from);
                });
                populateDatalist('fromOptions', Array.from(allOrigins));
            }
        });
    }
}

// Search buses based on form input
function searchBuses(event) {
    event.preventDefault();
    
    // Make sure current stops are up to date
    updateCurrentStopsBasedOnTime();
    
    const from = document.getElementById('from').value.toLowerCase();
    const to = document.getElementById('to').value.toLowerCase();
    const date = document.getElementById('date').value;
    
    console.log(`Searching for buses from ${from} to ${to}`);
    
    // Filter buses based on from/to
    const filteredBuses = busData.filter(bus => {
        if (!bus.stops || bus.stops.length < 2) {
            console.log(`Bus ${bus.id} has no valid stops`);
            return false;
        }
        
        // Check if both stops exist in this bus's route
        const fromIndex = bus.stops.findIndex(stop => 
            stop.name && stop.name.toLowerCase() === from
        );
        const toIndex = bus.stops.findIndex(stop => 
            stop.name && stop.name.toLowerCase() === to
        );
        
        console.log(`Bus ${bus.id}: fromIndex=${fromIndex}, toIndex=${toIndex}`);
        
        if (fromIndex === -1 || toIndex === -1) return false;
        
        // Check if 'from' stop comes before 'to' stop in the route
        return fromIndex < toIndex;
    });
    
    console.log(`Found ${filteredBuses.length} buses`);
    
    // Display filtered buses
    displayBuses(filteredBuses);
}

// Search buses by stoppage
function searchByStoppage(event) {
    event.preventDefault();
    
    // Make sure current stops are up to date
    updateCurrentStopsBasedOnTime();
    
    const stoppage = document.getElementById('stoppage').value.toLowerCase();
    const date = document.getElementById('stopDate').value;
    
    console.log(`Searching for buses passing through ${stoppage}`);
    
    // Filter buses that pass through this stoppage
    const filteredBuses = busData.filter(bus => {
        if (!bus.stops || bus.stops.length < 2) {
            console.log(`Bus ${bus.id} has no valid stops`);
            return false;
        }
        
        // Check if the stoppage exists in this bus's route
        const hasStop = bus.stops.some(stop => 
            stop.name && stop.name.toLowerCase() === stoppage
        );
        console.log(`Bus ${bus.id} has stop ${stoppage}: ${hasStop}`);
        return hasStop;
    });
    
    console.log(`Found ${filteredBuses.length} buses`);
    
    // Display filtered buses
    displayBuses(filteredBuses);
}

// Handle stoppage input
function handleStoppageInput() {
    const stoppageInput = document.getElementById('stoppage');
    const stoppageDropdown = document.getElementById('stoppageDropdown');
    
    if (!stoppageInput || !stoppageDropdown) return;
    
    const inputValue = stoppageInput.value.toLowerCase();
    
    // Get all unique stoppages
    const allStoppages = new Set();
    busData.forEach(bus => {
        if (bus.stops && Array.isArray(bus.stops)) {
            bus.stops.forEach(stop => {
                if (stop.name) allStoppages.add(stop.name);
            });
        }
    });
    
    // Filter stoppages based on input
    const filteredStoppages = Array.from(allStoppages)
        .filter(stop => stop.toLowerCase().includes(inputValue))
        .slice(0, 5); // Limit to 5 results
    
    // Update dropdown
    updateStoppageDropdown(filteredStoppages, inputValue);
    
    // Show dropdown if we have results and input is not empty
    if (filteredStoppages.length > 0 && inputValue.trim() !== '') {
        stoppageDropdown.classList.add('show');
    } else {
        stoppageDropdown.classList.remove('show');
    }
}

// Export functions for use in other modules
export {
    filterSuggestions,
    updateSearchOptions,
    initializeStoppageDropdown,
    updateStoppageDropdown,
    populateDatalist,
    setupInputFiltering,
    searchBuses,
    searchByStoppage,
    handleStoppageInput
}; 