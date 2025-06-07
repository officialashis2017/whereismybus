// Sample data - default values
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
    { id: 1, name: 'kolkata-delhi', origin: 'Kolkata', destination: 'Delhi', distance: 1500 },
    { id: 2, name: 'mumbai-bangalore', origin: 'Mumbai', destination: 'Bangalore', distance: 980 }
];

const defaultStops = [];

// Global variable to store all stoppages for filtering
let allStoppagesGlobal = [];

// Load data from localStorage or use defaults
let busData = JSON.parse(localStorage.getItem('busData')) || defaultBusData;
let routes = JSON.parse(localStorage.getItem('routes')) || defaultRoutes;
let stops = JSON.parse(localStorage.getItem('stops')) || defaultStops;

// Function to save data to localStorage
function saveData() {
    localStorage.setItem('busData', JSON.stringify(busData));
    localStorage.setItem('routes', JSON.stringify(routes));
    localStorage.setItem('stops', JSON.stringify(stops));
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
function updateCurrentStopsBasedOnTime() {
    const currentTimeMinutes = getCurrentTimeInMinutes();
    
    busData.forEach(bus => {
        if (bus.status !== 'running') return;
        
        if (!bus.stops || bus.stops.length < 2) {
            bus.currentStop = bus.stops?.[0]?.name || '';
            return;
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
            bus.currentStop = bus.stops[0].name;
            return;
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
        bus.currentStop = bus.stops[currentStopIndex].name;
    });
    
    // Save the updated data
    saveData();
}

// Function to update bus stops based on route
function updateBusStopsForRoute(routeName, newStop) {
    // Find all buses on this route
    busData.forEach(bus => {
        if (bus.route.toLowerCase().replace(/\s+/g, '-') === routeName) {
            // Check if the stop already exists
            const existingStop = bus.stops.find(s => s.name === newStop.name);
            if (!existingStop) {
                // Sort stops by time
                const allStops = [...bus.stops];
                
                // Remove origin and destination which will be added back
                const origin = allStops.shift();
                const destination = allStops.pop();
                
                // Add the new stop
                allStops.push({
                    name: newStop.name,
                    time: newStop.time
                });
                
                // Sort by time (excluding origin and destination)
                allStops.sort((a, b) => {
                    // Convert time strings to minutes for comparison
                    const timeToMinutes = (timeStr) => {
                        const [hours, minutes] = timeStr.split(':').map(Number);
                        return hours * 60 + minutes;
                    };
                    return timeToMinutes(a.time) - timeToMinutes(b.time);
                });
                
                // Reconstruct stops array with origin and destination
                bus.stops = [origin, ...allStops, destination];
            }
        }
    });
}

// Example data structure for a bus with arrival and departure times
const busExample = {
    id: 1,
    number: "WB57A-1234",
    route: "Delhi - Kolkata",
    type: "Express",
    status: "running",
    currentStop: "Agra",
    stops: [
        {
            name: "Delhi (ISBT)",
            arrival: "08:00",
            departure: "08:30",
            time: "08:00"  // For backward compatibility
        },
        {
            name: "Agra",
            arrival: "11:30",
            departure: "12:00",
            time: "11:30"
        },
        {
            name: "Kanpur",
            arrival: "15:00",
            departure: "15:30",
            time: "15:00"
        },
        {
            name: "Allahabad",
            arrival: "18:00",
            departure: "18:30",
            time: "18:00"
        },
        {
            name: "Patna",
            arrival: "23:00",
            departure: "23:30",
            time: "23:00"
        },
        {
            name: "Kolkata (ISBT)",
            arrival: "06:00",
            departure: null,  // No departure for final stop
            time: "06:00"
        }
    ]
};

// Helper function to ensure all buses have proper arrival/departure times
function ensureArrivalDepartureTimes() {
    busData.forEach(bus => {
        if (bus.stops && Array.isArray(bus.stops)) {
            bus.stops.forEach((stop, index) => {
                // If stop has only time field but no arrival/departure
                if (stop.time && (!stop.arrival || !stop.departure)) {
                    // Set arrival = time for all stops
                    stop.arrival = stop.time;
                    
                    // Set departure for all except the last stop
                    if (index < bus.stops.length - 1) {
                        // Default departure is 20 minutes after arrival
                        const arrivalMinutes = timeToMinutes(stop.time);
                        const departureMinutes = arrivalMinutes + 20;
                        stop.departure = minutesToTime(departureMinutes);
                    } else {
                        // Last stop has no departure
                        stop.departure = null;
                    }
                }
            });
        }
    });
}

// Convert minutes since midnight to time string
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Call this function after loading data
document.addEventListener('DOMContentLoaded', function() {
    // This will be called only if this script is included
    if (typeof busData !== 'undefined') {
        ensureArrivalDepartureTimes();
        console.log("Enhanced bus data with arrival/departure times");
    }
}); 