const {
    Stitch,
    UserPasswordAuthProviderClient,
    UserPasswordCredential,
    GoogleRedirectCredential,
    FacebookRedirectCredential,

} = stitch;

const stitchClient = Stitch.initializeDefaultAppClient("thepages-qufuu");

// Get a MongoDB Service Client
const mongodb = stitchClient.getServiceClient(
    stitch.RemoteMongoClient.factory,
    "mongodb-atlas"
);
// Get a reference to the database
const db = mongodb.db("database");


/*****
*
* Register a new and Authenticate a Stitch User
*
*/

const emailPasswordClient = stitchClient.auth
    .getProviderClient(UserPasswordAuthProviderClient.factory, "userpass");

async function handleSignup() {
    const email = registerEmailEl.value;
    const password = registerPasswordEl.value;

    try {

        await emailPasswordClient.registerWithEmail(email, password)
        showPostRegistrationState()
        displaySuccess("Successfully registered. Check your inbox for a confirmation email.")

    } catch (e) {
        handleError(e)
    }
}

async function handleResendConfirmation() {
    const email = resendConfirmationEmailEl.value;
    await emailPasswordClient.resendConfirmationEmail(email);
    showControlPanel();
}



/*
*
* Authenticate an application user based on the submitted information
*
*/

async function handleStitchLogin() {
    const email = loginEmailEl.value;
    const password = loginPasswordEl.value;
    const credential = new UserPasswordCredential(email, password);

    try {

        await stitchClient.auth.loginWithCredential(credential);
        const user = stitchClient.auth.user;
        showLoggedInState();
        displaySuccess(`Logged in as: ${user.profile.data.email}`);


    } catch (e) {
        handleError(e);
    }
}

async function handleGoogleLogin() {

    if (!stitchClient.auth.isLoggedIn) {
        const credential = new GoogleRedirectCredential();
        stitchClient.auth.loginWithRedirect(credential);
    }

}

async function handleFacebookLogin() {

    if (!stitchClient.auth.isLoggedIn) {
        const credential = new FacebookRedirectCredential();
        Stitch.defaultAppClient.auth.loginWithRedirect(credential);
    }
}


/*
*
* Logout a User
*
*/

async function handleLogout() {
    await stitchClient.auth.logout();
    location.reload();
}



/*
*
* Initialize after Page Load
*
*/

function onLoad() {

    if (stitchClient.auth.isLoggedIn) {
        showLoggedInState();
        displaySuccess(`Logged in as: ${stitchClient.auth.user.profile.data.email}`);
        displayRecords();
    }
    else if (stitchClient.auth.hasRedirectResult()) {
        stitchClient.auth.handleRedirectResult().then(user => {
            console.log(user);
            if (stitchClient.auth.isLoggedIn) {
                showLoggedInState();
                displaySuccess(`Logged in as: ${stitchClient.auth.user.profile.data.email}`);
                displayRecords();
            }
        });
    }
    else {
        showControlPanel();
    }

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

// 
const inputForm = document.getElementById("input");
const displayComments = document.getElementById("comments");
const displayComment = document.getElementById("comment");
const insertResultEl = document.getElementById("result");


/*
*
* MongoDB Database Access
*
*/

function insertRecord() {

    const newInfo = document.getElementById("my-info");
    if (newInfo.value != "") {
        console.log("add comment", stitchClient.auth.user.id)
        db.collection("collection")
            .insertOne({ owner_id: stitchClient.auth.user.id, comment: newInfo.value })
            .then(displayRecords());
        newInfo.value = "";
        insertResultEl.innerText = "Comment Successfully Added!";
    }
    else {
        insertResultEl.innerText = "Please Enter a Comment!";
    }
}


function displayRecords() {
    db.collection("collection")
        .find({}, { limit: 10 })
        .asArray()
        .then(docs => {
            const html = docs.map(doc => `<div id="comment">${doc.comment}</div>`).join('');
            document.getElementById("comments").innerHTML = html;
        });
}

/*
*
* GUI Functions
*
*/


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
    clearNotifications();
    resendConfirmationEl.hidden = true;
    controlPanelEl.hidden = false;
    loginFormEl.hidden = true;
    registerFormEl.hidden = true;
    loggedInEl.hidden = true;
    postRegistrationEl.hidden = true;
    inputForm.hidden = true;
    displayComments.hidden = true;
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
    inputForm.hidden = false;
    displayComments.hidden = false;
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

function handleError(err) {
    console.error(err)
    const errType = err.message || "Error!"
    const msg = ({
        "invalid username/password": "Invalid username or password was entered. Please try again.",
        "name already in use": "An account already exists for that email."
    })[errType] || errType
    displayError(msg);
}