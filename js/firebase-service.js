import { db } from './firebase-config.js';
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    onSnapshot,
    serverTimestamp 
} from 'firebase/firestore';

// Collections
const BUSES_COLLECTION = 'buses';
const ROUTES_COLLECTION = 'routes';
const STOPS_COLLECTION = 'stops';

// Bus Service
export const busService = {
    // Get all buses
    getAllBuses: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, BUSES_COLLECTION));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting buses: ", error);
            throw error;
        }
    },

    // Get real-time updates for buses
    onBusesUpdate: (callback) => {
        const busesRef = collection(db, BUSES_COLLECTION);
        return onSnapshot(busesRef, (snapshot) => {
            const buses = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(buses);
        });
    },

    // Get a single bus by ID
    getBusById: async (busId) => {
        try {
            const docRef = doc(db, BUSES_COLLECTION, busId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                };
            } else {
                console.log("No such bus!");
                return null;
            }
        } catch (error) {
            console.error("Error getting bus: ", error);
            throw error;
        }
    },

    // Add a new bus
    addBus: async (busData) => {
        try {
            // Add timestamp for tracking
            const busWithTimestamp = {
                ...busData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            const docRef = await addDoc(collection(db, BUSES_COLLECTION), busWithTimestamp);
            return docRef.id;
        } catch (error) {
            console.error("Error adding bus: ", error);
            throw error;
        }
    },

    // Update a bus
    updateBus: async (busId, busData) => {
        try {
            const busRef = doc(db, BUSES_COLLECTION, busId);
            
            // Add updated timestamp
            const updateData = {
                ...busData,
                updatedAt: serverTimestamp()
            };
            
            await updateDoc(busRef, updateData);
            return true;
        } catch (error) {
            console.error("Error updating bus: ", error);
            throw error;
        }
    },

    // Delete a bus
    deleteBus: async (busId) => {
        try {
            await deleteDoc(doc(db, BUSES_COLLECTION, busId));
            return true;
        } catch (error) {
            console.error("Error deleting bus: ", error);
            throw error;
        }
    },

    // Update bus status
    updateBusStatus: async (busId, status) => {
        try {
            const busRef = doc(db, BUSES_COLLECTION, busId);
            await updateDoc(busRef, {
                status: status,
                updatedAt: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error updating bus status: ", error);
            throw error;
        }
    },

    // Search buses by route (from/to)
    searchBusesByRoute: async (from, to) => {
        try {
            const busesRef = collection(db, BUSES_COLLECTION);
            // Note: This is a simplified query. In a real app, you'd need to 
            // handle the stops array filtering in the client code
            const q = query(
                busesRef, 
                where("from", "==", from.toLowerCase()),
                where("to", "==", to.toLowerCase())
            );
            
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error searching buses: ", error);
            throw error;
        }
    }
};

// Route Service
export const routeService = {
    // Get all routes
    getAllRoutes: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, ROUTES_COLLECTION));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting routes: ", error);
            throw error;
        }
    },

    // Add a new route
    addRoute: async (routeData) => {
        try {
            const routeWithTimestamp = {
                ...routeData,
                createdAt: serverTimestamp()
            };
            
            const docRef = await addDoc(collection(db, ROUTES_COLLECTION), routeWithTimestamp);
            return docRef.id;
        } catch (error) {
            console.error("Error adding route: ", error);
            throw error;
        }
    },

    // Delete a route
    deleteRoute: async (routeId) => {
        try {
            await deleteDoc(doc(db, ROUTES_COLLECTION, routeId));
            return true;
        } catch (error) {
            console.error("Error deleting route: ", error);
            throw error;
        }
    }
};

// Stop Service
export const stopService = {
    // Get all stops
    getAllStops: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, STOPS_COLLECTION));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting stops: ", error);
            throw error;
        }
    },

    // Get stops by route
    getStopsByRoute: async (routeName) => {
        try {
            const stopsRef = collection(db, STOPS_COLLECTION);
            const q = query(stopsRef, where("route", "==", routeName));
            
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting stops by route: ", error);
            throw error;
        }
    },

    // Add a new stop
    addStop: async (stopData) => {
        try {
            const stopWithTimestamp = {
                ...stopData,
                createdAt: serverTimestamp()
            };
            
            const docRef = await addDoc(collection(db, STOPS_COLLECTION), stopWithTimestamp);
            return docRef.id;
        } catch (error) {
            console.error("Error adding stop: ", error);
            throw error;
        }
    },

    // Delete a stop
    deleteStop: async (stopId) => {
        try {
            await deleteDoc(doc(db, STOPS_COLLECTION, stopId));
            return true;
        } catch (error) {
            console.error("Error deleting stop: ", error);
            throw error;
        }
    }
}; 