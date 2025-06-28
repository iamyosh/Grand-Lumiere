// Import necessary Firebase modules
const functions = require('firebase-functions');
const admin = require('firebase-admin'); // Needed to interact with Firestore

// NEW: The SendGrid Node.js library
const sgMail = require('@sendgrid/mail');

// Initialize the Firebase Admin SDK. This allows your function to talk to other Firebase services.
admin.initializeApp();

// Get a reference to the Firestore database
const db = admin.firestore();

// NEW: Set your SendGrid API Key securely from Firebase functions config
// IMPORTANT: Make sure you've run 'firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"'

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY; // Access directly via process.env

// ADD THIS LINE FOR DEBUGGING
console.log('DEBUG: Emulator SendGrid API Key being used:', SENDGRID_API_KEY ? SENDGRID_API_KEY.substring(0, 10) + '...' : 'Key is undefined/null');



if (!SENDGRID_API_KEY) {
    console.error('SendGrid API key not configured. Set SENDGRID_API_KEY environment variable.');
    // You might want to throw an error here or ensure emails won't send without the key
    // For now, if the key is missing, sgMail.send will likely fail, which is caught.
} else {
    sgMail.setApiKey(SENDGRID_API_KEY);
}




// --- Your processBooking Cloud Function ---
// This function will be called by your frontend JavaScript
exports.processBooking = functions.https.onCall(async (data, context) => {
  
  console.log('Received data payload:', data);
   console.log('Auth context:', context.auth);
   

  // 1. Get data sent from the frontend
  const { showtimeId, selectedSeats, customerName, customerMobile, customerEmail, totalAmount } = data; // Added totalAmount from your script

  // 2. Basic validation of incoming data
  if (
  !showtimeId ||
  !Array.isArray(selectedSeats) ||
  selectedSeats.length === 0 ||
  !customerName ||
  !customerMobile ||
  !customerEmail ||
  typeof totalAmount !== 'number' // Ensuring totalAmount is present and a number
) {
  console.error('Validation failed: Missing or invalid booking information.', data);
  throw new functions.https.HttpsError('invalid-argument', 'Missing or invalid booking information.');
}
  

    console.log('Second validation block passed. Proceeding with booking process...');

  // Define VAT rate on the backend for security (don't trust frontend calculation fully)
  const vatRate = 0.10; // Example: 10% VAT (Adjust this to your actual VAT rate)

  // 3. Start a Firestore Transaction
  // Transactions are crucial here to prevent race conditions when updating seat status.
  try {
    const result = await db.runTransaction(async (transaction) => {
      // 4. Read the showtime document *within the transaction*
      //    Reading within the transaction ensures we get the most up-to-date data
      const showtimeRef = db.collection('showtimes').doc(showtimeId);
      const showtimeDoc = await transaction.get(showtimeRef);

      // Check if showtime exists
      if (!showtimeDoc.exists) {
        console.error(`Showtime document not found for ID: ${showtimeId}`);
        throw new functions.https.HttpsError('not-found', 'Showtime not found.');
      }

      const showtimeData = showtimeDoc.data();
      // Validate that necessary fields exist in the showtime document
      if (!showtimeData || !showtimeData.seats || !showtimeData.prices || !showtimeData.movieId) {
         console.error(`Showtime data is incomplete for ID: ${showtimeId}`, showtimeData);
         throw new functions.https.HttpsError('internal', 'Showtime data is incomplete in Firestore.');
      }

      const seatsData = showtimeData.seats;
      const prices = showtimeData.prices;
      const seatsToUpdate = {}; // Object to build the update structure for seats
      let subtotalAmount = 0; // Recalculate subtotal on the backend

      // 5. Check the status of ALL selected seats *within the transaction*
      //    And calculate the subtotal based on backend prices.
      console.log(`Checking status for ${selectedSeats.length} selected seats within transaction...`);
      for (const seatName of selectedSeats) {
        const seat = seatsData[seatName];

        // If the seat doesn't exist in the showtime data or is already booked, abort the transaction!
        if (!seat || seat.status !== 'available') {
           console.warn(`Seat ${seatName} is not available (status: ${seat ? seat.status : 'missing'}) for showtime ${showtimeId}`);
           // This specific error code signals to the frontend that seats were taken.
           throw new functions.https.HttpsError('already-exists', `Seat ${seatName} is no longer available.`);
        }

        // If available, mark the seat to be updated to 'booked'
        // Use dot notation for updating nested fields in Firestore
        seatsToUpdate[`seats.${seatName}.status`] = 'booked';

        // Calculate the subtotal based on seat types and prices from the showtime document (backend source of truth)
        // Ensure the seat type from Firestore exists in the prices map
        if (!prices || prices[seat.type] === undefined) { // Check if prices map exists and price for type exists
             console.error(`Price not found or invalid for seat type ${seat.type} in showtime ${showtimeId}`);
             throw new functions.https.HttpsError('internal', `Price configuration error for seat type ${seat.type}.`);
        }
        subtotalAmount += prices[seat.type];
      }

      // 6. Calculate final amounts (VAT, Total) based on backend recalculation
      const vatAmount = subtotalAmount * vatRate;
      const calculatedTotalAmount = subtotalAmount + vatAmount; // Renamed for clarity, avoiding conflict with frontend totalAmount

      console.log(`Calculated amounts - Subtotal: ${subtotalAmount}, VAT: ${vatAmount}, Total: ${calculatedTotalAmount}`);

      // 7. If all checks passed, perform the writes *within the transaction*:
      //    a) Update the status of the selected seats in the showtime document to 'booked'.
      console.log(`Updating seats in showtime document ${showtimeId}...`, seatsToUpdate);
      // Use spread syntax to ensure other fields in the showtime doc are preserved
      transaction.update(showtimeRef, seatsToUpdate);


      //    b) Create a new booking document in the 'bookings' collection.
      const newBookingRef = db.collection('bookings').doc(); // Firestore generates a unique ID for the booking
      console.log(`Creating new booking document ${newBookingRef.id}...`);
      transaction.set(newBookingRef, {
        showtimeId: showtimeId,
        selectedSeats: selectedSeats, // The array of names that were booked
        numberOfTickets: selectedSeats.length,
        subtotalAmount: subtotalAmount, // Store backend calculated amounts
        vatAmount: vatAmount,
        totalAmount: calculatedTotalAmount, // Store backend calculated amounts
        customerName: customerName,
        customerMobile: customerMobile,
        customerEmail: customerEmail,
        bookingTime: admin.firestore.FieldValue.serverTimestamp(), // Use server timestamp for accuracy
        // userId: userId || null, // Store user ID if authentication is enabled
        // Optionally store movie title, screen, time here for easier display later without joins
        // movieTitle: showtimeData.movieTitle // If you added movieTitle to showtime
      });

      // 8. Return success confirmation and details to the frontend
      console.log("Booking transaction completed successfully.");
      return {
          success: true,
          bookingId: newBookingRef.id,
          totalAmount: calculatedTotalAmount, // Return the backend calculated total
          message: "Booking completed successfully!"
      }; // Return the result of the transaction

    }); // End of transaction

    return result; // Return the result of the transaction function

  } catch (error) {
    // Handle errors that occur *within* the transaction (like aborting due to seat availability)
    // or other errors during the function execution.
    console.error("Booking transaction failed:", error);

    // If it's an HttpsError we threw, re-throw it with its specific code and message
    if (error.code) {
      throw error;
    }
    // For any other unexpected errors, throw a generic internal error
    throw new functions.https.HttpsError('internal', 'An unexpected error occurred during the booking process.');
  }
});







