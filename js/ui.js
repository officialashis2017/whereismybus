// Navigation
function showPage(pageId, linkElement) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show the selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update navigation links if linkElement is provided
    if (linkElement) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        linkElement.classList.add('active');
    }
    
    // Close mobile menu if open
    const navLinks = document.getElementById('navLinks');
    if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
    
    // Handle header switching
    if (pageId === 'home') {
        // Show main header and hide admin header
        document.getElementById('mainHeader').style.display = 'block';
        document.getElementById('adminHeader').style.display = 'none';
        
        // If returning from admin panel, ensure it's hidden
        if (document.getElementById('adminPanel') && 
            !document.getElementById('adminPanel').classList.contains('hidden')) {
            document.getElementById('adminPanel').classList.add('hidden');
            document.getElementById('adminLogin').classList.remove('hidden');
        }
    }
    
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
}

function showAdminTab(tabName, event) {
    // Prevent default behavior if event is provided
    if (event) {
        event.preventDefault();
    }
    
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to the clicked button
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Fallback if event is not provided
        const clickedButton = document.querySelector(`.admin-tab[onclick*="showAdminTab('${tabName}')"]`);
        if (clickedButton) {
            clickedButton.classList.add('active');
        }
    }
    
    document.getElementById(tabName + 'Tab').classList.add('active');
}

// Toggle mobile menu
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Format time to 12-hour format with AM/PM
function formatTime(timeStr) {
    if (!timeStr) return '';
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Update current time display in header
function updateCurrentTimeDisplay() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    
    const timeString = `${hour12}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
    
    const timeDisplay = document.getElementById('currentTime');
    if (timeDisplay) {
        timeDisplay.textContent = timeString;
    }
}

// Display buses in the UI
function displayBuses(buses) {
    const busContainer = document.getElementById('busContainer');
    if (!busContainer) return;
    
    // Clear previous results
    busContainer.innerHTML = '';
    
    // Show the results section
    document.getElementById('busResults').classList.remove('hidden');
    
    // If no buses found
    if (buses.length === 0) {
        busContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <p>No buses found for this route.</p>
            </div>
        `;
        return;
    }
    
    // Get the from and to values for displaying route info
    const from = document.getElementById('from').value || document.getElementById('stoppage').value;
    const to = document.getElementById('to') ? document.getElementById('to').value : null;
    
    console.log(`Displaying buses from ${from} to ${to || 'any destination'}`);
    
    // Display each bus
    buses.forEach(bus => {
        console.log(`Processing bus ${bus.id}: ${bus.name}`);
        
        // Find the from and to stops in the bus's stops array
        const fromStop = bus.stops.find(stop => stop.name === from);
        const toStop = to ? bus.stops.find(stop => stop.name === to) : null;
        
        if (!fromStop) {
            console.log(`Could not find fromStop ${from} in bus ${bus.id}`);
            return;
        }
        
        console.log(`Found fromStop: ${fromStop.name}, time: ${fromStop.time}`);
        if (toStop) {
            console.log(`Found toStop: ${toStop.name}, time: ${toStop.time}`);
        }
        
        // Get the current stop
        const currentStop = bus.currentStop ? bus.currentStop : 'Not started';
        
        // Create a bus card
        const busCard = document.createElement('div');
        busCard.className = 'bus-card';
        
        // Determine bus status
        let statusClass = 'status-scheduled';
        let statusText = 'Scheduled';
        
        if (bus.currentStop) {
            if (bus.currentStop === from) {
                statusClass = 'status-boarding';
                statusText = 'Boarding';
            } else if (bus.stops.findIndex(stop => stop.name === bus.currentStop) > 
                       bus.stops.findIndex(stop => stop.name === from)) {
                statusClass = 'status-departed';
                statusText = 'Departed';
            } else {
                statusClass = 'status-approaching';
                statusText = 'Approaching';
            }
        }
        
        // Format departure and arrival times
        const departureTime = fromStop ? formatTime(fromStop.time) : formatTime(bus.departure);
        const arrivalTime = toStop ? formatTime(toStop.time) : formatTime(bus.arrival);
        
        // Calculate duration
        let duration = '';
        if (fromStop && toStop) {
            const durationMinutes = calculateDuration(fromStop.time, toStop.time);
            const hours = Math.floor(durationMinutes / 60);
            const minutes = durationMinutes % 60;
            duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        }
        
        // Build the HTML for the bus card
        busCard.innerHTML = `
            <div class="bus-header">
                <div class="bus-status ${statusClass}">${statusText}</div>
                <h3>${bus.name || bus.number}</h3>
                <div class="bus-type">${bus.type || 'Standard'}</div>
            </div>
            <div class="bus-details">
                <div class="bus-route">
                    <div class="route-point">
                        <div class="time">${departureTime}</div>
                        <div class="station">${from}</div>
                    </div>
                    <div class="route-line">
                        <span class="duration">${duration}</span>
                    </div>
                    <div class="route-point">
                        <div class="time">${to ? arrivalTime : 'Final'}</div>
                        <div class="station">${to || bus.stops[bus.stops.length - 1].name}</div>
                    </div>
                </div>
                <div class="bus-info">
                    <div class="info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Current Stop: <strong>${currentStop}</strong></span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-route"></i>
                        <span>Route: <strong>${bus.route}</strong></span>
                    </div>
                </div>
                <div class="bus-actions">
                    <button class="view-details-btn" data-bus-id="${bus.id}">
                        <i class="fas fa-info-circle"></i> View Details
                    </button>
                </div>
            </div>
        `;
        
        // Add click event listener to the view details button
        const viewDetailsBtn = busCard.querySelector('.view-details-btn');
        viewDetailsBtn.addEventListener('click', function() {
            const busId = this.getAttribute('data-bus-id');
            console.log("View details button clicked for bus ID:", busId);
            viewBusDetails(busId);
        });
        
        busContainer.appendChild(busCard);
    });
    
    // Scroll to the results
    document.getElementById('busResults').scrollIntoView({ behavior: 'smooth' });
}

