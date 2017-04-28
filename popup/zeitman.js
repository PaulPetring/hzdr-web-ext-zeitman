console.log("begin_zeitman");

var session_id = null;
var already_Logged_In = false;
var zeitman_url = "https://zeitweb.hzdr.de/scripts_zeitm/"
var cur_date = new Date();

//global time selectors
var _result = $("#result");
var _additional_result = $("#additional_result");
var tf_vonSS = [];
var tf_vonMM = [];
var tf_bisSS = [];
var tf_bisMM = [];
var kum = {}
kum.hours = 0;
kum.minutes = 0;
kum._hours = 0;
kum._minutes = 0;
kum.in_minutes = 0;
kum.add = function (hours,minutes) {
  kum.in_minutes = ( (60 * parseInt(kum._hours,10)) + parseInt(kum._minutes));
  console.log("kum.in_minutes",kum.in_minutes);
  kum.in_minutes += ( (60*hours) +minutes);
  kum.hours = Math.floor(kum.in_minutes / 60);
  kum.minutes = kum.in_minutes - (60 * kum.hours);
  console.log("kum",kum)
}

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
        if (res.username) {
            $('input[name="username"]').val(res.username);
        }
    });

    passwort.then((res) => {
        if (res.passwort) {
            $('input[name="passwort"]').val(res.passwort);
        }
    });
}

