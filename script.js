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