// Show schedule modal for a specific bus
function showSchedule(busId) {
    const bus = busData.find(b => b.id == busId);
    if (!bus) return;
    
    const modal = document.getElementById('scheduleModal');
    const modalTitle = document.getElementById('modalBusNumber');
    const timeline = document.getElementById('scheduleTimeline');
    
    modalTitle.textContent = `${bus.number} (${bus.route})`;
    timeline.innerHTML = '';
    
    bus.stops.forEach((stop, index) => {
        const isCurrentStop = stop.name === bus.currentStop;
        const stopElement = document.createElement('div');
        stopElement.className = `timeline-stop ${isCurrentStop ? 'current' : ''}`;
        
        stopElement.innerHTML = `
            <div class="timeline-point ${isCurrentStop ? 'current' : ''}"></div>
            <div class="timeline-content">
                <h4>${stop.name}</h4>
                <div class="timeline-times">
                    <span>Arrival: ${formatTime(stop.arrival)}</span>
                    <span>Departure: ${formatTime(stop.departure)}</span>
                </div>
            </div>
        `;
        
        timeline.appendChild(stopElement);
        
        // Add connecting line except for last stop
        if (index < bus.stops.length - 1) {
            const lineElement = document.createElement('div');
            lineElement.className = 'timeline-line';
            timeline.appendChild(lineElement);
        }
    });
    
    modal.style.display = 'flex';
}

// Close schedule modal when clicking outside
function closeModal(event) {
    const modal = document.getElementById('scheduleModal');
    const content = document.querySelector('.schedule-content');
    
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Close schedule modal
function closeScheduleModal() {
    document.getElementById('scheduleModal').style.display = 'none';
}

// Show admin login page
function showAdminLogin() {
    // Hide home page and show admin page
    document.getElementById('home').classList.remove('active');
    document.getElementById('admin').classList.add('active');
    
    // Show admin header and hide main header
    document.getElementById('mainHeader').style.display = 'none';
    document.getElementById('adminHeader').style.display = 'block';
    
    // Make sure login form is visible and admin panel is hidden
    document.getElementById('adminLogin').classList.remove('hidden');
    document.getElementById('adminPanel').classList.add('hidden');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Handle search tabs
document.addEventListener('DOMContentLoaded', function() {
    // Set up search tabs
    const searchTabs = document.querySelectorAll('.search-tab');
    if (searchTabs.length > 0) {
        searchTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                document.querySelectorAll('.search-tab').forEach(t => {
                    t.classList.remove('active');
                });
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Hide all panels
                document.querySelectorAll('.search-panel').forEach(panel => {
                    panel.classList.remove('active');
                });
                
                // Show the corresponding panel
                const tabId = this.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }
});

// Update stats in the hero section
function updateStats() {
    const totalBuses = document.getElementById('totalBuses');
    const totalRoutes = document.getElementById('totalRoutes');
    const totalStops = document.getElementById('totalStops');
    
    if (totalBuses && totalRoutes && totalStops) {
        // Count buses, routes, and stops
        const busCount = busData.length;
        const routeCount = routes.length;
        
        // Count unique stops
        const uniqueStops = new Set();
        busData.forEach(bus => {
            if (bus.stops && Array.isArray(bus.stops)) {
                bus.stops.forEach(stop => {
                    if (stop.name) uniqueStops.add(stop.name);
                });
            }
        });
        
        // Animate counting up
        animateCounter(totalBuses, 0, busCount);
        animateCounter(totalRoutes, 0, routeCount);
        animateCounter(totalStops, 0, uniqueStops.size);
    }
}

// Animate counter from start to end value
function animateCounter(element, start, end) {
    let current = start;
    const increment = Math.max(1, Math.floor((end - start) / 30)); // Divide animation into steps
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            clearInterval(timer);
            current = end;
        }
        element.textContent = current;
    }, 30);
}

