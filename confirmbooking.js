const db = window.firebaseDb; 
const functions = window.firebaseFunctionsInstance; 
const httpsCallable = window.firebaseHttpsCallable; 
const getDoc = window.firebaseGetDoc; 


if (!db || !functions || !httpsCallable || !doc || !getDoc) {
    console.error("Firebase services not available or not correctly exposed globally. Check HTML CDN script.");
    alert("Error loading application components. Cannot proceed with seat selection.");
    

// Get references to elements you need to disable/hide if loading fails
    const proceedLink = document.getElementById('proceed-link');
    if(proceedLink) proceedLink.style.display = 'none'; 
    
// Find all seats and disable them if needed
    document.querySelectorAll('[data-seat-name]').forEach(el => {
         if (el.tagName === 'INPUT') el.disabled = true;
         else el.style.pointerEvents = 'none'; 
    });
    

    const mainBookingContainer = document.querySelector('.seatbooking-container'); // Get your main seat container
    if (mainBookingContainer) {
        mainBookingContainer.innerHTML = "<h1>Error: Could not load booking features.</h1>"; 
    }
     throw new Error("Firebase not loaded correctly."); 
}



// Declare a variable to store the booking summary data once loaded
let bookingSummary = null;

const numTicketsElement = document.getElementById('num-tickets');
const subtotalAmountElement = document.getElementById('subtotal-amount');
const vatAmountElement = document.getElementById('vat-amount');
const totalAmountElement = document.getElementById('total-amount');

const customerNameInput = document.getElementById('customer-name');
console.log("Customer name input element:", customerNameInput);

const customerMobileInput = document.getElementById('customer-mobile');
console.log("Customer mobile input element:", customerMobileInput);

const customerEmailInput = document.getElementById('customer-email');
console.log("Customer email input element:", customerEmailInput);

const finalConfirmButton = document.getElementById('final-confirm-button');


//Event Listener - Final Confirm Button
if (finalConfirmButton) {
    finalConfirmButton.addEventListener('click', handleFinalBookingConfirmation);
} else {
     console.error("Final confirm button not found in HTML!");
     alert("Error: Cannot find the confirm button on the page.");
}

// --- Function to load and display the booking summary ---
function loadBookingSummaryAndDisplay() {
    const bookingSummaryString = sessionStorage.getItem('currentBookingSummary');

    if (!bookingSummaryString) {
        console.error("No booking summary found in sessionStorage.");
        alert("Booking details not found. Please return to the seat selection page.");
        if (finalConfirmButton) finalConfirmButton.disabled = true;
        return false; 
    }

    try {
        bookingSummary = JSON.parse(bookingSummaryString); 

        // Display the summary details in the HTML elements
        if (numTicketsElement) numTicketsElement.textContent = bookingSummary.numberOfTickets;
        if (subtotalAmountElement) subtotalAmountElement.textContent = bookingSummary.subtotalAmount.toFixed(2);
        if (vatAmountElement) vatAmountElement.textContent = bookingSummary.vatAmount.toFixed(2);
        if (totalAmountElement) totalAmountElement.textContent = bookingSummary.totalAmount.toFixed(2);

        
        

        console.log("Booking summary loaded:", bookingSummary);
        return true; 

    } catch (error) {
        console.error("Error parsing booking summary from sessionStorage:", error);
        alert("Error loading booking details. Please return to the seat selection page.");
        if (finalConfirmButton) finalConfirmButton.disabled = true;
        return false; 
    }
}

// --- Call the function to load and display summary when the script runs ---
const summaryLoadedSuccessfully = loadBookingSummaryAndDisplay();

// Re-enable the final confirm button after summary loads if it was disabled initially
if (finalConfirmButton) { 
    if (summaryLoadedSuccessfully) {
         finalConfirmButton.disabled = false;
    } else {
         finalConfirmButton.disabled = true; // Keep disabled if summary failed to load
    }
}


// --- Function to Handle Final Booking Confirmation Button Click ---
function handleFinalBookingConfirmation() {
    window.location.href = 'bankdetails.html'; 
}