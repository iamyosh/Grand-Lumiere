// addShowtime.js
const admin = require('firebase-admin');
const path = require('path'); // Node.js built-in module for path manipulation

// --- Initialize Firebase Admin SDK ---
// We need to tell the SDK where to find your service account key.
// It's best practice to use an environment variable rather than hardcoding the path.
// However, for a simple local script, providing the path directly is okay,
// but be careful if you move the script or key file.
// Let's use a method that's good practice: relying on the GOOGLE_APPLICATION_CREDENTIALS env var.
// We'll set this environment variable when we run the script in the next step.
try {
    admin.initializeApp({
       // projectId: 'grand-lumiere' // You can specify your project ID, but the env var usually handles it
    });
    console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    // Exit if initialization fails
    process.exit(1);
}


const db = admin.firestore();


// --- Function to create a showtime with all seats ---
async function createShowtime(movieId, time, screen, standardPrice, vipPrice) {

    // 1. Define prices (keep this line)
    const prices = { standard: standardPrice, vip: vipPrice };

    // 2. Initialize an empty object to hold seat data (keep this line)
    const seats = {};

    // --- 3. >>> INSERT THE NEW SEAT GENERATION CODE HERE <<< ---
    //    >>> REPLACE THE OLD LOOP-BASED SEAT GENERATION CODE WITH THIS <<<

    // --- Define your actual seat layout based on your HTML ---
    // VIP Seats (VL1 to VL8)
    const vipSeats = ['VL1', 'VL2', 'VL3', 'VL3', 'VL5', 'VL6', 'VL7', 'VL8']; // Correction: VL3 listed twice in your sample? Assuming a typo, should be VL4? Let's use VL1-VL8
     const correctedVipSeats = ['VL1', 'VL2', 'VL3', 'VL4', 'VL5', 'VL6', 'VL7', 'VL8'];


    // Standard Seats (H1-H12, G1-G12, F1-F8, E1-E8, D1-D8, C1-C8, B1-B8, A1-A8)
    const standardSeats = [
        ...Array.from({ length: 12 }, (_, i) => `H${i + 1}`), // H1 to H12
        ...Array.from({ length: 12 }, (_, i) => `G${i + 1}`), // G1 to G12
        ...Array.from({ length: 8 }, (_, i) => `F${i + 1}`),  // F1 to F8
        ...Array.from({ length: 8 }, (_, i) => `E${i + 1}`),  // E1 to E8
        ...Array.from({ length: 8 }, (_, i) => `D${i + 1}`),  // D1 to D8
        ...Array.from({ length: 8 }, (_, i) => `C${i + 1}`),  // C1 to C8
        ...Array.from({ length: 8 }, (_, i) => `B${i + 1}`),  // B1 to B8
        ...Array.from({ length: 8 }, (_, i) => `A${i + 1}`),  // A1 to A8
    ];

    console.log(`Generating ${correctedVipSeats.length} VIP seats and ${standardSeats.length} Standard seats...`);

    // Populate VIP seats
    correctedVipSeats.forEach(seatName => {
        seats[seatName] = {
            type: 'vip',
            status: 'available' // All seats start as available
        };
    });

    // Populate Standard seats
    standardSeats.forEach(seatName => {
         seats[seatName] = {
            type: 'standard',
            status: 'available' // All seats start as available
        };
    });

    console.log(`Generated data for ${Object.keys(seats).length} seats.`);






    // --- Add the showtime document to Firestore ---
    try {
        const newShowtimeRef = db.collection('showtimes').doc(); // Firestore generates a unique ID for the new document

        await newShowtimeRef.set({
            movieId: movieId,
            // Ensure 'time' is a Date object when you call this function
            time: admin.firestore.Timestamp.fromDate(time), // Convert JavaScript Date object to Firestore Timestamp
            screen: screen,
            prices: prices,
            seats: seats // This object contains all A1-F8 seats
        });

        console.log(`Successfully created new showtime document!`);
        console.log(`Document ID: ${newShowtimeRef.id}`);
        console.log(`View in console: https://console.firebase.google.com/project/${admin.instanceId().app.options.projectId}/firestore/data/~2Fshowtimes~2F${newShowtimeRef.id}`); // Construct console URL (replace if project ID is different)

        return newShowtimeRef.id; // Return the ID of the new showtime
    } catch (error) {
        console.error("Error adding showtime document to Firestore:", error);
        throw error; // Re-throw the error
    }
}

// --- Example Usage ---
// This is where you define the details for the specific showtime you want to add.
// IMPORTANT: Replace 'YOUR_MOVIE_ID_HERE' with an actual Movie ID from your 'movies' collection.
// IMPORTANT: Adjust the Date and time as needed for the showtime.
// IMPORTANT: Adjust prices, screen name if necessary.

const targetMovieId = 'Xujoxoxb4eByexS2atOY'; // <-- *** REPLACE THIS ***
const showtimeDateTime = new Date(Date.UTC(2024, 11, 23, 13, 30, 0));
const screenName = 'Auditorium 2'; // <-- Adjust if needed
const priceStandard = 1300.00; // <-- Adjust if needed
const priceVip = 4000.00;     // <-- Adjust if needed


// Run the function
createShowtime(targetMovieId, showtimeDateTime, screenName, priceStandard, priceVip)
    .then(showtimeId => {
        console.log(`Showtime creation script finished.`);
            console.log(`Created Showtime Document ID: ${showtimeId}`); // Pay attention to this ID!
            console.log(`View in console: https://console.firebase.google.com/project/${admin.instanceId().app.options.projectId}/firestore/data/~2Fshowtimes~2F${showtimeId}`);
        })
    .catch(error => {
        console.error("Script failed to create showtime:", error);
        // Optionally exit the process after failure
        // process.exit(1);

        
    });

