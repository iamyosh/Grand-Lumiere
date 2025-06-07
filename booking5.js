const db = window.firebaseDb; // The Firestore service instance
const functions = window.firebaseFunctionsInstance; // The Functions service instance (using the distinct name)
const httpsCallable = window.firebaseHttpsCallable; // The httpsCallable function
const doc = window.firebaseDoc; // The doc() function
const getDoc = window.firebaseGetDoc; // The getDoc() function

// Check if Firebase services are available
if (!db || !functions || !httpsCallable || !doc || !getDoc) {
    console.error("Firebase services not available or not correctly exposed globally. Check HTML CDN script.");
    alert("Error loading application components. Cannot proceed with seat selection.");
    

// Get references to elements you need to disable/hide if loading fails
    const proceedLink = document.getElementById('proceed-link');
    if(proceedLink) proceedLink.style.display = 'none'; // Hide or disable button if Firebase fails
    
// Find all seats and disable them if needed
    document.querySelectorAll('[data-seat-name]').forEach(el => {
         if (el.tagName === 'INPUT') el.disabled = true;
         else el.style.pointerEvents = 'none'; 
    });
    

// Display an error message on the page itself
    const mainBookingContainer = document.querySelector('.seatbooking-container'); // Get your main seat container
    if (mainBookingContainer) {
        mainBookingContainer.innerHTML = "<h1>Error: Could not load booking features.</h1>"; // Replace content
    }
     throw new Error("Firebase not loaded correctly.");
}


// *** REPLACE THIS WITH THE ACTUAL SHOWTIME ID YOU NOTED DOWN FOR booking1.html ***
const currentShowtimeId = '7SlWMnwP3ZvCvTiPwyj5'; 



// --- Declare Variables ---
let currentShowtimeData = null; // Store the fetched showtime document data
let seatPrices = {}; // Store prices from the showtime data
let selectedSeats = new Set(); // Use a Set to track selected seat names (e.g., {'VL1', 'H3'})


const vipContainer = document.getElementById('vip-seats'); 
const standardContainer = document.getElementById('standard-seats');

const movieTitleElement = document.getElementById('movie-title'); 
const showtimeDetailsElement = document.getElementById('showtime-details'); 


// Buttons
const proceedLink = document.getElementById('proceed-link');
const proceedToReservationButton = proceedLink ? proceedLink.querySelector('button') : null;


//Add event listeners
if(proceedToReservationButton && proceedLink) {
    proceedLink.addEventListener('click', handleProceedToReservation);

    proceedToReservationButton.disabled = true; 
    if (proceedToReservationButton.disabled) {
        proceedToReservationButton.classList.add('disabled');
    }
}else {
     console.error("Proceed to Reservation button or link not found in HTML!");
}

//6. Function to fetch Showtime Data
async function loadShowtimeData(showtimeId) {
  try {
    const showtimeRef = doc(db, 'showtimes', showtimeId);
    const showtimeDoc = await getDoc(showtimeRef);
    if (!showtimeDoc.exists()) {
      console.error(`Showtime document not found for ID: ${showtimeId} on ${window.location.href}`);
      alert("Error: Selected showtime not found.");
      if(showtimeDetailsElement) showtimeDetailsElement.textContent = "Error loading showtime data.";
      if(proceedToReservationButton) proceedToReservationButton.disabled = true;
      return;
    }

    currentShowtimeData = showtimeDoc.data();

    // Basic validation of fetched data structure
    if (!currentShowtimeData || !currentShowtimeData.seats || !currentShowtimeData.prices || !currentShowtimeData.movieId) {
         console.error(`Showtime data is incomplete for ID: ${showtimeId}`, currentShowtimeData);
         alert("Error: Showtime data is incomplete.");
         if(showtimeDetailsElement) showtimeDetailsElement.textContent = "Showtime data incomplete.";
          if(proceedToReservationButton) proceedToReservationButton.disabled = true;
         return; // Stop execution
    }

    seatPrices = currentShowtimeData.prices; // Store prices for calculations

    console.log(`Showtime data loaded for ${showtimeId}:`, currentShowtimeData);


    const movieRef = doc(db, 'movies', currentShowtimeData.movieId);
    const movieDoc = await getDoc(movieRef);
    if (movieDoc.exists() && movieDoc.data()?.title) {
         if (movieTitleElement) {
              movieTitleElement.textContent = movieDoc.data().title;
         }
         
    } else {
        console.warn(`Could not fetch movie title for ID: ${currentShowtimeData.movieId}`);
        if (movieTitleElement) {
             movieTitleElement.textContent = "Unknown Movie";
        }
    }
    

   if (showtimeDetailsElement) {
    if (currentShowtimeData.screen) {
        showtimeDetailsElement.textContent = `Screen: ${currentShowtimeData.screen}`;
    } else {
        showtimeDetailsElement.textContent = "";
    }
}


    renderSeats(currentShowtimeData.seats); // Call the renderSeats function

  } catch (error) {
    console.error("Error fetching showtime data:", error);
    alert("An error occurred while loading showtime details.");
     if(showtimeDetailsElement) showtimeDetailsElement.textContent = "Failed to load showtime.";
     if(proceedToReservationButton) proceedToReservationButton.disabled = true;
  }
}



