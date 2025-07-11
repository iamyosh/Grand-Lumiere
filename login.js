// Get references to your form and input elements
const loginForm = document.querySelector('.login-form'); 
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password'); 
const rememberMeCheckbox = document.getElementById('rememberMe');

// Get references to your message elements
const feedbackMsgElement = document.getElementById('loginFeedbackMessage');
const errorMsgElement = document.getElementById('loginErrorMessage');



const forgotPasswordLink = document.querySelector('.form-options a[href="#"]');     // Gets the 'Forgot Password?' link
const forgotPasswordSection = document.getElementById('forgotPasswordSection');     // Gets the new hidden div
const forgotPasswordForm = document.getElementById('forgotPasswordForm');           // Gets the new form
const resetEmailInput = document.getElementById('resetEmail');                      // Gets the email input for reset
const resetFeedbackMsgElement = document.getElementById('resetFeedbackMessage');    // Gets the reset success message element
const resetErrorMsgElement = document.getElementById('resetErrorMessage');          // Gets the reset error message element
const backToLoginLink = document.getElementById('backToLoginLink');                 // Gets the 'Back to Login' link

// Event listener
if (forgotPasswordLink && forgotPasswordSection && loginForm) { 
    forgotPasswordLink.addEventListener('click', (event) => {
        event.preventDefault(); 

// Show the forgot password section
 forgotPasswordSection.style.display = 'block'; 

    if (resetFeedbackMsgElement) resetFeedbackMsgElement.textContent = '';
    if (resetErrorMsgElement) resetErrorMsgElement.textContent = '';

    });
} 
else {
    console.error("Forgot password link, section, or login form element not found!");
}


// event listener - "BACK TO LOGIN" LINK
if (backToLoginLink && forgotPasswordSection && loginForm) { // Check if elements exist
    backToLoginLink.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the link from doing its default navigation

    // Hide the forgot password section
        forgotPasswordSection.style.display = 'none';

    // Show the main login form
        loginForm.style.display = 'block'; // Or 'flex', 'grid', etc., as it was before

    // Clear any previous reset messages
        if (resetFeedbackMsgElement) resetFeedbackMsgElement.textContent = '';
        if (resetErrorMsgElement) resetErrorMsgElement.textContent = '';

    // Optional: Clear the reset email input
        if (resetEmailInput) resetEmailInput.value = '';
    });
} 
else {
    console.error("'Back to Login' link, section, or login form element not found!");
}



// **ADD EVENT LISTENER FOR THE "SEND RESET EMAIL" FORM SUBMISSION**
if (forgotPasswordForm && resetEmailInput) { // Check if form and input exist
    forgotPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the form from refreshing the page

    // Clear previous reset messages
        if (resetFeedbackMsgElement) resetFeedbackMsgElement.textContent = '';
        if (resetErrorMsgElement) resetErrorMsgElement.textContent = '';

        const email = resetEmailInput.value;

    // Basic email validation
    if (!email) {
        if (resetErrorMsgElement) resetErrorMsgElement.textContent = "Please enter your email address.";
        return;
    }

try {
// **CALL THE FIREBASE METHOD TO SEND THE PASSWORD RESET EMAIL**
    await auth.sendPasswordResetEmail(email);

// SUCCESS!
    console.log('Password reset email sent to:', email);

// Display success message to the user
    if (resetFeedbackMsgElement) {
// This code shows the email
        resetFeedbackMsgElement.textContent = `Password reset email sent to ${email}. Please check your inbox.`;
        resetFeedbackMsgElement.style.color = 'green'; 
    }

// Clear the reset email input field after success
    resetEmailInput.value = '';

    } catch (error) {
    // Handle errors (e.g., user not found, invalid email format)
    const errorCode = error.code;
    const errorMessage = error.message;

    console.error('Error sending password reset email:', errorCode, errorMessage); // Keep for debugging

    // Display error message to the user
    if (resetErrorMsgElement) {
        let displayMessage = 'Error sending password reset email. Please try again.'; // Default message
    // Specific error messages from Firebase Auth:
        if (errorCode === 'auth/user-not-found') {
            displayMessage = 'If that email address is registered, a password reset link has been sent.'; // More secure
        } else if (errorCode === 'auth/invalid-email') {
            displayMessage = 'Please enter a valid email address.';
        }

        resetErrorMsgElement.textContent = `Error: ${displayMessage}`;
        resetErrorMsgElement.style.color = 'red';
    }
    // Clear success message
    if (resetFeedbackMsgElement) resetFeedbackMsgElement.textContent = '';


        }
    });
} else {
    console.error("Forgot password form or reset email input element not found!");
}



