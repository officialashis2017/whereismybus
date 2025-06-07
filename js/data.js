// Import Firebase services
import { busService, routeService, stopService } from './firebase-service.js';

// Sample data - default values (will be used if no data in Firebase)
const defaultBusData = [
    {
        id: "1",
        number: 'WB57A-1234',
        name: 'Kolkata Express',
        type: 'AC Sleeper',
        route: 'Kolkata - Delhi',
        from: 'kolkata',
        to: 'delhi',
        departure: '06:00',
        arrival: '22:00',
        status: 'running',
        currentStop: 'Durgapur',
        stops: [
            { name: 'Kolkata (Esplanade)', time: '06:00' },
            { name: 'Durgapur', time: '08:30' },
            { name: 'Dhanbad', time: '10:15' },
            { name: 'Varanasi', time: '14:00' },
            { name: 'Allahabad', time: '16:30' },
            { name: 'Kanpur', time: '18:00' },
            { name: 'Agra', time: '20:30' },
            { name: 'Delhi (ISBT)', time: '22:00' }
        ]
    },
    {
        id: "2",
        number: 'MH12B-5678',
        name: 'Mumbai Traveller',
        type: 'AC Seater',
        route: 'Mumbai - Bangalore',
        from: 'mumbai',
        to: 'bangalore',
        departure: '20:00',
        arrival: '12:00',
        status: 'stopped',
        currentStop: 'Pune',
        stops: [
            { name: 'Mumbai (Dadar)', time: '20:00' },
            { name: 'Pune', time: '23:30' },
            { name: 'Solapur', time: '03:00' },
            { name: 'Hubli', time: '07:00' },
            { name: 'Bangalore (Majestic)', time: '12:00' }
        ]
    }
];

const defaultRoutes = [
    { id: "1", name: 'kolkata-delhi', origin: 'Kolkata', destination: 'Delhi', distance: 1500 },
    { id: "2", name: 'mumbai-bangalore', origin: 'Mumbai', destination: 'Bangalore', distance: 980 }
];

const defaultStops = [];

// Global variable to store all stoppages for filtering
let allStoppagesGlobal = [];

// Data variables - will be populated from Firebase
let busData = [];
let routes = [];
let stops = [];

// Flag to track if data is loaded
let dataLoaded = false;

// Function to load all data from Firebase
async function loadAllData() {
    try {
        console.log("Loading data from Firebase...");
        
        // Load buses
        busData = await busService.getAllBuses();
        if (busData.length === 0) {
            console.log("No buses found in Firebase, using default data");
            
            // Add default buses to Firebase
            for (const bus of defaultBusData) {
                const busId = await busService.addBus(bus);
                console.log(`Added default bus with ID: ${busId}`);
            }
            
            // Reload buses
            busData = await busService.getAllBuses();
        }
        
        // Load routes
        routes = await routeService.getAllRoutes();
        if (routes.length === 0) {
            console.log("No routes found in Firebase, using default data");
            
            // Add default routes to Firebase
            for (const route of defaultRoutes) {
                const routeId = await routeService.addRoute(route);
                console.log(`Added default route with ID: ${routeId}`);
            }
            
            // Reload routes
            routes = await routeService.getAllRoutes();
        }
        
        // Load stops
        stops = await stopService.getAllStops();
        
        // Update the loaded flag
        dataLoaded = true;
        
        // Update UI with loaded data
        updateUI();
        
        console.log("Data loaded from Firebase");
    } catch (error) {
        console.error("Error loading data from Firebase:", error);
        
        // Fallback to local default data
        busData = [...defaultBusData];
        routes = [...defaultRoutes];
        stops = [...defaultStops];
        
        // Update UI with fallback data
        updateUI();
    }
}

// Function to update the UI after data is loaded
function updateUI() {
    // Update search options
    if (typeof updateSearchOptions === 'function') {
        updateSearchOptions();
    }
    
    // Update bus table if on admin page
    if (typeof loadBusTable === 'function') {
        loadBusTable();
    }
    
    // Update route table if on admin page
    if (typeof loadRouteTable === 'function') {
        loadRouteTable();
    }
    
    // Update stop table if on admin page
    if (typeof loadStopTable === 'function') {
        loadStopTable();
    }
    
    // Update stats if on main page
    if (typeof updateStats === 'function') {
        updateStats();
    }
}

// Function to save bus data to Firebase
async function saveBusData(bus) {
    try {
        if (bus.id) {
            // Update existing bus
            await busService.updateBus(bus.id, bus);
        } else {
            // Add new bus
            const busId = await busService.addBus(bus);
            bus.id = busId;
        }
        return true;
    } catch (error) {
        console.error("Error saving bus data:", error);
        return false;
    }
}

// Function to delete bus from Firebase
async function deleteBusData(busId) {
    try {
        await busService.deleteBus(busId);
        return true;
    } catch (error) {
        console.error("Error deleting bus:", error);
        return false;
    }
}

