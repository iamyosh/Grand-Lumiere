
// Get references to the form and input elements on this page
const forgotPasswordForm = document.getElementById('forgotPasswordForm'); 
const resetEmailInput = document.getElementById('resetEmail');         

// Get references to the message elements on this page
const resetFeedbackMsgElement = document.getElementById('resetFeedbackMessage'); 
const resetErrorMsgElement = document.getElementById('resetErrorMessage');  

if (forgotPasswordForm && resetEmailInput) {
    forgotPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        // Clear previous messages on new submission attempt
        if (resetFeedbackMsgElement) resetFeedbackMsgElement.textContent = '';
        if (resetErrorMsgElement) resetErrorMsgElement.textContent = '';

        const email = resetEmailInput.value;


        // Basic email validation
        if (!email) {
            if (resetErrorMsgElement) resetErrorMsgElement.textContent = "Please enter your email address.";
            return;
        }
        


        try {
            await auth.sendPasswordResetEmail(email); 

            console.log('Password reset email sent to:', email); 

            if (resetFeedbackMsgElement) {
                 resetFeedbackMsgElement.textContent = `If that email address is registered, a password reset link has been sent. Please check your inbox.`; // More secure and works with Email Enumeration Protection
                 resetFeedbackMsgElement.style.color = 'green';
            }

            resetEmailInput.value = '';


        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;

            console.error('Error sending password reset email:', errorCode, errorMessage); 

            // Display error message to the user
            if (resetErrorMsgElement) {
                 let displayMessage = 'Error sending password reset email. Please try again.'; 
                 if (errorCode === 'auth/invalid-email') {
                     displayMessage = 'Please enter a valid email address.';
                 }
                 

                 resetErrorMsgElement.textContent = `Error: ${displayMessage}`;
                 resetErrorMsgElement.style.color = 'red';
            }
            if (resetFeedbackMsgElement) resetFeedbackMsgElement.textContent = '';


        } 
    }); 
} else {
    console.error("Forgot password form or reset email input element not found!");
}

