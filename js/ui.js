// Navigation
function showPage(pageId, element) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    
    document.getElementById(pageId).classList.add('active');
    if (element) {
        element.classList.add('active');
    }
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

// Display buses in search results
function displayBuses(buses) {
    const container = document.getElementById('busContainer');
    const resultsSection = document.getElementById('busResults');
    
    if (buses.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: white;">No buses found for this search.</p>';
        resultsSection.classList.remove('hidden');
        return;
    }

    container.innerHTML = buses.map(bus => {
        // Get total number of stops
        const stopsCount = bus.stops ? bus.stops.length : 0;
        
        // Get intermediate stops (exclude first and last)
        const intermediateStops = stopsCount > 2 ? 
            bus.stops.slice(1, -1).map(stop => stop.name).join(', ') : 
            'No intermediate stops';
        
        return `
        <div class="bus-card" onclick="showSchedule(${bus.id})">
            <div class="bus-header">
                <div class="bus-number">${bus.number}</div>
                <div class="bus-status ${bus.status === 'running' ? 'status-running' : 'status-stopped'}">
                    ${bus.status === 'running' ? 'Running' : 'Stopped'}
                </div>
            </div>
            <div class="bus-route">
                <div class="route-point">
                    <i class="fas fa-map-marker-alt"></i>
                    ${bus.route.split(' - ')[0]}
                </div>
                <div class="route-arrow">
                    <i class="fas fa-arrow-right"></i>
                </div>
                <div class="route-point">
                    <i class="fas fa-map-marker-alt"></i>
                    ${bus.route.split(' - ')[1]}
                </div>
            </div>
            <div class="bus-timing">
                <div class="timing-item">
                    <span>Departure:</span>
                    <span>${bus.departure}</span>
                </div>
                <div class="timing-item">
                    <span>Arrival:</span>
                    <span>${bus.arrival}</span>
                </div>
                <div class="timing-item">
                    <span>Current Stop:</span>
                    <span>${bus.currentStop}</span>
                </div>
            </div>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #eee;">
                <div style="font-size: 0.9rem; color: #666;">
                    <strong>Via:</strong> ${intermediateStops}
                </div>
                <div style="font-size: 0.8rem; color: #667eea; text-align: right; margin-top: 5px;">
                    <i class="fas fa-info-circle"></i> Click for full schedule (${stopsCount} stops)
                </div>
            </div>
        </div>
        `;
    }).join('');

    resultsSection.classList.remove('hidden');
}

// Schedule modal
function showSchedule(busId) {
    const bus = busData.find(b => b.id === busId);
    if (!bus) return;

    document.getElementById('modalBusNumber').textContent = `Bus ${bus.number} Schedule`;
    
    const timeline = document.getElementById('scheduleTimeline');
    
    // Check if bus has stops
    if (!bus.stops || bus.stops.length === 0) {
        timeline.innerHTML = `<p>No stops available for this bus.</p>`;
    } else {
        timeline.innerHTML = `
            <div class="timeline-line"></div>
            ${bus.stops.map((stop, index) => `
                <div class="timeline-stop">
                    <div class="timeline-dot ${stop.name === bus.currentStop ? 'current' : ''}"></div>
                    <div class="stop-info">
                        <div class="stop-name">${stop.name}</div>
                        <div class="stop-time">
                            Arrival: ${stop.arrival} | Departure: ${stop.departure}
                        </div>
                    </div>
                </div>
            `).join('')}
        `;
    }

    document.getElementById('scheduleModal').style.display = 'block';
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').style.display = 'none';
}

function closeModal(event) {
    if (event.target === event.currentTarget) {
        closeScheduleModal();
    }
} 