// --- NEW: Your subscribeToNewsletter Cloud Function ---
exports.subscribeToNewsletter = functions.https.onCall(async (data, context) => {
    
  
  const email = data.data.email;

//     // --- ADD THIS LINE FOR DEBUGGING ---
//     console.log('Cloud Function received email:', email);
//     console.log('Type of received email:', typeof email);
//     console.log('Does it include "@"?', email.includes('@'));
//     console.log('Does it include "."?', email.includes('.'));
//     console.log('Length of received email:', email.length);
//     // --- END DEBUGGING LINES ---

    // Basic email validation
    if (!email || !email.includes('@') || !email.includes('.')) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid email address provided.');
    }

    // --- IMPORTANT: Replace 'YOUR_VERIFIED_SENDER_EMAIL@example.com' with your actual SendGrid Verified Sender Email ---
    const msg = {
        to: email,
        from: 'yoshedirisinghe28@gmail.com', // <--- CHANGE THIS!
        subject: 'Welcome to the Grand Lumiere Newsletter!',
        text: `Hello there,

        Thank you for subscribing to the Grand Lumiere newsletter!

        Get ready for exclusive updates on:
        ✨ Latest movie releases
        🎟️ Special offers and discounts
        🎉 Exciting events and VIP experiences

        We're thrilled to have you join our cinematic family.

        See you at the movies!

        Warmly,
        The Grand Lumiere Team
        www.grandlumiere.web.app`,
        html: `
        <p>Hello there,</p>
        <p>Thank you for subscribing to the <strong>Grand Lumiere</strong> newsletter!</p>
        <p>Get ready for exclusive updates on:</p>
        <ul>
            <li>✨ Latest movie releases</li>
            <li>🎟️ Special offers and discounts</li>
            <li>🎉 Exciting events and VIP experiences</li>
        </ul>
        <p>We're thrilled to have you join our cinematic family.</p>
        <p>See you at the movies!</p>
        <p>Warmly,<br>The Grand Lumiere Team</p>
        <p><a href="https://grand-lumiere.web.app" style="color: #FFD700;">Visit our website</a></p>
        `
    };

    try {
        await sgMail.send(msg);
        console.log(`Email sent successfully to ${email}`);
        return { success: true, message: 'Successfully subscribed and welcome email sent!' };
    } catch (error) {
        console.error('Error sending email:', error.response ? error.response.body : error);
        if (error.code === 401) { // Unauthorized - typically means API key issue
            throw new functions.https.HttpsError('internal', 'SendGrid authentication failed. Please check API key.');
        } else if (error.code === 400) { // Bad Request - often invalid recipient
             throw new functions.https.HttpsError('invalid-argument', 'Invalid recipient email or mail format.');
        }
        throw new functions.https.HttpsError('internal', 'An unexpected error occurred during the email sending process.');
    }
});


