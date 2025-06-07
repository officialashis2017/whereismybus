// Direct Firebase initialization without ES modules
// This script should be loaded after the Firebase SDK scripts but before any code that uses Firebase

// Check if Firebase SDK is available
(function() {
    console.log("Initializing Firebase directly");
    
    // Wait for the Firebase SDK to load
    const checkFirebaseSDK = setInterval(function() {
        if (typeof firebase !== 'undefined') {
            clearInterval(checkFirebaseSDK);
            initializeFirebase();
        } else {
            console.log("Waiting for Firebase SDK to load...");
        }
    }, 100);
    
    function initializeFirebase() {
        console.log("Firebase SDK detected, initializing Firebase");
        
        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyCmDnkrfqxXvSZVqhknvKHDz3fPWjEP0tE",
            authDomain: "whereismybus-30450.firebaseapp.com",
            projectId: "whereismybus-30450",
            storageBucket: "whereismybus-30450.firebasestorage.app",
            messagingSenderId: "688245905652",
            appId: "1:688245905652:web:a698adccacc004d3ba26a1",
            measurementId: "G-ER7XHC9RK3"
        };
        
        try {
            // Initialize Firebase
            firebase.initializeApp(firebaseConfig);
            
            // Get Firebase services
            const db = firebase.firestore();
            const auth = firebase.auth();
            
            // Make Firebase instances available globally
            window.firebaseApp = firebase.app();
            window.firebaseDb = db;
            window.firebaseAuth = auth;
            
            // Make Firebase auth functions available globally
            window.firebaseAuthFunctions = {
                signInWithEmailAndPassword: function(auth, email, password) {
                    return auth.signInWithEmailAndPassword(email, password);
                },
                signOut: function(auth) {
                    return auth.signOut();
                }
            };
            
            console.log("Firebase initialized successfully");
            
            // Set up auth state listener
            auth.onAuthStateChanged(function(user) {
                if (user) {
                    console.log("User is signed in:", user.email);
                    window.currentFirebaseUser = user;
                    
                    // Check if we're on the admin page but not logged in yet
                    const adminPage = document.getElementById('admin');
                    const adminLogin = document.getElementById('adminLogin');
                    const adminPanel = document.getElementById('adminPanel');
                    
                    if (adminPage && !adminPage.classList.contains('hidden') && 
                        adminLogin && !adminLogin.classList.contains('hidden')) {
                        console.log("User already logged in, showing admin panel");
                        
                        // Hide login form and show admin panel
                        adminLogin.classList.add('hidden');
                        adminPanel.classList.remove('hidden');
                        
                        // Keep admin header visible
                        document.getElementById('adminHeader').style.display = 'block';
                        document.getElementById('mainHeader').style.display = 'none';
                        
                        // Show status message
                        const statusElement = document.getElementById('loginStatus');
                        if (statusElement) {
                            statusElement.textContent = "Already logged in as " + user.email;
                            statusElement.className = "login-status success";
                        }
                    }
                } else {
                    console.log("User is signed out");
                    window.currentFirebaseUser = null;
                }
            });
        } catch (error) {
            console.error("Error initializing Firebase:", error);
        }
    }
})(); 