function renderSeats(seatsData) {
    console.log("Rendering seats with data:", seatsData);

    
    const allSeatCheckboxes = document.querySelectorAll('input[type="checkbox"][data-seat-name]');

    if (allSeatCheckboxes.length === 0) {
        console.error("No seat checkbox elements with 'data-seat-name' attribute found in HTML!");
        alert("Error: Seat elements not found in HTML. Please ensure checkbox inputs have the 'data-seat-name' attribute.");
        if(proceedToReservationButton) proceedToReservationButton.disabled = true; // Disable booking
        return; 
    }

    allSeatCheckboxes.forEach(checkbox => {
        const seatName = checkbox.dataset.seatName; // Get the seat name from the data attribute
        const seatData = seatsData[seatName]; // Look up this seat in the data fetched from Firestore

        
        const seatSpan = checkbox.closest('label')?.querySelector('.checkbox-box');

        // Remove any status/selection classes from the span that might be lingering from previous states
        if (seatSpan) {
            seatSpan.classList.remove('available', 'booked', 'selected', 'unavailable', 'reserved'); 
        }

        if (!seatData) {
            console.warn(`Seat "${seatName}" found in HTML but not in Firestore data for this showtime!`);
            if (seatSpan) seatSpan.classList.add('unavailable'); // Style it as unavailable
            checkbox.disabled = true; 
            checkbox.checked = false; 
             // Remove any potential click listeners added previously
            checkbox.removeEventListener('change', handleCheckboxChange);
            return; 
        }

        // Add the correct status class to the span based on Firestore data
        if (seatSpan) {
            seatSpan.classList.add(seatData.status); 
        }


        // Handle seats based on their status from Firestore
        if (seatData.status === 'booked') {
            checkbox.disabled = true;
            checkbox.checked = false;

            // Remove any click listeners previously added to prevent interaction
             checkbox.removeEventListener('change', handleCheckboxChange);

        } else { // Status is 'available'
             checkbox.disabled = false;

           
             checkbox.removeEventListener('change', handleCheckboxChange);
             checkbox.addEventListener('change', handleCheckboxChange);
        }

        
         if (selectedSeats.has(seatName)) {
             checkbox.checked = true;
             if(seatSpan) seatSpan.classList.add('selected'); 
         } else {
             checkbox.checked = false;
             if(seatSpan) seatSpan.classList.remove('selected'); 
         }
    });
     updatePurchaseSummary();
}


function addSeatSelectionListeners() {
     console.log("Seat selection listeners added (via renderSeats loop).");
    
}




// --- 8. Function to handle Checkbox Changes (Seat Selection) ---
function handleCheckboxChange(event) {
    const checkbox = event.target;
    const seatName = checkbox.dataset.seatName;

    const seatSpan = checkbox.closest('label')?.querySelector('.checkbox-box');

    if (!seatName) {
         console.error("Could not determine seat name from checkbox's data-seat-name attribute.");
         checkbox.checked = false;
         return; 
    }

    if (checkbox.checked) {
        // Seat is selected - add to the Set
        selectedSeats.add(seatName);
        if(seatSpan) seatSpan.classList.add('selected'); // Add selected class for styling
    } else {
        // Seat is deselected - remove from the Set
        selectedSeats.delete(seatName);
        if(seatSpan) seatSpan.classList.remove('selected'); // Remove selected class
    }

    console.log("Current selected seats:", Array.from(selectedSeats)); // Log current selection

    
    // This function calculates values and saves to sessionStorage.
    updatePurchaseSummary();

    if(proceedToReservationButton) {
         // Disable if no seats are selected (size is 0)
         proceedToReservationButton.disabled = selectedSeats.size === 0;
         // Optional: Update disabled class for styling
         if (proceedToReservationButton.disabled) {
             proceedToReservationButton.classList.add('disabled');
         } else {
             proceedToReservationButton.classList.remove('disabled');
         }
    }
}


// --- 9. Function to Calculate and Store Purchase Summary ---
function updatePurchaseSummary() {
    let subtotalAmount = 0;
    const vatRate = 0.10; // Example VAT rate

    selectedSeats.forEach(seatName => {
        const seatData = currentShowtimeData?.seats?.[seatName];

        // Ensure seat data exists and has a valid type with a corresponding price
        if (seatData && seatPrices && seatPrices[seatData.type] !== undefined) {
            subtotalAmount += seatPrices[seatData.type];
        } else {
            console.warn(`Could not find price for selected seat ${seatName} with type ${seatData?.type}. Check showtime data and prices.`);
        }
    });

    const numberOfTickets = selectedSeats.size;
    const vatAmount = subtotalAmount * vatRate;
    const totalAmount = subtotalAmount + vatAmount;

    // Create the object to save
    const bookingSummary = {
        numberOfTickets: numberOfTickets,
        subtotalAmount: subtotalAmount,
        vatAmount: vatAmount,
        totalAmount: totalAmount,
        selectedSeats: Array.from(selectedSeats), 
        showtimeId: currentShowtimeId
    };

    // Save the object to sessionStorage after converting it to a JSON string
    try {
         sessionStorage.setItem('currentBookingSummary', JSON.stringify(bookingSummary));
         console.log("Calculated Purchase Summary saved to sessionStorage:", bookingSummary);
    } catch (error) {
         console.error("Error saving booking summary to sessionStorage:", error);
         alert("Could not save booking details. Please try again.");
         // Optionally disable the proceed button if sessionStorage fails
         if(proceedToReservationButton) proceedToReservationButton.disabled = true;
     }
}



// --- 10. Function to Handle "Proceed to Reservation Details" Button Click ---
function handleProceedToReservation(event) {
    event.preventDefault();

    if (selectedSeats.size === 0) {
        alert("Please select at least one seat.");
        return;
    }

    // Calculate and store the final booking summary in sessionStorage
    updatePurchaseSummary();

    console.log("Proceeding to reservation details...");

    window.location.href = 'confirmbooking.html';

}

loadShowtimeData(currentShowtimeId);