// Check if the form element exists
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

     // Clear previous messages on new submission attempt
    if (feedbackMsgElement) feedbackMsgElement.textContent = '';
    if (errorMsgElement) errorMsgElement.textContent = '';


    // Get email and password from the inputs
    const email = emailInput.value;
    const password = passwordInput.value;

    // Basic validation
    if (!email || !password) { // Using !email or !password - checks if they are empty strings
        if (errorMsgElement) errorMsgElement.textContent = "Please enter email and password.";
        return;
    }

    // Determine persistence based on "Remember Me" checkbox
    let persistence = firebase.auth.Auth.Persistence.LOCAL;
    
    if (rememberMeCheckbox && !rememberMeCheckbox.checked) {
        persistence = firebase.auth.Auth.Persistence.SESSION; // Stay logged in only for the current browser session
    }

    // If checkbox exists and is NOT checked, use SESSION persistence
    if (rememberMeCheckbox && !rememberMeCheckbox.checked) {
        persistence = firebase.auth.Auth.Persistence.SESSION; // Stay logged in only for the current browser session
    }


    try {
        // Set the desired persistence state *before* signing in
        await auth.setPersistence(persistence);

        // Use Firebase Auth to sign in the user
        const userCredential = await auth.signInWithEmailAndPassword(email, password);

        // Signed in successfully!
        const user = userCredential.user; // The logged-in user object

        console.log('User signed in:', user);


        // Display message and redirect
        if (feedbackMsgElement) {
            feedbackMsgElement.textContent = `Successfully signed in as ${user.email}!`;
            feedbackMsgElement.style.color = 'green';
        }


        // Clear password field for security after successful login
        passwordInput.value = '';


        // Redirect to home page (index.html) after a short delay to show the message
    setTimeout(() => {
        // Use replace() instead of assign() to prevent users from navigating back to the login page after they log in.
        window.location.replace('index.html');
    }, 2000); // Redirect after 2 seconds



    } catch (error) {
      // Handle errors during login
      const errorCode = error.code; // Firebase specific error code (e.g., 'auth/user-not-found', 'auth/wrong-password')
        const errorMessage = error.message;

        console.error('Error signing in:', errorCode, errorMessage);


        // *HANDLE ERROR* Display message and refresh page
        if (errorMsgElement) {
            let displayMessage = 'Login failed. Please try again.'; // Default message

            if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
                displayMessage = 'Invalid email or password.'; // Common message for both cases
            } else if (errorCode === 'auth/invalid-email') {
            displayMessage = 'Please enter a valid email address.';
        }

        errorMsgElement.textContent = `Error: ${displayMessage}`;
        errorMsgElement.style.color = 'red'; // Optional styling
    }

    // Clear success message if it was there
    if (feedbackMsgElement) feedbackMsgElement.textContent = '';

    // Clear password field on error for security
    passwordInput.value = '';

/*
    // **Trigger page refresh on error**
      // NOTE: Triggering a full page refresh on a client-side error is less common than
      // just displaying the error message and leaving the user on the page.
      // It can be jarring and slow down the user experience.
      // If you prefer *not* to refresh, simply remove the setTimeout block below.
      setTimeout(() => {
           window.location.reload();
      }, 500); // Refresh after 0.5 seconds

*/
        }
    });
} else {
    console.error("Login form element not found!");
}


// OPTIONAL: This runs whenever the user's authentication state changes (login, logout, page load)
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in.
        console.log('User already logged in on login page, redirecting...', user);
        // Optional: Redirect logged-in users away from the login page
        // window.location.href = '/dashboard.html'; // Example redirection
    } else {
        // No user is signed in. Stay on the login page.
        console.log('No user logged in.');
    }
});

