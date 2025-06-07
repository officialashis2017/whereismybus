# Where Is My Bus - India

A bus tracking web application for tracking buses across India with real-time schedule information.

## Features

- Search for buses by origin and destination
- Search for buses by any stoppage
- View detailed bus schedules with all stops
- Admin panel to manage buses, routes, and stops
- Real-time bus status updates
- Responsive design for all devices

## Recent Updates

- **Code Organization**: Separated the single HTML file into multiple files:
  - HTML structure (index.html)
  - CSS styles (css/styles.css)
  - JavaScript modules:
    - data.js - Sample data and data management functions
    - ui.js - UI-related functions
    - search.js - Search functionality
    - admin.js - Admin panel functionality
    - edit.js - Edit bus functionality
    - main.js - Initialization code

- **Time Format**: Updated to display times in 12-hour format with AM/PM instead of 24-hour format

## Usage

### User Interface

1. Search for buses by selecting origin and destination
2. Alternatively, search for buses by any stoppage
3. View search results with bus details
4. Click on a bus card to view the detailed schedule

### Admin Panel

1. Login with default credentials (admin/admin123)
2. Manage buses, routes, and stops
3. Add, edit, or delete buses
4. Add or delete routes
5. Add or delete stops

## Technical Details

- Built with vanilla JavaScript, HTML, and CSS
- Uses localStorage for data persistence
- No external dependencies except Font Awesome for icons 

function formatTime(time24) {
    if (!time24) return '';
    
    const [hours, minutes] = time24.split(':');
    let hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hour = hour % 12;
    hour = hour ? hour : 12; // Convert 0 to 12
    
    return `${hour}:${minutes} ${ampm}`;
} 