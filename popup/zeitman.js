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
    //in store means should be shown, handling is done by options
    var username = browser.storage.local.get('username');
    var passwort = browser.storage.local.get('passwort');

    username.then((res) => {
        if(res.username) {
          $('input[name="username"]').val(res.username);
        }
    });

    passwort.then((res) => {
        if(res.passwort) {
          $('input[name="passwort"]').val(res.passwort);
        }
    });
}

function provideLoginForm() {
    console.log("provideLoginForm start");
    //var logout = getRemote(zeitman_url + "login.php?navigation.php?logout_end_x=beenden&nav_alle_mon=0", null)
    //var login = getRemote(zeitman_url + "login.php", null);

    $('#result').html('<div style="max-height: 225px; overflow:hidden">' + $('#login').html() + '</div>   <a style="cursor:pointer; float:right;" id="options"><small> Options </small> </a> <br> <a style="cursor:pointer; float:right;" id="debug"><small> Debug </small></a>')

    $('#result').find("#options").click(function(e){ browser.runtime.openOptionsPage(); e.preventDefault(); })
    $('#result').find("#debug").click(function(e){ $('.debug').toggle(); e.preventDefault(); })

    $('#result').find('input[value="Login"]').click(function(e) {
        console.log("provideLoginForm click");
        var typed_user = $('#result').find('input[name="username"]').val();
        var typed_pass = $('#result').find('input[name="passwort"]').val();

        var data = {
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
        session_id = ""; //for some reason never checked if empty
        var _result = $('#result'); //less dom, more perfomance
        var cur_date = new Date();

        //generate current month overview page url
        var remote_url = zeitman_url + "navigation.php?PHPSESSID=" + session_id + "&start=1&month=" + (cur_date.getMonth() + 1).toString() + "&year=" + cur_date.getFullYear().toString();
        //get current month overview page
        var main = getRemote(remote_url, null)
        console.log(main)
        //getting zeitman navigation is optional
        var frameteil1 = ""; //getRemote(zeitman_url + "frameteil1.php?nav=GZ_x&start=1&lizenzname=Zeiterfassung%A0HZDR&PHPSESSID=" + session_id + "&actday=", null)
        //getting bottom frame
        var frameteil2 = getRemote(zeitman_url + "frameteil2.php?nav=GZ_x&start=1&PHPSESSID=" + session_id + "&actday=", null)
        var month =  getRemote(zeitman_url + "frameteil2.php?nav=U_x&start=1&PHPSESSID=" + session_id + "&actday=", null);

        //now hasseling around cross site scripting by filling thre dummy frames
        $("#iframe").contents().find("body").append(main);
        console.log("bla",$("#iframe").contents().find("script"));

        //search for alerts like in issue #1 and show them in popup
        $("#iframe").contents().find("script").each(function(){
          var alert_pos= $(this)[0].innerText.indexOf("alert");
          if(alert_pos!=-1) { //there is an alert
            var alert_text= $(this)[0].innerText.substr(alert_pos+6, 9999); //cut to it
            alert_text= alert_text.substr(0,alert_text.indexOf(")")); //cut after it
            console.log("found alert:", $(this)[0].innerText);
            alert(alert_text); //give the alert to the user
          }


        });


        $("#iframe_navigation").contents().find("body").append(frameteil1);
        $("#iframe_hauptfenster").contents().find("body").append(frameteil2);

        //getting non class non id dom element from frame
        _result.html(" ").append($("#iframe_hauptfenster").contents().find('tr[bgcolor="#C0C0FF"]').clone())
        _result.find('input').remove();
        _result.find("tr").removeAttr("bgcolor");
        _result.find("td").each(function() {
            $(this).removeAttr("height");
        })

        //clone change event bahavior to cloned element
        attach_select_change_event();

        //add save button and add click event
        _result.find("td").last().html('<input id="save" type="submit" value="save">');

        $('#save').click(function(e) { //simply submits unerlying form
            $("#iframe_hauptfenster").contents().find("body").find("form").attr("action", zeitman_url + "navigation.php").attr("target", "Hauptfenster")[0].submit();
            setTimeout(function() {
                window.close();
            }, 500)
            e.preventDefault();
        });
}

$(document).ready(function() {
        provideLoginForm();
});

console.log("end_zeitman");
