
// Get references to your form and input elements
const signupForm = document.querySelector('.signup-form'); 
const emailInput = document.getElementById('email'); 
const passwordInput = document.getElementById('password'); 
const nameInput = document.getElementById('name'); 
const mobileInput = document.getElementById('mobile'); 

// Get references to your message elements
const feedbackMsgElement = document.getElementById('signupFeedbackMessage'); // Assuming you added <p id="signupFeedbackMessage"></p>
const errorMsgElement = document.getElementById('signupErrorMessage'); // Assuming you added <p id="signupErrorMessage"></p>


const signupErrorMsg = document.getElementById('signupErrorMsg'); // Optional: Element to display errors
const signupSuccessMsg = document.getElementById('signupSuccessMsg'); // Optional: Element to display success

// Check if the form element exists (good practice!)
if (signupForm) {
    signupForm.addEventListener('submit', async(event) => {
    event.preventDefault();

    // Clear previous messages on new submission attempt
    if (feedbackMsgElement) feedbackMsgElement.textContent = '';
    if (errorMsgElement) errorMsgElement.textContent = '';


    // Get email and password from the inputs
    const email = emailInput.value;
    const password = passwordInput.value;

    // Basic validation (you'll want more robust validation)
    if (email.length === 0 || password.length === 0) {
        if (signupErrorMsg) signupErrorMsg.textContent = "Please enter email and password.";
      return; // Stop the function
    }

    // Use Firebase Auth to create the user
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
        // Signed up successfully!
        const user = userCredential.user; // The new user object

        console.log('User signed up:', user);

        // **ADD THIS PART to display success message on the page**
      if (feedbackMsgElement) {
        feedbackMsgElement.textContent = `Successfully signed up as ${user.email}!`;
        feedbackMsgElement.style.color = 'green'; // Optional: make it green
      }

        signupForm.reset(); 

        // // Optional: Display a success message
        // if (signupSuccessMsg) {
        //     signupSuccessMsg.textContent = `Account created for ${user.email}!`;
        //     if (signupErrorMsg) signupErrorMsg.textContent = ""; // Clear any previous errors
        // }

        // ----- Step 8: Store Additional Data (Name, Mobile) in Firestore -----
        // You only get the user's email and UID from Authentication directly.
        // Name, mobile, etc., should be saved separately.
        // This happens *after* the user is successfully created in Auth.

        // Get the additional data
        const name = nameInput.value;
        const mobile = mobileInput.value;
        const userId = user.uid; // Get the unique User ID from Authentication

        if (typeof db !== 'undefined') {
          db.collection('users').doc(userId).set({ // Use the Auth UID as the document ID
            name: name,
            mobile: mobile,
            email: email, // Can store email here too for easier lookup
            createdAt: firebase.firestore.FieldValue.serverTimestamp() // Optional timestamp
            })
            .then(() => {
            console.log("Additional user data saved to Firestore!");
            // Optional: Redirect the user to a welcome page or dashboard
            // window.location.href = '/welcome.html'; // Example redirection
            })
            .catch((error) => {
            console.error("Error saving additional user data:", error);
            // Handle errors
            });
        } else {
                console.warn("Firestore not initialized. Cannot save additional user data.");
            
        }

        // ------------------------------------------------------------------

        })
        .catch((error) => {
        // Handle errors during signup
        const errorCode = error.code; // Firebase specific error code (e.g., 'auth/email-already-in-use')
        const errorMessage = error.message; // User-friendly error message

        console.error('Error signing up:', errorCode, errorMessage);

        if (errorMsgElement) {
        errorMsgElement.textContent = `Signup failed: ${errorMessage}`;
        errorMsgElement.style.color = 'red'; // Optional: make it red
      }
    // Clear success message if it was there
      if (feedbackMsgElement) feedbackMsgElement.textContent = '';

        // // Optional: Display the error message to the user
        // if (signupErrorMsg) {
        //     signupErrorMsg.textContent = `Error: ${errorMessage}`;
        //     if (signupSuccessMsg) signupSuccessMsg.textContent = ""; // Clear success message
        // }

        // You can add specific handling based on error codes, e.g.:
        // if (errorCode === 'auth/email-already-in-use') {
        //   signupErrorMsg.textContent = 'This email is already in use.';
        // }
        });
    });
} else {
    console.error("Signup form element not found!");
}

// Optional: Add an onAuthStateChanged listener to redirect if already logged in
// This runs whenever the user's authentication state changes (login, logout)
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in.
        console.log('User already logged in on signup page, redirecting...', user);
        // Optional: Redirect logged-in users away from the signup page
        // window.location.href = '/dashboard.html'; // Example redirection
    } else {
        // No user is signed in. Stay on the signup page.
        console.log('No user logged in.');
    }
});

