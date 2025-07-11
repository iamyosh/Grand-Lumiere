document.addEventListener("DOMContentLoaded", () => {
    const tryBtn = document.querySelector(".try-btn");
    tryBtn.addEventListener("click", () => {
        alert("Welcome to the Lumiere Lounge Experience!");
    });
});



const auth = firebase.auth(); 


if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    // You can adjust the port (5001) if your functions emulator starts on a different one
    firebase.functions().useEmulator("localhost", 5001);
}

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

            loginLinkElement.style.display = 'none';

            usernameDisplaySpan.style.display = 'inline'; 
            usernameDisplaySpan.textContent = `Welcome, ${user.email}`; 

            logoutButtonElement.style.display = 'inline-block'; //button styling

        } else {
            console.log('No user signed in.');

            loginLinkElement.style.display = 'inline-block'; 

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
    if (tryBtn) { 
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
        event.preventDefault(); 

        const email = newsletterEmailInput.value;
        newsletterMessageDiv.textContent = ''; 
        newsletterSubscribeBtn.disabled = true; 
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
                newsletterEmailInput.value = ''; 
            } else {
                newsletterMessageDiv.textContent = result.data.message || 'Subscription failed. Please try again.';
            }

        } catch (error) {
            console.error('Error subscribing to newsletter:', error);
            if (error.code === 'already-exists') {
                newsletterMessageDiv.textContent = 'You are already subscribed!';
            } else if (error.code === 'invalid-argument') {
                newsletterMessageDiv.textContent = 'Please enter a valid email address.';
            }
            else {
                newsletterMessageDiv.textContent = 'An error occurred during subscription. Please try again later.';
            }
        } finally {
            newsletterSubscribeBtn.disabled = false; 
            newsletterSubscribeBtn.style.opacity = '1';
        }
    });
}
