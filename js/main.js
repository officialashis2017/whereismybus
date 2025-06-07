// Main.js - Entry point for the application
import { loadAllData, setupRealtimeUpdates, updateCurrentStopsBasedOnTime, busData } from './data.js';
import { adminLogin, adminLogout, updateRouteSelects, loadAdminData } from './admin.js';
import { updateSearchOptions, handleStoppageInput, searchBuses, searchByStoppage } from './search.js';
import { showPage, updateCurrentTimeDisplay, displayBuses, closeScheduleModal, closeEditBusModal, updateStats, populatePopularRoutes } from './ui.js';

// Make functions globally available for HTML event handlers
window.adminLogin = adminLogin;
window.adminLogout = adminLogout;
window.showAdminLogin = function() {
    showPage('admin', null);
};
window.searchBuses = searchBuses;
window.searchByStoppage = searchByStoppage;
window.handleStoppageInput = handleStoppageInput;
window.showAdminTab = function(tabName, element) {
    // Hide all admin content
    document.querySelectorAll('.admin-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show the selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Update active tab button
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    element.classList.add('active');
};
window.toggleMobileMenu = function() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
};
window.showPage = showPage;
window.updateRouteSelects = updateRouteSelects;
window.updateSearchOptions = updateSearchOptions;

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log("Initializing application...");
    
    try {
        // Load data from Firebase
        await loadAllData();
        
        // Set up real-time updates
        const unsubscribe = setupRealtimeUpdates();
        
        // Log bus data for debugging
        console.log("Bus data loaded:", busData);
        console.log("Bus data types:", busData.map(bus => ({
            id: bus.id,
            idType: typeof bus.id,
            name: bus.name,
            stops: bus.stops ? bus.stops.length : 0
        })));
        
        // Initialize the UI components
        initUI();
        
        // Update the current stop for each bus based on current time
        await updateCurrentStopsBasedOnTime();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize dynamic UI elements
        initDynamicUI();
        
        console.log("Application initialized with", busData.length, "buses");
    } catch (error) {
        console.error("Error initializing application:", error);
        alert("An error occurred while loading the application. Please try again later.");
    }
});

// Initialize dynamic UI elements
function initDynamicUI() {
    // Update statistics in the hero section
    updateStats();
    
    // Populate popular routes
    populatePopularRoutes();
    
    // Set today's date as default in date inputs
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.value = today;
    });
    
    // Initialize animated particles
    initParticles();
}

// Initialize animated particles in the hero section
function initParticles() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    // Create and append particles
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${5 + Math.random() * 10}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        heroSection.appendChild(particle);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Event listener for the search form
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', searchBuses);
    }
    
    // Event listener for the stoppage search form
    const stoppageForm = document.querySelector('#stop-search form');
    if (stoppageForm) {
        stoppageForm.addEventListener('submit', searchByStoppage);
    }
    
    // Event listener for the stoppage input field
    const stoppageInput = document.getElementById('stoppage');
    if (stoppageInput) {
        stoppageInput.addEventListener('input', handleStoppageInput);
    }
    
    // Event listener for window resize to handle responsive UI
    window.addEventListener('resize', handleResize);
    
    // Event listener for orientation change on mobile devices
    window.addEventListener('orientationchange', handleOrientationChange);
}

// Handle window resize event
function handleResize() {
    // Adjust UI based on window size
    const isMobile = window.innerWidth < 768;
    
    // Additional responsive adjustments can be added here
}

// Handle orientation change event on mobile devices
function handleOrientationChange() {
    // Handle orientation change for mobile devices
    setTimeout(() => {
        // Add a small delay to ensure the orientation change is complete
        handleResize();
    }, 100);
}

// Function to handle stoppage input
function handleStoppageInput() {
    // This function is defined in search.js
    // It's referenced here to ensure it's properly connected
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    document.getElementById('stopDate').value = today;
    
    // Set default values for time inputs
    initializeTimeInputs();
    
    // Update route selects and search options on page load
    updateRouteSelects();
    updateSearchOptions();
    
    // Set up initial filtering for datalists
    const inputs = ['from', 'to', 'stoppage'];
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            // Clear any existing listeners
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
        }
    });
    
    // Re-apply filtering
    updateSearchOptions();
    
    // Update current stops based on the current time when the page loads
    updateCurrentStopsBasedOnTime();
    
    // Start the clock
    updateCurrentTimeDisplay();
    setInterval(updateCurrentTimeDisplay, 1000); // Update every second
    
    // Set up timer to update current stops every minute
    setInterval(updateCurrentStopsBasedOnTime, 60000); // 60000 ms = 1 minute
    
    // Add event listener for orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Add event listener for resize
    window.addEventListener('resize', debounce(handleResize, 250));
});

