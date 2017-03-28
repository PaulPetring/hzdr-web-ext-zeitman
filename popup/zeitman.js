console.log("begin_zeitman");

var session_id = null;
var already_Logged_In = false;
var zeitman_url = "https://zeitweb.hzdr.de/scripts_zeitm/"

document.addEventListener("click", (e) => {
    e.preventDefault();
    return;
});

function getRemote(url, data) {
    return $.ajax({
        type: "POST",
        url: url,
        data: data,
        async: false //needs to by blocking to do the storage session id trick
    }).responseText;
}

function fillCredentials() {
    var username = browser.storage.local.get('username');
    var passwort = browser.storage.local.get('passwort');

    username.then((res) => {
        //console.log(res.username);
        $('input[name="username"]').val(res.username);
    });

    passwort.then((res) => {
        //console.log(res.passwort);
        $('input[name="passwort"]').val(res.passwort);
    });
}

function provideLoginForm() {
    console.log("provideLoginForm start");
    $('#result').html('<div style="height: 225px; overflow:hidden">' + getRemote(zeitman_url + "login.php", null) + '</div>')

    $('#result').find('input[value="Login"]').click(function(e) {
        console.log("provideLoginForm click");
        var typed_user = $('#result').find('input[name="username"]').val();
        var typed_pass = $('#result').find('input[name="passwort"]').val();

        data = {
            username: typed_user,
            passwort: typed_pass,
            login: 1
        };
        $("#iframe").contents().find("body").append(getRemote(zeitman_url + "login.php", data));
        already_Logged_In = true;
        getStuff();

    });

    fillCredentials();
    console.log("provideLoginForm ende");
}

function attach_select_change_event() {
    $('#result').find('select').change(function() {
        console.log(this);
        cur_name = $(this).attr("name");
        $("#iframe_hauptfenster").contents().find("body").find('select[name="' + cur_name + '"]').val($(this).val());
    });
};

function getStuff() {
    session_id = browser.storage.local.get('session_id');

    session_id.then((res) => {
        session_id = res.session_id;
        var cur_date = new Date();
        var remote_url = zeitman_url + "navigation.php?PHPSESSID=" + res.session_id + "&start=1&month="+(cur_date.getMonth()+1).toString()+"&year="+cur_date.getFullYear().toString();
        console.log(remote_url);
        var main = getRemote(remote_url, null)
        var frameteil1 = ""; // getRemote(zeitman_url + "frameteil1.php?nav=GZ_x&start=1&lizenzname=Zeiterfassung%A0HZDR&PHPSESSID=" + res.session_id + "&actday=", null)
        var frameteil2 = getRemote(zeitman_url + "frameteil2.php?nav=GZ_x&start=1&PHPSESSID=" + res.session_id + "&actday=", null)

        //now hasseling around cross site scripting
        $("#iframe").contents().find("body").append(main);
        $("#iframe_navigation").contents().find("body").append(frameteil1);
        $("#iframe_hauptfenster").contents().find("body").append(frameteil2);


        $('#result').html(" ");
        $('#result').append($("#iframe_hauptfenster").contents().find('tr[bgcolor="#C0C0FF"]').clone())
        $('#result').find('input').remove();
        $('#result').find("tr").removeAttr("bgcolor");
        $('#result').find("td").each(function() {
            $(this).removeAttr("height");
        })
        $('#result').find("td").last().html('<input id="save" type="submit" value="save">');


        attach_select_change_event();


        $('#save').click(function(e) {
            $("#iframe_hauptfenster").contents().find("body").find("form").attr("action", zeitman_url + "navigation.php").attr("target", "Hauptfenster")[0].submit();
            setTimeout(function(){ window.close(); },500)
            e.preventDefault();
        });



    });
}

$(document).ready(function() {
    console.log("document ready jquery");
    if (already_Logged_In == false) { //TODO doen'st work
        provideLoginForm();
    } else {
        getStuff();
    }
});

console.log("end_zeitman");
