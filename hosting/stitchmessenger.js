// DOM Element Variables

const notificationEl = document.getElementById("info");
const successEl = document.getElementById("success");
const errorEl = document.getElementById("error");
const loginEl = document.getElementById("login");
const loggedinEl = document.getElementById("logged-in");
const userEl = document.getElementById("user");
const newmessageEl = document.getElementById("new-message");
const messageEl = document.getElementById("message");
const recipientEl = document.getElementById("recipient");
const messageTableEl = document.getElementById("messageTable");
const messagesEl = document.getElementById("messages");


// Initiate Stitch Client

const {
    Stitch,
    FacebookRedirectCredential,
    GoogleRedirectCredential,
} = stitch;

const stitchClient = Stitch.initializeDefaultAppClient('thepages-pgxap');

// Authenticate a user using Facebook or Google as IDP

function handleFacebookLogin() {
    const credential = new FacebookRedirectCredential();
    Stitch.defaultAppClient.auth.loginWithRedirect(credential);

}

function handleGoogleLogin() {
    const credential = new GoogleRedirectCredential();
    stitchClient.auth.loginWithRedirect(credential);
}


// Logout a user

async function handleLogout() {
    await stitchClient.auth.logout();
    location.reload();
}


// Get a MongoDB Service Client for Atlas Database

const mongodb = stitchClient.getServiceClient(
    stitch.RemoteMongoClient.factory,
    'thepages-atlas'
);

// Get a reference to the database

const db = mongodb.db("messenger");

async function sendMessage() {
    const newMessage = document.getElementById("message");
    const recipient = document.getElementById("recipient");
    if ((message.value != "") && (recipient.value != "")) {
        await db.collection("messages")
            .insertOne({ owner_id: stitchClient.auth.user.id, message: newMessage.value, recipient: recipient.value })
            .then(submitSuccessful());
    }
    else {
        errorEl.innerText = "Please enter a message text and a recipient!";
    }
}

function submitSuccessful() {
    clearFields([messageEl, recipientEl]);
    errorEl.innerText = "";
    successEl.innerText = "Message Successfully Submitted!";
    displayMessages();
}

function displayMessages() {
    db.collection("messages")
        .find({}, {
            limit: 10,
            sort: { "_id": -1 }
        })
        .asArray()
        .then(messages => {
            const html = messages.map(message =>
                `<tr id="message">
                    <td>${message.message}</td>
                    <td>${message.recipient}</td>
                </tr>`).join('');
            document.getElementById("messages").innerHTML = html;
        });
}


// GUI Functions

function showLoggedOutState() {
    clearNotifications();
    userEl.innerText = "";
    loginEl.hidden = false;
    loggedinEl.hidden = true;
    newmessageEl.hidden = true;
    messageTableEl.hidden = true;
}

function showLoggedInState() {
    clearNotifications();
    userEl.innerHTML = `Logged in as: ${stitchClient.auth.user.profile.data.email}`;
    loginEl.hidden = true;
    loggedinEl.hidden = false;
    newmessageEl.hidden = false;
    messageTableEl.hidden = false;

}

function clearNotifications() { [errorEl, successEl].forEach(el => el.innerText = "") }

function clearFields(fields) { fields.forEach(field => field.value = "") }


// Initialize Page

function onLoad() {

    if (stitchClient.auth.isLoggedIn) {
        displayMessages();
        showLoggedInState();

    }
    else if (stitchClient.auth.hasRedirectResult()) {
        stitchClient.auth.handleRedirectResult().then(user => {
            if (stitchClient.auth.isLoggedIn) {
                displayMessages();
                showLoggedInState();
            }
        });
    }
    else {
        showLoggedOutState();
    }

}