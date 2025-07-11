
// Get references to your form and input elements
const signupForm = document.querySelector('.signup-form'); 
const emailInput = document.getElementById('email'); 
const passwordInput = document.getElementById('password'); 
const nameInput = document.getElementById('name'); 
const mobileInput = document.getElementById('mobile'); 

// Get references to your message elements
const feedbackMsgElement = document.getElementById('signupFeedbackMessage'); 
const errorMsgElement = document.getElementById('signupErrorMessage'); 


const signupErrorMsg = document.getElementById('signupErrorMsg'); 
const signupSuccessMsg = document.getElementById('signupSuccessMsg'); 

// Check if the form element exists
if (signupForm) {
    signupForm.addEventListener('submit', async(event) => {
    event.preventDefault();

    // Clear previous messages on new submission attempt
    if (feedbackMsgElement) feedbackMsgElement.textContent = '';
    if (errorMsgElement) errorMsgElement.textContent = '';


    // Get email and password from the inputs
    const email = emailInput.value;
    const password = passwordInput.value;


    if (email.length === 0 || password.length === 0) {
        if (signupErrorMsg) signupErrorMsg.textContent = "Please enter email and password.";
      return; 
    }

    // Use Firebase Auth to create the user
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
        const user = userCredential.user; 

        console.log('User signed up:', user);



              if (feedbackMsgElement) {
        feedbackMsgElement.textContent = `Successfully signed up as ${user.email}!`;
        feedbackMsgElement.style.color = 'green'; 
      }

        signupForm.reset(); 

    

        // Get the additional data
        const name = nameInput.value;
        const mobile = mobileInput.value;
        const userId = user.uid; 

        if (typeof db !== 'undefined') {
          db.collection('users').doc(userId).set({ 
            name: name,
            mobile: mobile,
            email: email, 
            createdAt: firebase.firestore.FieldValue.serverTimestamp() 
            })
            .then(() => {
            console.log("Additional user data saved to Firestore!");
            })
            .catch((error) => {
            console.error("Error saving additional user data:", error);
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
        errorMsgElement.style.color = 'red';
      }
    // Clear success message if it was there
      if (feedbackMsgElement) feedbackMsgElement.textContent = '';

        
        });
    });
} else {
    console.error("Signup form element not found!");
}

auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User already logged in on signup page, redirecting...', user);
    } else {
        console.log('No user logged in.');
    }
});

