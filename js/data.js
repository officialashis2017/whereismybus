// Sample data - default values
const defaultBusData = [
    {
        id: 1,
        number: 'WB57A-1234',
        route: 'Kolkata - Delhi',
        from: 'kolkata',
        to: 'delhi',
        departure: '06:00',
        arrival: '22:00',
        status: 'running',
        currentStop: 'Durgapur',
        stops: [
            { name: 'Kolkata (Esplanade)', arrival: '06:00', departure: '06:00' },
            { name: 'Durgapur', arrival: '08:30', departure: '08:45' },
            { name: 'Dhanbad', arrival: '10:15', departure: '10:30' },
            { name: 'Varanasi', arrival: '14:00', departure: '14:15' },
            { name: 'Allahabad', arrival: '16:30', departure: '16:45' },
            { name: 'Kanpur', arrival: '18:00', departure: '18:15' },
            { name: 'Agra', arrival: '20:30', departure: '20:45' },
            { name: 'Delhi (ISBT)', arrival: '22:00', departure: '22:00' }
        ]
    },
    {
        id: 2,
        number: 'MH12B-5678',
        route: 'Mumbai - Bangalore',
        from: 'mumbai',
        to: 'bangalore',
        departure: '20:00',
        arrival: '12:00',
        status: 'stopped',
        currentStop: 'Pune',
        stops: [
            { name: 'Mumbai (Dadar)', arrival: '20:00', departure: '20:00' },
            { name: 'Pune', arrival: '23:30', departure: '00:00' },
            { name: 'Solapur', arrival: '03:00', departure: '03:15' },
            { name: 'Hubli', arrival: '07:00', departure: '07:15' },
            { name: 'Bangalore (Majestic)', arrival: '12:00', departure: '12:00' }
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

// Function to update bus stops based on route
function updateBusStopsForRoute(routeName, newStop) {
    // Find all buses on this route
    busData.forEach(bus => {
        if (bus.route.toLowerCase().replace(/\s+/g, '-') === routeName) {
            // Check if the stop already exists
            const existingStop = bus.stops.find(s => s.name === newStop.name);
            if (!existingStop) {
                // Sort stops by arrival time
                const allStops = [...bus.stops];
                
                // Remove origin and destination which will be added back
                const origin = allStops.shift();
                const destination = allStops.pop();
                
                // Add the new stop
                allStops.push({
                    name: newStop.name,
                    arrival: newStop.arrival,
                    departure: newStop.departure
                });
                
                // Sort by arrival time (excluding origin and destination)
                allStops.sort((a, b) => {
                    // Convert time strings to minutes for comparison
                    const timeToMinutes = (timeStr) => {
                        const [hours, minutes] = timeStr.split(':').map(Number);
                        return hours * 60 + minutes;
                    };
                    return timeToMinutes(a.arrival) - timeToMinutes(b.arrival);
                });
                
                // Reconstruct stops array with origin and destination
                bus.stops = [origin, ...allStops, destination];
            }
        }
    });
} 