// Set up CORS middleware. This is important if your frontend is on a different domain (like localhost).
// Note: This is primarily for HTTP functions. onCall functions handle CORS automatically
// when called via the client SDK. But having it here doesn't hurt if you're also
// using HTTP functions or testing manually.
const cors = require('cors')({ origin: true });

// Define an HTTP-triggered function called 'submitContactForm'
exports.submitContactForm = functions.https.onRequest((request, response) => {
  // Use the CORS middleware first
  cors(request, response, async () => {
    // Check if the request method is POST
    if (request.method !== 'POST') {
      return response.status(405).send('Method Not Allowed');
    }

    // Get the data sent from the frontend. We expect it to be in the request body.
    const formData = request.body;

    // Basic validation: Check if we actually received data
    if (!formData || !formData.name || !formData.email || !formData.message) {
      return response.status(400).send('Missing form data');
    }

    try {
      // Add the form data to a collection in Firestore named 'contactSubmissions'
      // Firestore will automatically create a unique ID for each submission
      const docRef = await db.collection('contactSubmissions').add({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        timestamp: admin.firestore.FieldValue.serverTimestamp() // Add a server-generated timestamp
      });

      // Send a success response back to the frontend
      console.log('Contact form submission saved with ID:', docRef.id); // Log for debugging
      return response.status(200).json({ message: 'Submission received!', id: docRef.id });

    } catch (error) {
      // If there's an error saving to Firestore, send an error response
      console.error('Error saving contact form submission:', error); // Log the error
      return response.status(500).send('Error saving submission');
    }
  });
});
