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
if (backToLoginLink && forgotPasswordSection && loginForm) { 
    backToLoginLink.addEventListener('click', (event) => {
        event.preventDefault(); 

    // Hide the forgot password section
        forgotPasswordSection.style.display = 'none';

        loginForm.style.display = 'block'; 

        if (resetFeedbackMsgElement) resetFeedbackMsgElement.textContent = '';
        if (resetErrorMsgElement) resetErrorMsgElement.textContent = '';

        if (resetEmailInput) resetEmailInput.value = '';
    });
} 
else {
    console.error("'Back to Login' link, section, or login form element not found!");
}



// Event listener - "SEND RESET EMAIL" FORM SUBMISSION
if (forgotPasswordForm && resetEmailInput) { // Check if form and input exist
    forgotPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the form from refreshing the page

        if (resetFeedbackMsgElement) resetFeedbackMsgElement.textContent = '';
        if (resetErrorMsgElement) resetErrorMsgElement.textContent = '';

        const email = resetEmailInput.value;

    // email validation
    if (!email) {
        if (resetErrorMsgElement) resetErrorMsgElement.textContent = "Please enter your email address.";
        return;
    }

try {
    await auth.sendPasswordResetEmail(email);

    console.log('Password reset email sent to:', email);

    if (resetFeedbackMsgElement) {
        resetFeedbackMsgElement.textContent = `Password reset email sent to ${email}. Please check your inbox.`;
        resetFeedbackMsgElement.style.color = 'green'; 
    }

    resetEmailInput.value = '';

    } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;

    console.error('Error sending password reset email:', errorCode, errorMessage); 

    if (resetErrorMsgElement) {
        let displayMessage = 'Error sending password reset email. Please try again.'; 
    // Specific error messages from Firebase Auth:
        if (errorCode === 'auth/user-not-found') {
            displayMessage = 'If that email address is registered, a password reset link has been sent.'; 
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



if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (feedbackMsgElement) feedbackMsgElement.textContent = '';
    if (errorMsgElement) errorMsgElement.textContent = '';


    // Get email and password from the inputs
    const email = emailInput.value;
    const password = passwordInput.value;

    // Basic validation
    if (!email || !password) {
        if (errorMsgElement) errorMsgElement.textContent = "Please enter email and password.";
        return;
    }

    // "Remember Me" checkbox
    let persistence = firebase.auth.Auth.Persistence.LOCAL;
    
    if (rememberMeCheckbox && !rememberMeCheckbox.checked) {
        persistence = firebase.auth.Auth.Persistence.SESSION; 
    }

    if (rememberMeCheckbox && !rememberMeCheckbox.checked) {
        persistence = firebase.auth.Auth.Persistence.SESSION; 
    }


    try {
        await auth.setPersistence(persistence);

        // Use Firebase Auth to sign in the user
        const userCredential = await auth.signInWithEmailAndPassword(email, password);

        const user = userCredential.user; 

        console.log('User signed in:', user);


        if (feedbackMsgElement) {
            feedbackMsgElement.textContent = `Successfully signed in as ${user.email}!`;
            feedbackMsgElement.style.color = 'green';
        }


        passwordInput.value = '';


    setTimeout(() => {
        // Use replace() instead of assign() to prevent users from navigating back to the login page after they log in.
        window.location.replace('index.html');
    }, 2000); 
    // Redirect after 2 seconds



    } catch (error) {
      // Handle errors during login
      const errorCode = error.code; 
        const errorMessage = error.message;

        console.error('Error signing in:', errorCode, errorMessage);


        if (errorMsgElement) {
            let displayMessage = 'Login failed. Please try again.'; 

            if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
                displayMessage = 'Invalid email or password.'; 
            } else if (errorCode === 'auth/invalid-email') {
            displayMessage = 'Please enter a valid email address.';
        }

        errorMsgElement.textContent = `Error: ${displayMessage}`;
        errorMsgElement.style.color = 'red'; 
    }

    if (feedbackMsgElement) feedbackMsgElement.textContent = '';

    passwordInput.value = '';

        }
    });
} else {
    console.error("Login form element not found!");
}


auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User already logged in on login page, redirecting...', user);
    } else {
        console.log('No user logged in.');
    }
});

