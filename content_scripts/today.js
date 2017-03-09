document.body.style.border = "5px dashed red";

console.log("begin_today");

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    }
    return result;
}

var session_id = findGetParameter("PHPSESSID")
var start = findGetParameter("start")
var month = findGetParameter("month")
var year = findGetParameter("year")
var username = document.querySelector('input[name="username"]');
var passwort = document.querySelector('input[name="passwort"]');

console.log(session_id,start,month,year)

if(session_id!=null) {
  browser.storage.local.set({
        'session_id': session_id
  });
  console.log("saved: ", session_id);
}


console.log("end_today");