// Function to handle orientation changes
function handleOrientationChange() {
    // Close mobile menu if open
    const navLinks = document.getElementById('navLinks');
    if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
    
    // Adjust modal positions if open
    const scheduleModal = document.getElementById('scheduleModal');
    const editBusModal = document.getElementById('editBusModal');
    
    if (scheduleModal && scheduleModal.style.display === 'flex') {
        // Force reflow
        scheduleModal.style.display = 'none';
        setTimeout(() => {
            scheduleModal.style.display = 'flex';
        }, 10);
    }
    
    if (editBusModal && editBusModal.style.display === 'flex') {
        // Force reflow
        editBusModal.style.display = 'none';
        setTimeout(() => {
            editBusModal.style.display = 'flex';
        }, 10);
    }
}

// Debounce function to limit how often a function is called
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// Function to handle window resize
function handleResize() {
    // Adjust UI elements based on screen size
    const isMobile = window.innerWidth <= 768;
    
    // Update any UI elements that need to change based on screen size
    if (isMobile) {
        // Mobile-specific adjustments
        document.querySelectorAll('.time-input-container').forEach(container => {
            container.classList.add('mobile');
        });
    } else {
        // Desktop-specific adjustments
        document.querySelectorAll('.time-input-container').forEach(container => {
            container.classList.remove('mobile');
        });
    }
}

// Function to initialize time inputs with default values
function initializeTimeInputs() {
    // Set default values for time inputs (9:00 AM for departures, 5:00 PM for arrivals)
    document.getElementById('departureHour').value = '9';
    document.getElementById('departureMinute').value = '00';
    document.getElementById('departureAmPm').value = 'AM';
    
    document.getElementById('arrivalHour').value = '5';
    document.getElementById('arrivalMinute').value = '00';
    document.getElementById('arrivalAmPm').value = 'PM';
    
    document.getElementById('stopArrivalHour').value = '10';
    document.getElementById('stopArrivalMinute').value = '30';
    document.getElementById('stopArrivalAmPm').value = 'AM';
    
    document.getElementById('stopDepartureHour').value = '10';
    document.getElementById('stopDepartureMinute').value = '45';
    document.getElementById('stopDepartureAmPm').value = 'AM';
    
    // Add event listeners to validate time inputs
    const hourInputs = document.querySelectorAll('input[type="number"][min="1"][max="12"]');
    hourInputs.forEach(input => {
        input.addEventListener('blur', function() {
            let value = parseInt(this.value);
            if (isNaN(value) || value < 1) {
                this.value = '1';
            } else if (value > 12) {
                this.value = '12';
            } else {
                this.value = value.toString();
            }
        });
    });
    
    const minuteInputs = document.querySelectorAll('input[type="number"][min="0"][max="59"]');
    minuteInputs.forEach(input => {
        input.addEventListener('blur', function() {
            let value = parseInt(this.value);
            if (isNaN(value) || value < 0) {
                this.value = '00';
            } else if (value > 59) {
                this.value = '59';
            } else {
                this.value = value.toString().padStart(2, '0');
            }
        });
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeScheduleModal();
        closeEditBusModal();
    }
});

// Auto-refresh bus status (simulate real-time updates)
setInterval(() => {
    // Update current stops based on the current time
    updateCurrentStopsBasedOnTime();
    
    // Reload bus results if visible
    const resultsSection = document.getElementById('busResults');
    if (!resultsSection.classList.contains('hidden')) {
        const container = document.getElementById('busContainer');
        if (container.children.length > 0) {
            // Re-search with current form values
            const from = document.getElementById('from').value;
            const to = document.getElementById('to').value;
            if (from && to) {
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
        }
    }
}, 30000); // Update every 30 seconds

// Remove the old load/save functions as they are now in data.js
// function loadData() {...}
// function saveData() {...} 