// Function to save route data to Firebase
async function saveRouteData(route) {
    try {
        if (route.id) {
            // Update existing route (not implemented in service yet)
            console.warn("Route update not implemented");
        } else {
            // Add new route
            const routeId = await routeService.addRoute(route);
            route.id = routeId;
        }
        return true;
    } catch (error) {
        console.error("Error saving route data:", error);
        return false;
    }
}

// Function to delete route from Firebase
async function deleteRouteData(routeId) {
    try {
        await routeService.deleteRoute(routeId);
        return true;
    } catch (error) {
        console.error("Error deleting route:", error);
        return false;
    }
}

// Function to save stop data to Firebase
async function saveStopData(stop) {
    try {
        if (stop.id) {
            // Update existing stop (not implemented in service yet)
            console.warn("Stop update not implemented");
        } else {
            // Add new stop
            const stopId = await stopService.addStop(stop);
            stop.id = stopId;
        }
        return true;
    } catch (error) {
        console.error("Error saving stop data:", error);
        return false;
    }
}

// Function to delete stop from Firebase
async function deleteStopData(stopId) {
    try {
        await stopService.deleteStop(stopId);
        return true;
    } catch (error) {
        console.error("Error deleting stop:", error);
        return false;
    }
}

// Function to convert time string to minutes since midnight
function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Function to get current time in minutes since midnight
function getCurrentTimeInMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

// Function to update current stop based on current time
async function updateCurrentStopsBasedOnTime() {
    const currentTimeMinutes = getCurrentTimeInMinutes();
    let busesUpdated = false;
    
    for (const bus of busData) {
        if (bus.status !== 'running') continue;
        
        if (!bus.stops || bus.stops.length < 2) {
            bus.currentStop = bus.stops?.[0]?.name || '';
            busesUpdated = true;
            continue;
        }
        
        // Get the time of the first stop and last stop
        const firstStopTime = timeToMinutes(bus.stops[0].time);
        const lastStopTime = timeToMinutes(bus.stops[bus.stops.length - 1].time);
        
        // Handle overnight routes (when last stop time is earlier than first stop time)
        const isOvernightRoute = lastStopTime < firstStopTime;
        
        // Check if the bus has started its journey
        const hasStarted = isOvernightRoute 
            ? (currentTimeMinutes >= firstStopTime || currentTimeMinutes <= lastStopTime)
            : (currentTimeMinutes >= firstStopTime && currentTimeMinutes <= lastStopTime);
        
        if (!hasStarted) {
            // Bus hasn't started yet or has completed its journey
            // Set current stop to the origin
            if (bus.currentStop !== bus.stops[0].name) {
                bus.currentStop = bus.stops[0].name;
                busesUpdated = true;
            }
            continue;
        }
        
        // Find the current stop based on time
        let currentStopIndex = 0;
        
        for (let i = 0; i < bus.stops.length - 1; i++) {
            const currentStopTime = timeToMinutes(bus.stops[i].time);
            const nextStopTime = timeToMinutes(bus.stops[i + 1].time);
            
            // Handle overnight travel between stops
            const isOvernightTravel = nextStopTime < currentStopTime;
            
            // Check if the current time is between this stop and the next
            const isBetweenStops = isOvernightTravel
                ? (currentTimeMinutes >= currentStopTime || currentTimeMinutes <= nextStopTime)
                : (currentTimeMinutes >= currentStopTime && currentTimeMinutes <= nextStopTime);
            
            if (isBetweenStops) {
                // If closer to the current stop
                if (Math.abs(currentTimeMinutes - currentStopTime) < Math.abs(currentTimeMinutes - nextStopTime)) {
                    currentStopIndex = i;
                } else {
                    // If closer to the next stop
                    currentStopIndex = i + 1;
                }
                break;
            }
            
            // If we've passed this stop but not yet at the next one
            if (currentTimeMinutes > currentStopTime) {
                currentStopIndex = i;
            }
        }
        
        // If we've passed all intermediate stops, set to the last stop
        if (currentTimeMinutes >= timeToMinutes(bus.stops[bus.stops.length - 1].time)) {
            currentStopIndex = bus.stops.length - 1;
        }
        
        // Update the current stop
        const newCurrentStop = bus.stops[currentStopIndex].name;
        if (bus.currentStop !== newCurrentStop) {
            bus.currentStop = newCurrentStop;
            busesUpdated = true;
        }
    }
    
    // Save the updated data if any buses were updated
    if (busesUpdated) {
        for (const bus of busData) {
            if (bus.status === 'running') {
                await busService.updateBus(bus.id, bus);
            }
        }
    }
}

// Set up Firebase real-time updates
function setupRealtimeUpdates() {
    const unsubscribe = busService.onBusesUpdate(updatedBuses => {
        console.log("Received real-time update for buses:", updatedBuses.length);
        busData = updatedBuses;
        updateUI();
    });
    
    // Return unsubscribe function for cleanup
    return unsubscribe;
}

// Export functions and data
export {
    loadAllData,
    setupRealtimeUpdates,
    updateCurrentStopsBasedOnTime,
    saveBusData,
    deleteBusData,
    saveRouteData,
    deleteRouteData,
    saveStopData,
    deleteStopData,
    timeToMinutes,
    busData,
    routes,
    stops,
    allStoppagesGlobal
}; 