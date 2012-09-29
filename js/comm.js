function sendGuess(guessword) {
    var name = jQuery.data(document.body, 'playername');
    var canvasid = jQuery.data(document.body, 'canvasid');
    var guess = JSON.stringify({
        "playername": name, 
        "guess": guessword,
        "canvas": canvasid
    });
    $.ajax ({
        type: "POST",
        url: "guess/",
        dataType: "text", 
        data: guess
    }).done(function (response, textStatus, xhr) {
        if (xhr.status == 200) {
            console.log('"' + name + '" arvasi ' + guessword);
            $('ul#chattiruutu').append("<li>"+name + ': ' + guessword+"</li>");
        }
    }).fail(function (response, textStatus, xhr) {
        console.log('Sending message failed with ' + xhr.ststua);
        //TO-DO: resend?
    });
}

function createPlayer(name) {
    $.ajax ({
        type: "GET",
        url: "player/create/" + name,
        dataType: "text"
    }).done(function (response, textStatus, xhr) {
        if (xhr.status == 200) {
            jQuery.data(document.body, 'playername', name);
            $('ul#chattiruutu').append("<li><i>"+name + " joinasi peliin.</i></li>");
            console.log('Created player ' + name);
        }
    }).fail(function (response, textStatus, xhr) {
        console.log('Failed to create a player: ' + xhr.ststua);
        //TO-DO: resend?
    });
}

function getGuesses(timestamp) {
    var next_timestamp = timestamp;
    var url = "guesses/" + timestamp;
    $.ajax ({
        type: "GET",
        url: url,
        dataType: "text",
        complete: function(){getGuesses(next_timestamp);},
        timeout: 60000
    }).done(function (response, textStatus, xhr) {
        // Server responds with 304 status code, if there's 
        // nothing new to draw.
        if (xhr.status == 200) {
            try {
                window.console.log(response);
                //var jason = jQuery.parseJSON(response);
                //next_timestamp = appendGuesses(jason);
            }
            catch (e) {
                window.console.log('Error while getting the latest messages: ' + e);
            }
        }
        else {
            window.console.log(xhr.status + ' occurred while getting the latest messages.');
        }
    });
}

function checkName() {
    if (typeof(jQuery.data(document.body, 'playername')) == 'undefined') {
        createPlayer($('#arvaussyotto').val());
    }
    else {
        sendGuess($('#arvaussyotto').val());
    }
}

$(document).ready(function () {
    getGuesses('');
    $('#arvaussyotto').val('Nimi tähän ja menoksi!');
    $('#arvaussyotto').live("click", function (event) {
        $('#arvaussyotto').val("");
    });
    $("#arvaussyotto").keyup(function(event){
        if(event.keyCode == 13){
            checkName();
            $('#arvaussyotto').val("");
        }
    });
});