function provideLoginForm() {
    console.log("provideLoginForm start");
    //var logout = getRemote(zeitman_url + "login.php?navigation.php?logout_end_x=beenden&nav_alle_mon=0", null)
    //var login = getRemote(zeitman_url + "login.php", null);

    _result.html('<div style="max-height: 225px; overflow:hidden">' + $('#login').html() + '</div>   <a style="cursor:pointer; float:right;" id="options"><small> Options </small> </a> <br> <a style="cursor:pointer; float:right;" id="debug"><small> Debug </small></a>');
    _result.find("#options").click(function(e) {
        browser.runtime.openOptionsPage();
        e.preventDefault();
    })
    _result.find("#debug").click(function(e) {
        $('.debug').toggle();
        e.preventDefault();
    })
    _result.find('input[value="Login"]').click(function(e) {
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

function getTimeSelectors() {
    console.log("getTimeSelectors");
    _result = $('#result');
    tf_vonSS = _result.find('select[name^=tf_vonSS]');
    tf_vonMM = _result.find('select[name^=tf_vonMM]');
    tf_bisSS = _result.find('select[name^=tf_bisSS]');
    tf_bisMM = _result.find('select[name^=tf_bisMM]');
}

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function showCalculatedWorktime() { // gives user feedback about current set work time
    console.log("showCalculatedWorktime");
    if (tf_vonSS.length > 0) {
        var start_date = new Date();
        start_date.setMinutes(tf_vonMM.val());
        start_date.setHours(tf_vonSS.val());
        var end_date = new Date()
        end_date.setMinutes(tf_bisMM.val());
        end_date.setHours(tf_bisSS.val());

        var regular_work_end_date = new Date();
        regular_work_end_date.setTime(start_date.getTime() + (1000 * 60 * (7 * 60 + 48 + 30))); //regular work time is 7 hours 48 minutes + 30 minutes break

        var kum_diff = end_date.getTime() - regular_work_end_date.getTime();

        if( regular_work_end_date.getTime() >= end_date.getTime() )  {
          var kum_diff = regular_work_end_date.getTime() - end_date.getTime();
        }


        var kum_diff_hours = Math.floor(kum_diff / (1000 * 60 * 60));
        kum_diff -= kum_diff_hours * (1000 * 60 * 60);

        var kum_diff_mins = Math.floor(kum_diff / (1000 * 60));
        kum_diff -= kum_diff_mins * (1000 * 60);

        if( regular_work_end_date.getTime() >= end_date.getTime() )  {
          kum.add(0-parseInt(kum_diff_hours,10),0-parseInt(kum_diff_mins,10));
        } else {
          kum.add(parseInt(kum_diff_hours,10),parseInt(kum_diff_mins,10));
        }


        var diff = end_date.getTime() - start_date.getTime(); //in miliseconds

        if (diff > 1000 * 60 * 60 * 9) { // longer than 9 hours
            diff = diff - 1000 * 60 * 15; //discount 15minutes
        }

        if (diff > 1000 * 60 * 60 * 6) { // still longer than 6 hours
            diff = diff - 1000 * 60 * 30; //discount 30 minutes
        }

        var hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * (1000 * 60 * 60);

        var mins = Math.floor(diff / (1000 * 60));
        diff -= mins * (1000 * 60);

        _additional_result.html("<strong>" + pad(start_date.getHours(), 2) + ":" + pad(start_date.getMinutes(), 2) + " - " + pad(end_date.getHours(), 2) + ":" + pad(end_date.getMinutes(), 2) + ": </strong> " + pad(hours,2) + "h" + pad(mins,2) + "min of 7h48min");
        _additional_result.append(" <strong>diff time:</strong> " +  kum_diff_hours  + "h" +  kum_diff_mins + "min ");
        _additional_result.append(" <strong>regular work end time:</strong> " + pad(regular_work_end_date.getHours(), 2) + ":" + pad(regular_work_end_date.getMinutes(), 2));
        _additional_result.append("<br> <strong>current time account:</strong> \t" + kum._hours + "h" + kum._minutes + "min ");
        _additional_result.append(" <strong> predicted time account:</strong> \t" + kum.hours + "h" + kum.minutes + "min ");
    } else {
        $("#additional_result").html("no hour calculation possible");
    }
}

function preset_times() { //sets starting or end time to the current rounded date

    //leave if there are no select boxes available
    if (tf_vonMM.length == 0 || tf_vonMM.length == 0 || tf_vonMM.length == 0 || tf_vonMM.length == 0) {
        return;
    }
    //round date to 5 minute instances
    var coeff = 1000 * 60 * 5;
    var rounded_date = new Date(Math.round(cur_date.getTime() / coeff) * coeff)

    //set end date if start date is set
    if (tf_vonSS.val() != 0 && tf_bisMM.val() == 0 && tf_bisSS.val() == 0) {
        tf_bisMM.find('option[value="' + rounded_date.getMinutes() + '"]').attr('selected', true).addClass("changed").trigger("change");
        tf_bisMM.addClass("changed").attr("title", "suggested current time by the plugin");
        tf_bisSS.find('option[value="' + rounded_date.getHours() + '"]').attr('selected', true).addClass("changed").trigger("change");
        tf_bisSS.addClass("changed").attr("title", "suggested current time  by the plugin");
    }

    // set start date if empty
    if (tf_vonMM.val() == 0 && tf_vonSS.val() == 0) {
        tf_vonMM.find('option[value="' + rounded_date.getMinutes() + '"]').attr('selected', true).addClass("changed").trigger("change");
        tf_vonMM.addClass("changed").attr("title", "suggested current time by the plugin");
        tf_vonSS.find('option[value="' + rounded_date.getHours() + '"]').attr('selected', true).addClass("changed").trigger("change");
        tf_vonSS.addClass("changed").attr("title", "suggested current time by the plugin");
    }
}

function attach_select_change_event() { //sets the select boxes in the iframe if the result boxes are changed
    _result.find('select').change(function() {
        $("#iframe_hauptfenster").contents().find("body").find('select[name="' + $(this).attr("name") + '"]').val($(this).val());
        showCalculatedWorktime();
    });
};

function getStuff() {
    session_id = ""; //for some reason never checked if empty
    _result = $('#result'); //less dom, more perfomance

    //generate current month overview page url
    var remote_url = zeitman_url + "navigation.php?PHPSESSID=" + session_id + "&start=1&month=" + (cur_date.getMonth() + 1).toString() + "&year=" + cur_date.getFullYear().toString();
    //get current month overview page
    var main = getRemote(remote_url, null)
    //getting zeitman navigation is optional
    var frameteil1 = ""; //getRemote(zeitman_url + "frameteil1.php?nav=GZ_x&start=1&lizenzname=Zeiterfassung%A0HZDR&PHPSESSID=" + session_id + "&actday=", null)
    //getting bottom frame
    var frameteil2 = getRemote(zeitman_url + "frameteil2.php?nav=GZ_x&start=1&PHPSESSID=" + session_id + "&actday=", null)
    var month = getRemote(zeitman_url + "frameteil2.php?nav=U_x&start=1&PHPSESSID=" + session_id + "&actday=", null);

    //now hasseling around cross site scripting by filling thre dummy frames
    $("#iframe").contents().find("body").append(main);


    console.log("bla", $("#iframe").contents().find("script"));

    //search for alerts like in issue #1 and show them in popup
    $("#iframe").contents().find("script").each(function() {
        var alert_pos = $(this)[0].innerText.indexOf("alert");
        if (alert_pos != -1) { //there is an alert
            var alert_text = $(this)[0].innerText.substr(alert_pos + 6, 9999); //cut to it
            alert_text = alert_text.substr(0, alert_text.indexOf(")")); //cut after it
            console.log("found alert:", $(this)[0].innerText);
            $('#alerts').html(unescape(alert_text) + '<a href="#"> goto Zeitman </a>'); //give the alert to the user
            $('#alerts a').click(function(){browser.tabs.create({ "url": "https://zeitweb.hzdr.de/scripts_zeitm/login.php" }); })

        }
    });


    $("#iframe_navigation").contents().find("body").append(frameteil1);
    $("#iframe_hauptfenster").contents().find("body").append(frameteil2);
    $("#iframe_month").contents().find("body").append(month);

    //holy moly use ids
    var kum_raw = $("#iframe_month").contents().find('tr[bgcolor="#EEEEEE"]').last().find("td")[8].innerText;
    kum._hours = kum_raw.substr(0,kum_raw.indexOf(":"));
    kum.hours = kum._hours
    kum._minutes = kum_raw.substr(kum_raw.indexOf(":") + 1, 99);
    kum.minutes = kum._minutes

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
    //_result.append('<small style="font-size:11px;float: right;">kum: ' + kum + '</small>');

    getTimeSelectors();
    preset_times();
    showCalculatedWorktime();

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
    $('form').each(function() {
        $(this).find('input').keypress(function(e) {
            // Enter pressed?
            if (e.which == 10 || e.which == 13) {
                $(this).find('input[type="submit"]').trigger();
            }
        });
    });
});

console.log("end_zeitman");
