const db = window.firebaseDb; // The Firestore service instance
const functions = window.firebaseFunctionsInstance; // The Functions service instance (using the distinct name)
const httpsCallable = window.firebaseHttpsCallable; // The httpsCallable function
const doc = window.firebaseDoc; // The doc() function
const getDoc = window.firebaseGetDoc; // The getDoc() function


if (!db || !functions || !httpsCallable || !doc || !getDoc) {
    console.error("Firebase services not available or not correctly exposed globally. Check HTML CDN script.");
    alert("Error loading application components. Cannot proceed with seat selection.");
    

// Get references to elements you need to disable/hide if loading fails
    const proceedLink = document.getElementById('proceed-link');
    if(proceedLink) proceedLink.style.display = 'none'; // Hide or disable button if Firebase fails
    
// Find all seats and disable them if needed
    document.querySelectorAll('[data-seat-name]').forEach(el => {
         if (el.tagName === 'INPUT') el.disabled = true;
         else el.style.pointerEvents = 'none'; // Disable clicks
    });
    

// Display an error message on the page itself
    const mainBookingContainer = document.querySelector('.seatbooking-container'); // Get your main seat container
    if (mainBookingContainer) {
        mainBookingContainer.innerHTML = "<h1>Error: Could not load booking features.</h1>"; // Replace content
    }
     throw new Error("Firebase not loaded correctly."); // This will halt script execution
}



// Declare a variable to store the booking summary data once loaded
let bookingSummary = null;

// --- Get References to HTML elements (Using the IDs you added) ---
// Get references to the spans where you'll display the summary
const numTicketsElement = document.getElementById('num-tickets');
const subtotalAmountElement = document.getElementById('subtotal-amount');
const vatAmountElement = document.getElementById('vat-amount');
const totalAmountElement = document.getElementById('total-amount');

// Get references to the input fields for customer details
const customerNameInput = document.getElementById('customer-name');
console.log("Customer name input element:", customerNameInput);

const customerMobileInput = document.getElementById('customer-mobile');
console.log("Customer mobile input element:", customerMobileInput);

const customerEmailInput = document.getElementById('customer-email');
console.log("Customer email input element:", customerEmailInput);

// Get reference to the final Confirm button
const finalConfirmButton = document.getElementById('final-confirm-button');

// --- Add Event Listener for the Final Confirm Button ---
if (finalConfirmButton) {
    // We'll define handleFinalBookingConfirmation below
    finalConfirmButton.addEventListener('click', handleFinalBookingConfirmation);
} else {
     console.error("Final confirm button not found in HTML!");
     alert("Error: Cannot find the confirm button on the page.");
}

// --- Function to load and display the booking summary ---
// This function runs when the page loads to get data from sessionStorage
function loadBookingSummaryAndDisplay() {
    const bookingSummaryString = sessionStorage.getItem('currentBookingSummary');

    if (!bookingSummaryString) {
        console.error("No booking summary found in sessionStorage.");
        alert("Booking details not found. Please return to the seat selection page.");
        // Disable confirm button and potentially redirect
        if (finalConfirmButton) finalConfirmButton.disabled = true;
        // window.location.href = 'nowshowingm.html'; // Example redirect to movies list
        return false; // Indicate failure
    }

    try {
        bookingSummary = JSON.parse(bookingSummaryString); // Store parsed data in the variable

        // Display the summary details in the HTML elements
        if (numTicketsElement) numTicketsElement.textContent = bookingSummary.numberOfTickets;
        // Use toFixed(2) for currency display
        if (subtotalAmountElement) subtotalAmountElement.textContent = bookingSummary.subtotalAmount.toFixed(2);
        if (vatAmountElement) vatAmountElement.textContent = bookingSummary.vatAmount.toFixed(2);
        if (totalAmountElement) totalAmountElement.textContent = bookingSummary.totalAmount.toFixed(2);

        // Optional: Display selected seats or movie details again if you added elements for them
        // e.g., add a span with id="confirm-selected-seats" in HTML
        // if (document.getElementById('confirm-selected-seats')) document.getElementById('confirm-selected-seats').textContent = bookingSummary.selectedSeats.join(', ');

        console.log("Booking summary loaded:", bookingSummary);
        return true; // Indicate success

    } catch (error) {
        console.error("Error parsing booking summary from sessionStorage:", error);
        alert("Error loading booking details. Please return to the seat selection page.");
        if (finalConfirmButton) finalConfirmButton.disabled = true;
        // window.location.href = 'nowshowingm.html'; // Example redirect
        return false; // Indicate failure
    }
}

// --- Call the function to load and display summary when the script runs ---
const summaryLoadedSuccessfully = loadBookingSummaryAndDisplay();

// Re-enable the final confirm button after summary loads if it was disabled initially
if (finalConfirmButton) { // Check if button element was found
    if (summaryLoadedSuccessfully) {
         finalConfirmButton.disabled = false;
    } else {
         finalConfirmButton.disabled = true; // Keep disabled if summary failed to load
    }
}


// --- Function to Handle Final Booking Confirmation Button Click ---
// This is where we'll call the Cloud Function
function handleFinalBookingConfirmation() {
    window.location.href = 'bankdetails.html'; // Redirect to bank details page
}