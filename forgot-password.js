// Assuming this script is loaded AFTER the Firebase SDK initialization and your firebaseConfig
// and AFTER the HTML elements for the forgot password form are in the DOM.

// Get references to the form and input elements on this page
const forgotPasswordForm = document.getElementById('forgotPasswordForm'); // Gets the form
const resetEmailInput = document.getElementById('resetEmail');         // Gets the email input

// Get references to the message elements on this page
const resetFeedbackMsgElement = document.getElementById('resetFeedbackMessage'); // Gets the success message element
const resetErrorMsgElement = document.getElementById('resetErrorMessage');   // Gets the error message element

// Check if the form element exists (good practice!)
if (forgotPasswordForm && resetEmailInput) {
    // Add an event listener for the form submission
    forgotPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the form from refreshing the page

        // Clear previous messages on new submission attempt
        if (resetFeedbackMsgElement) resetFeedbackMsgElement.textContent = '';
        if (resetErrorMsgElement) resetErrorMsgElement.textContent = '';

        const email = resetEmailInput.value;

        // Basic email validation
        if (!email) {
            if (resetErrorMsgElement) resetErrorMsgElement.textContent = "Please enter your email address.";
            return;
        }
        // Optional: Simple format check (can be more robust)
        // if (!email.includes('@')) {
        //     if (resetErrorMsgElement) resetErrorMsgElement.textContent = "Please enter a valid email address.";
        //     return;
        // }


        try {
            // **CALL THE FIREBASE METHOD TO SEND THE PASSWORD RESET EMAIL**
            // The second argument is optional ActionCodeSettings for redirecting back to your app.
            // You could specify a continueUrl here to send the user back to your site after they click the link in the email.
            // auth.sendPasswordResetEmail(email, actionCodeSettings); // Example with settings
            await auth.sendPasswordResetEmail(email); // Simpler call without settings

            // SUCCESS!
            console.log('Password reset email sent to:', email); // Keep for debugging

            // Display success message to the user
            if (resetFeedbackMsgElement) {
                // IMPORTANT SECURITY NOTE: For security reasons (to prevent revealing which emails are registered),
                // it's often recommended to show the same success message whether the email exists or not,
                // or a generic "If that email is registered..." message. This is Firebase's default behavior if
                // Email Enumeration Protection is enabled (no error is thrown for non-existent emails).
                 resetFeedbackMsgElement.textContent = `If that email address is registered, a password reset link has been sent. Please check your inbox.`; // More secure and works with Email Enumeration Protection
                 resetFeedbackMsgElement.style.color = 'green';
            }

            // Clear the reset email input field after success
            resetEmailInput.value = '';

            // Optional: After showing success, you might want to redirect back to the login page after a delay
            // setTimeout(() => {
            //    window.location.replace('login.html');
            // }, 5000); // Redirect after 5 seconds

        } catch (error) {
            // Handle errors (e.g., auth/invalid-email if Email Enumeration Protection is OFF)
            const errorCode = error.code;
            const errorMessage = error.message;

            console.error('Error sending password reset email:', errorCode, errorMessage); // Keep for debugging

            // Display error message to the user
            if (resetErrorMsgElement) {
                 let displayMessage = 'Error sending password reset email. Please try again.'; // Default message
                 // Specific error messages from Firebase Auth (less common if Email Enumeration Protection is ON):
                 if (errorCode === 'auth/invalid-email') {
                     displayMessage = 'Please enter a valid email address.';
                 }
                 // If Email Enumeration Protection is OFF and you get 'auth/user-not-found',
                 // you should still probably show the secure message as above instead of saying "user not found".

                 resetErrorMsgElement.textContent = `Error: ${displayMessage}`;
                 resetErrorMsgElement.style.color = 'red';
            }
            // Clear success message
            if (resetFeedbackMsgElement) resetFeedbackMsgElement.textContent = '';

            // Do NOT clear the email input field on error, so user can correct it

        } // closes the catch block
    }); // closes the form submit event listener
} else {
    console.error("Forgot password form or reset email input element not found!");
}

// No need for an onAuthStateChanged listener on this page typically, as user shouldn't need to be logged in to reset password.
