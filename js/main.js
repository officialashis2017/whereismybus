// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    document.getElementById('stopDate').value = today;
    
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
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeScheduleModal();
        closeEditBusModal();
    }
});

// Auto-refresh bus status (simulate real-time updates)
setInterval(() => {
    // Randomly update bus positions for demo
    let positionChanged = false;
    busData.forEach(bus => {
        if (bus.status === 'running' && Math.random() > 0.8) {
            const currentIndex = bus.stops.findIndex(stop => stop.name === bus.currentStop);
            if (currentIndex >= 0 && currentIndex < bus.stops.length - 1) {
                bus.currentStop = bus.stops[currentIndex + 1].name;
                positionChanged = true;
            }
        }
    });
    
    // Save to localStorage if positions changed
    if (positionChanged) {
        saveData();
    }
    
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