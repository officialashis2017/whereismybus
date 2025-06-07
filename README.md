# Where Is My Bus - India

A bus tracking web application for tracking buses across India with real-time schedule information.

## Features

- Search for buses by origin and destination
- Search for buses by any stoppage
- View detailed bus schedules with all stops
- Admin panel to manage buses, routes, and stops
- Real-time bus status updates
- Responsive design for all devices
- Real-time database with Firebase

## Recent Updates

- **Firebase Integration**: Added Firebase Firestore for real-time data storage and synchronization:
  - Real-time updates for all connected users
  - More secure data storage than localStorage
  - Better data integrity and persistence
  - Proper authentication for admin functions

- **Code Organization**: Separated the single HTML file into multiple files:
  - HTML structure (index.html)
  - CSS styles (css/styles.css)
  - JavaScript modules:
    - firebase-config.js - Firebase configuration
    - firebase-service.js - Firebase service layer
    - data.js - Data management functions
    - ui.js - UI-related functions
    - search.js - Search functionality
    - admin.js - Admin panel functionality
    - edit.js - Edit bus functionality
    - main.js - Initialization code

- **Time Format**: Updated to display times in 12-hour format with AM/PM instead of 24-hour format

- **ES Modules**: Converted JavaScript code to use ES modules for better organization and maintainability

## Setup

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Add a web app to your Firebase project
3. Copy your Firebase configuration (apiKey, authDomain, etc.)
4. Update the configuration in:
   - js/firebase-config.js
   - The inline script in index.html
5. Set up Firestore Database in the Firebase console
6. Set up Authentication (optional) if you want to secure admin access

Detailed setup instructions can be found in the `firebase-setup.js` file.

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
- Uses Firebase Firestore for real-time data storage
- ES Modules for better code organization
- Font Awesome for icons

## Time Formatting Example

```javascript
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