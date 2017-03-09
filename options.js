function saveOptions(e) {
  browser.storage.local.set({
    username: document.querySelector("#username").value,
      passwort: document.querySelector("#passwort").value,
        session_id: document.querySelector("#session_id").value
  });
  e.preventDefault();
}

function restoreOptions() {
  var username = browser.storage.local.get('username');
    var passwort = browser.storage.local.get('passwort');
      var session_id = browser.storage.local.get('session_id');
    username.then((res) => {
      document.querySelector("#username").value = res.username || '';
    });
    passwort.then((res) => {
        document.querySelector("#passwort").value = res.passwort || '';
      });
      session_id.then((res) => {
          document.querySelector("#session_id").value = res.session_id || '';
        });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