// Populate popular routes
function populatePopularRoutes() {
    const container = document.getElementById('popularRoutes');
    if (!container) return;
    
    // Get routes sorted by most buses
    const routeUsage = {};
    busData.forEach(bus => {
        const routeName = bus.route;
        if (!routeUsage[routeName]) {
            routeUsage[routeName] = 0;
        }
        routeUsage[routeName]++;
    });
    
    // Sort routes by usage
    const sortedRoutes = Object.keys(routeUsage)
        .sort((a, b) => routeUsage[b] - routeUsage[a])
        .slice(0, 4); // Take top 4 routes
    
    // Create cards for popular routes
    sortedRoutes.forEach(routeName => {
        const route = routes.find(r => r.name === routeName.toLowerCase().replace(/\s+/g, '-'));
        if (!route) return;
        
        const card = document.createElement('div');
        card.className = 'popular-route-card';
        card.innerHTML = `
            <div class="popular-route-cities">
                <span class="city">${route.origin}</span>
                <span class="route-arrow"><i class="fas fa-long-arrow-alt-right"></i></span>
                <span class="city">${route.destination}</span>
            </div>
            <div class="popular-route-info">
                <span class="popular-route-distance">${route.distance} km</span>
                <span class="popular-route-buses">
                    <i class="fas fa-bus"></i> ${routeUsage[routeName]} buses
                </span>
            </div>
        `;
        
        // Add click event to search for this route
        card.addEventListener('click', () => {
            document.getElementById('from').value = route.origin;
            document.getElementById('to').value = route.destination;
            
            // Set date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('date').value = today;
            
            // Trigger search
            const event = new Event('submit');
            document.querySelector('.search-form').dispatchEvent(event);
        });
        
        container.appendChild(card);
    });
}

// Sort bus results
function sortBusResults(sortBy) {
    const container = document.getElementById('busContainer');
    if (!container) return;
    
    const busCards = Array.from(container.children);
    if (busCards.length === 0) return;
    
    // Get current search parameters
    const from = document.getElementById('from').value.toLowerCase();
    const to = document.getElementById('to').value.toLowerCase();
    
    // Filter buses again
    let filteredBuses = busData.filter(bus => {
        if (!bus.stops || bus.stops.length < 2) return false;
        
        const fromIndex = bus.stops.findIndex(stop => 
            stop.name && stop.name.toLowerCase() === from
        );
        const toIndex = bus.stops.findIndex(stop => 
            stop.name && stop.name.toLowerCase() === to
        );
        
        if (fromIndex === -1 || toIndex === -1) return false;
        return fromIndex < toIndex;
    });
    
    // Sort based on selected criteria
    switch (sortBy) {
        case 'departure':
            filteredBuses.sort((a, b) => {
                return timeToMinutes(a.departure) - timeToMinutes(b.departure);
            });
            break;
        case 'arrival':
            filteredBuses.sort((a, b) => {
                return timeToMinutes(a.arrival) - timeToMinutes(b.arrival);
            });
            break;
        case 'duration':
            filteredBuses.sort((a, b) => {
                const durationA = calculateDuration(a.departure, a.arrival);
                const durationB = calculateDuration(b.departure, b.arrival);
                return durationA - durationB;
            });
            break;
    }
    
    // Display sorted buses
    displayBuses(filteredBuses);
}

// Calculate duration between two time strings in minutes
function calculateDuration(startTime, endTime) {
    let start = timeToMinutes(startTime);
    let end = timeToMinutes(endTime);
    
    // Handle overnight routes
    if (end < start) {
        end += 24 * 60; // Add 24 hours
    }
    
    return end - start;
}

