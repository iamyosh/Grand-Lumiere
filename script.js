document.addEventListener("DOMContentLoaded", () => {
    const tryBtn = document.querySelector(".try-btn");
    tryBtn.addEventListener("click", () => {
        alert("Welcome to the Lumiere Lounge Experience!");
    });
});


// Remove the import statements if you are including Firebase via <script> tags
// import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const auth = firebase.auth(); // Using the compat SDK syntax

// Get references to the elements we need to show/hide
const loginLinkElement = document.getElementById('loginLink'); // Get the <a> tag
const usernameDisplaySpan = document.getElementById('usernameDisplay'); // Get the span
const logoutButtonElement = document.getElementById('logoutBtn'); // Get the logout button

// Ensure elements exist before proceeding
if (loginLinkElement && usernameDisplaySpan && logoutButtonElement) {

    // Listen for authentication state changes
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('User is logged in:', user.email);

            // Hide the login link (which contains the login button)
            loginLinkElement.style.display = 'none';

            usernameDisplaySpan.style.display = 'inline'; // Use 'inline' to keep it in line with other nav items
            usernameDisplaySpan.textContent = `Welcome, ${user.email}`; 

            // Show the logout button
            logoutButtonElement.style.display = 'inline-block'; // Use 'inline-block' for button styling

        } else {
            console.log('No user signed in.');

            loginLinkElement.style.display = 'inline-block'; // Or your default display style

            usernameDisplaySpan.style.display = 'none';
            usernameDisplaySpan.textContent = '';

            // Hide the logout button
            logoutButtonElement.style.display = 'none';
        }
    });

    logoutButtonElement.addEventListener('click', () => {
        auth.signOut().then(() => {
            console.log('User signed out successfully.');
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    });

} else {
    console.error("Could not find required navigation elements in the DOM.");
    console.log("Looking for:", {
        loginLink: loginLinkElement,
        usernameDisplay: usernameDisplaySpan,
        logoutButton: logoutButtonElement
    });
}


// Your existing DOMContentLoaded listener (keep this as is)
document.addEventListener("DOMContentLoaded", () => {
    const tryBtn = document.querySelector(".try-btn");
    if (tryBtn) { // Added a check to make sure the element exists
        tryBtn.addEventListener("click", () => {
            alert("Welcome to the Lumiere Lounge Experience!");
        });
    } else {
        console.log("Could not find .try-btn element.");
    }
});




// --- Newsletter Subscription Logic ---
const newsletterForm = document.getElementById('newsletter-form');
const newsletterEmailInput = document.getElementById('newsletter-email');
const newsletterSubscribeBtn = document.getElementById('newsletter-subscribe-btn');
const newsletterMessageDiv = document.getElementById('newsletter-message');

if (newsletterForm) { // Check if the form element exists on the page
    newsletterForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const email = newsletterEmailInput.value;
        newsletterMessageDiv.textContent = ''; // Clear previous messages
        newsletterSubscribeBtn.disabled = true; // Disable button to prevent multiple submissions
        newsletterSubscribeBtn.style.opacity = '0.5'; // Visually indicate disabled state

        if (!email) {
            newsletterMessageDiv.textContent = 'Please enter your email address.';
            newsletterSubscribeBtn.disabled = false;
            newsletterSubscribeBtn.style.opacity = '1';
            return;
        }

        try {
            // Call the Cloud Function
            const subscribeToNewsletter = firebase.functions().httpsCallable('subscribeToNewsletter');
            const result = await subscribeToNewsletter({ email: email });

            console.log('Newsletter subscription response:', result.data);

            if (result.data.success) {
                newsletterMessageDiv.textContent = 'Thank you for subscribing!';
                newsletterEmailInput.value = ''; // Clear the input field
            } else {
                // Display error message from the function, or a generic one
                newsletterMessageDiv.textContent = result.data.message || 'Subscription failed. Please try again.';
            }

        } catch (error) {
            console.error('Error subscribing to newsletter:', error);
            // Display a user-friendly error message
            if (error.code === 'already-exists') {
                 newsletterMessageDiv.textContent = 'You are already subscribed!';
            } else if (error.code === 'invalid-argument') {
                 newsletterMessageDiv.textContent = 'Please enter a valid email address.';
            }
            else {
                newsletterMessageDiv.textContent = 'An error occurred during subscription. Please try again later.';
            }
        } finally {
            newsletterSubscribeBtn.disabled = false; // Re-enable the button
            newsletterSubscribeBtn.style.opacity = '1';
        }
    });
}
// --- End of Newsletter Subscription Logic ---