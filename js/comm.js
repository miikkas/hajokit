function sendGuess(guessword) {
    var name = jQuery.data(document.body, 'playername');
    var canvasid = jQuery.data(document.body, 'canvasid');
    console.log('"' + name + '" is guessing ' + guessword);
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
            console.log('"' + name + '" guessed ' + guessword);
            //$('ul#chattiruutu').append("<li>"+name + ': ' + guessword+"</li>");
        }
    }).fail(function (response, textStatus, xhr) {
        $.each(response, function(key,valueObj){
            console.log(key + ', ' + valueObj);
        });
        //TO-DO: resend?
    });
}

function createPlayer(name) {
    $.ajax ({
        type: "GET",
        url: "player/create/" + $.trim(name),
        dataType: "text"
    }).done(function (response, textStatus, xhr) {
        if (xhr.status == 200) {
            jQuery.data(document.body, 'playername', $.trim(name) );
            console.log('Created player ' + name);
        }
    }).fail(function (response, textStatus, xhr) {
        $.each(response, function(key,valueObj){
            console.log(key + ', ' + valueObj);
            //$('ul#chattiruutu').append("<li>"+name + ': ' + guessword+"</li>");
        });
        //TO-DO: resend?
    });
}

function addGuesses(json) {
    var timestamp = 0;
    $.each(json, function(key,valueObj){
        //console.log(key + ', ' + valueObj);
        $('ul#chattiruutu').append("<li>" + valueObj.player + ': ' + valueObj.guess + "</li>");
    });
    return timestamp;
}

function getGuesses(timestamp) {
    var next_timestamp = timestamp;
    var canvasid = jQuery.data(document.body, 'canvasid');
    var url = "guesses/" + canvasid + "/" + timestamp;
    console.log(url);
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
                console.log(response);
                var jason = jQuery.parseJSON(response);
                next_timestamp = addGuesses(jason);
            }
            catch (e) {
                console.log('Error while getting the latest messages: ' + e);
            }
        }
        else {
            window.console.log(xhr.status + ' occurred while getting the latest messages.');
        }
    });
}

function guessPollInit() {
    if (typeof(jQuery.data(document.body, 'canvasid')) == 'undefined') {
        setTimeout('guessPollInit()', 1000);
    }
    else {
        getGuesses(0);
    }
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
    $('#arvaussyotto').val('Nimi tähän ja menoksi!');
    $('#arvaussyotto').focus(function (event) {
        if (typeof(jQuery.data(document.body, 'playername')) == 'undefined') {
            $('#arvaussyotto').val("");
        }
    });
    $('#arvaussyotto').focusout(function (event) {
        if (typeof(jQuery.data(document.body, 'playername')) == 'undefined') {
            $('#arvaussyotto').val("Nimi tähän ja menoksi!");
        }
    });
    $("#arvaussyotto").keyup(function(event){
        if(event.keyCode == 13){
            checkName();
            $('#arvaussyotto').val("");
        }
    });
    guessPollInit();
});
