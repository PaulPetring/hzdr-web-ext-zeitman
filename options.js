function saveOptions(e) {

    browser.storage.local.set({
        save_username: document.querySelector("#save_username").checked,
        save_passwort: document.querySelector("#save_passwort").checked
    });

    if (document.querySelector("#save_username").checked) {
        console.log("saving save_username")
        browser.storage.local.set({
            username: document.querySelector("#username").value,
            save_username: true
        });
    } else {
        browser.storage.local.set({
            username: ""
        });
        document.querySelector("#username").value = "";
    }

    if (document.querySelector("#save_passwort").checked) {
        console.log("saving save_passwort")
        browser.storage.local.set({
            passwort: document.querySelector("#passwort").value,
            save_passwort: true
        });
    } else {
        browser.storage.local.set({
            passwort: ""
        });
        document.querySelector("#passwort").value = "";
    }

    browser.storage.local.set({
        session_id: document.querySelector("#session_id").value
    });
    console.log(document.querySelector("#save_username").checked, document.querySelector("#save_passwort").checked)
    console.log("saving done");
}

function restoreOptions() {
    console.log("restoreOptions");
    var username = browser.storage.local.get('username');
    var passwort = browser.storage.local.get('passwort');
    var session_id = browser.storage.local.get('session_id');
    var save_username = browser.storage.local.get('save_username');
    var save_passwort = browser.storage.local.get('save_passwort');

    username.then((res) => {
        document.querySelector("#username").value = res.username || '';
    });
    passwort.then((res) => {
        document.querySelector("#passwort").value = res.passwort || '';
    });
    session_id.then((res) => {
        document.querySelector("#session_id").value = res.session_id || '';
    });
    save_username.then((res) => {
        document.querySelector("#save_username").checked = res.save_username || true;
    });
    save_passwort.then((res) => {
        document.querySelector("#save_passwort").checked = res.save_passwort || false;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