// View bus details
function viewBusDetails(busId) {
    console.log("viewBusDetails called with ID:", busId, "type:", typeof busId);
    
    // Find the bus by ID - try both string and number comparison
    let bus = null;
    for (let i = 0; i < busData.length; i++) {
        if (String(busData[i].id) === String(busId)) {
            bus = busData[i];
            break;
        }
    }
    
    if (!bus) {
        console.error(`Bus with ID ${busId} not found in ${busData.length} buses`);
        alert("Error: Bus details not found!");
        return;
    }
    
    console.log(`Found bus:`, bus);
    
    try {
        // Calculate the progress percentage based on current stop
        let progressPercent = 0;
        if (bus.stops && bus.stops.length > 0 && bus.currentStop) {
            const currentStopIndex = bus.stops.findIndex(stop => 
                stop.name && stop.name.toLowerCase() === bus.currentStop.toLowerCase()
            );
            if (currentStopIndex !== -1) {
                progressPercent = ((currentStopIndex + 1) / bus.stops.length) * 100;
            }
        }
        
        // Ensure stops array exists
        const stops = bus.stops || [];
        const firstStop = stops.length > 0 ? stops[0].name : 'Departure';
        const lastStop = stops.length > 0 ? stops[stops.length - 1].name : 'Arrival';
        
        // Get the bus results section
        const busResultsSection = document.getElementById('busResults');
        
        // Check if details section already exists and remove it
        const existingDetails = document.getElementById('busDetailsSection');
        if (existingDetails) {
            existingDetails.remove();
        }
        
        // Create bus details section
        const busDetailsSection = document.createElement('div');
        busDetailsSection.id = 'busDetailsSection';
        busDetailsSection.className = 'bus-details-section';
        
        // Build the details content
        busDetailsSection.innerHTML = `
            <div class="details-header">
                <h2>${bus.name || bus.number || 'Bus Details'}</h2>
                <button class="close-details">&times;</button>
            </div>
            <div class="details-content">
                <div class="bus-details-header">
                    <div class="bus-details-info">
                        <div class="info-group">
                            <div class="info-label">Bus Number</div>
                            <div class="info-value">${bus.number || 'N/A'}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-label">Route</div>
                            <div class="info-value">${bus.route || 'N/A'}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-label">Type</div>
                            <div class="info-value">${bus.type || 'Standard'}</div>
                        </div>
                        <div class="info-group">
                            <div class="info-label">Status</div>
                            <div class="info-value">${bus.status === 'running' ? 'Running' : 'Stopped'}</div>
                        </div>
                    </div>
                </div>
                
                <div class="journey-progress">
                    <h3>Journey Progress</h3>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-labels">
                        <span>${firstStop}</span>
                        <span>${Math.round(progressPercent)}%</span>
                        <span>${lastStop}</span>
                    </div>
                </div>
                
                <div class="stops-timeline">
                    <h3>Stops Timeline</h3>
                    <div class="timeline">
                        ${stops.length > 0 ? stops.map((stop, index) => {
                            const isCurrent = stop.name && bus.currentStop && 
                                stop.name.toLowerCase() === bus.currentStop.toLowerCase();
                            const isPast = bus.currentStop && 
                                stops.findIndex(s => s.name && s.name.toLowerCase() === bus.currentStop.toLowerCase()) > index;
                            
                            let statusClass = '';
                            if (isCurrent) statusClass = 'current';
                            else if (isPast) statusClass = 'past';
                            
                            // Handle different stop formats - some stops might have arrival/departure, others just time
                            const timeDisplay = stop.arrival && stop.departure ? 
                                `<div class="timeline-time">
                                    <span class="time-label">Arrival:</span> ${formatTime(stop.arrival)}
                                </div>
                                <div class="timeline-time">
                                    <span class="time-label">Departure:</span> ${formatTime(stop.departure)}
                                </div>` : 
                                `<div class="timeline-time">${formatTime(stop.time)}</div>`;
                            
                            return `
                                <div class="timeline-item ${statusClass}">
                                    <div class="timeline-point"></div>
                                    <div class="timeline-content">
                                        ${timeDisplay}
                                        <div class="timeline-title">${stop.name}</div>
                                    </div>
                                </div>
                            `;
                        }).join('') : '<div class="no-data">No stops information available</div>'}
                    </div>
                </div>
            </div>
        `;
        
        // Add the details section after the bus results
        busResultsSection.appendChild(busDetailsSection);
        
        // Scroll to the details section
        busDetailsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Add event listener to close button
        const closeButton = busDetailsSection.querySelector('.close-details');
        closeButton.addEventListener('click', () => {
            busDetailsSection.remove();
        });
        
    } catch (error) {
        console.error("Error displaying bus details:", error);
        alert("An error occurred while displaying bus details. Please try again.");
    }
} 