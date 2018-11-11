const {
    Stitch,
    UserPasswordCredential,
    GoogleRedirectCredential,

} = stitch;

const stitchClient = Stitch.initializeDefaultAppClient("thepages-qufuu");


// Authenticate an application user based on the submitted information
async function handleStitchLogin() {
    const email = loginEmailEl.value;
    const password = loginPasswordEl.value;
    const credential = new UserPasswordCredential(email, password);

    try {

        await stitchClient.auth.loginWithCredential(credential);
        const user = stitchClient.auth.user;
        showLoggedInState();
        displaySuccess(`Logged in as: ${user.profile.data.email}`)

    } catch (e) {
        handleError(e)
    }
}

async function handleGoogleLogin() {

    if (!stitchClient.auth.isLoggedIn) {
        const credential = new GoogleRedirectCredential();
        stitchClient.auth.loginWithRedirect(credential);
    }

}

function onLoad() {

    if (stitchClient.auth.isLoggedIn){
        showLoggedInState();
        displaySuccess(`Logged in as: ${stitchClient.auth.user.profile.data.email}`);
    }
    else if (stitchClient.auth.hasRedirectResult()) {
        stitchClient.auth.handleRedirectResult().then(user => {
            console.log(user);
            if (stitchClient.auth.isLoggedIn) {
                showLoggedInState();
                displaySuccess(`Logged in as: ${stitchClient.auth.user.profile.data.email}`);
            }
        });
    } 
    else {
        showControlPanel();
    }

}

async function handleLogout() {
    await stitchClient.auth.logout();
    showControlPanel();
}

async function handleResendConfirmation() {
    const email = resendConfirmationEmailEl.value;
    await emailPasswordClient.resendConfirmationEmail(email);
    showControlPanel();
}

// DOM Element Variables
const resendConfirmationEl = document.getElementById("resend-confirmation");
const controlPanelEl = document.getElementById("control-panel");
const registerFormEl = document.getElementById("create-a-user");
const loginFormEl = document.getElementById("login");
const registerEmailEl = document.getElementById("create-a-user-email");
const registerPasswordEl = document.getElementById("create-a-user-password");
const resendConfirmationEmailEl = document.getElementById("resend-confirmation-email");
const loginEmailEl = document.getElementById("login-email");
const loginPasswordEl = document.getElementById("login-password");
const notificationEl = document.getElementById("info");
const loggedInEl = document.getElementById("logged-in");
const postRegistrationEl = document.getElementById("finished-registration");

const successEl = document.getElementById("success");
const errorEl = document.getElementById("error");


// Notification Functions
function displayError(errorMessage) { clearNotifications(); errorEl.innerText = errorMessage; }
function displaySuccess(successMessage) { clearNotifications(); successEl.innerText = successMessage }
function clearNotifications() { [errorEl, successEl].forEach(el => el.innerText = "") }

// Helper Functions
function clearFields(fields) { fields.forEach(field => field.value = "") }
function toggleHiddenElementById(id) { document.getElementById(id).classList.toggle("hidden"); }

// UI State Transitions
function showRegistrationForm() {
    clearNotifications();
    resendConfirmationEl.hidden = true;
    controlPanelEl.hidden = true;
    registerFormEl.hidden = false;
    loggedInEl.hidden = true;
    postRegistrationEl.hidden = true;
}

function showLoginForm() {
    clearNotifications();
    resendConfirmationEl.hidden = true;
    controlPanelEl.hidden = true;
    loginFormEl.hidden = false;
    loggedInEl.hidden = true;
    postRegistrationEl.hidden = true;
}

function showControlPanel() {
    clearNotifications()
    resendConfirmationEl.hidden = true;
    controlPanelEl.hidden = false;
    loginFormEl.hidden = true;
    registerFormEl.hidden = true;
    loggedInEl.hidden = true;
    postRegistrationEl.hidden = true;
}
function showResendConfirmationForm() {
    clearNotifications()
    resendConfirmationEl.hidden = false;
    controlPanelEl.hidden = true;
    loginFormEl.hidden = true;
    registerFormEl.hidden = true;
    loggedInEl.hidden = true;
    postRegistrationEl.hidden = true;
}

function showLoggedInState() {
    clearFields([loginEmailEl, loginPasswordEl]);
    clearNotifications()
    resendConfirmationEl.hidden = true;
    controlPanelEl.hidden = true;
    loginFormEl.hidden = true;
    registerFormEl.hidden = true;
    loggedInEl.hidden = false;
    postRegistrationEl.hidden = true;
}

function showPostRegistrationState() {
    clearFields([registerEmailEl, registerPasswordEl]);
    resendConfirmationEl.hidden = true;
    controlPanelEl.hidden = true;
    loginFormEl.hidden = true;
    registerFormEl.hidden = true;
    loggedInEl.hidden = true;
    postRegistrationEl.hidden = false;
}

function setPostRegistrationState() {
    // Clear registration form inputs then hide the form
    clearFields([registerEmailEl, registerPasswordEl]);
    toggleHiddenElementById("create-a-user");
    return Promise.resolve()
}

function handleError(err) {
    console.error(err)
    const errType = err.message || "Error!"
    const msg = ({
        "invalid username/password": "Invalid username or password was entered. Please try again.",
        "name already in use": "An account already exists for that email."
    })[errType] || errType
    displayError(msg);
}