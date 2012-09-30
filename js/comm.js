/*
 * This file contains functionality for sending and receiving 
 * messages.
 */

function checkIfPlayerExists(name) {
    /*
     * Check if the given name can be found from the server. 
     * If not, create a new player.
     */
    
    $.ajax ({
        type: "GET",
        url: "player/" + name,
        dataType: "text", 
        fail: function (response, textStatus, xhr) {
            console.log('wittu saatana');
            if (xhr.status == 404) {
                console.log('"' + name + '" was not found. Creating a new player.');
                //createPlayer(name);
            }
         }
    });
}

function sendGuess(guessword) {
    /*
     * Send the given word to the server. Include player ID 
     * and canvas ID.
     */
    
    var name = $.cookie('playername');
    var canvasid = $.cookie('canvasid');
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
        }
        else if (xhr.status == 404) {
            console.log('"' + name + '" was not found. Creating a new player.');
            createPlayer(name);
        }
    }).fail(function (response, textStatus, xhr) {
        // Log the error message from the server.
        $.each(response, function(key,valueObj){
            console.log(key + ', ' + valueObj);
        });
        //TO-DO: resend?
    });
}

function createPlayer(name) {
    /*
     * Send a request for creating a new player with the 
     * given name. If succesful, store the name in body 
     * data.
     */
    
    $.ajax ({
        type: "GET",
        url: "player/create/" + $.trim(name),
        dataType: "text"
    }).done(function (response, textStatus, xhr) {
        if (xhr.status == 200) {
            jQuery.data(document.body, 'playername', $.trim(name) );
            console.log('Created player ' + $.trim(name));
            $.cookie('playername', $.trim(name), { expires: 7 });
            $('.painikkeet').prepend($.trim(name));
        }
    }).fail(function (response, textStatus, xhr) {
        $.each(response, function(key,valueObj){
            console.log(key + ', ' + valueObj);
        });
        //TO-DO: resend?
    });
}

function addGuesses(json) {
    /*
     * Show the guesses and player names included in the 
     * response. Grab the latest timestamp.
     */
    
    var timestamp = 0;
    $.each(json, function(key,valueObj){
        $('ul#chattiruutu').append("<li>" + valueObj.player + ': ' + valueObj.guess + "</li>");
        timestamp = valueObj.timestamp;
    });
    return timestamp;
}

function getGuesses(timestamp) {
    /*
     * Retrieve guesses newer than the given timestamp. 
     * Include canvas ID into the request.
     */
    
    var next_timestamp = timestamp;
    var canvasid = $.cookie('canvasid');
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
    /*
     * Since the canvas ID is requested once already (in 
     * diffpoll.js), we won't request it again here. But 
     * guesses can't be requested without an ID, so wait 
     * until an ID is available.
     */
    
    if (!$.cookie('canvasid')) {
        setTimeout('guessPollInit()', 1000);
    }
    else {
        getGuesses(0);
    }
}

function checkName() {
    /*
     * If the player has not yet set a name for themselves, 
     * create a new player when Enter is hit in the text box. 
     * Otherwise, send a guess with the contents of the box.
     */
    
    if (!$.cookie('playername')) {
        createPlayer($('#arvaussyotto').val());
    }
    else {
        sendGuess($('#arvaussyotto').val());
    }
}

$(document).ready(function () {
    /*
     * First, set the contents of the text box to ask for a 
     * player name. If at that time the box is clicked, empty 
     * it. If it is unfocused at that point, restore the text 
     * asking for a name. In other cases, empty the box after 
     * Enter has been pressed, that is, when a message has 
     * been sent. Also initialize the requests for new 
     * messages.
     */
    
    if ($.cookie('playername') === null) {
        // If there is no cookie containing a player name, 
        // ask for one.
        console.log('playername was "' + $.cookie('playername') + '". Asking for a name.');
        $('#arvaussyotto').val('Nimi tähän ja menoksi!');
    }
    else {
        // Make the name visible.
        $('.painikkeet').prepend($.cookie('playername'));
    }
    $('#arvaussyotto').focus(function (event) {
        if ($.cookie('playername') === null) {
            $('#arvaussyotto').val("");
        }
    });
    $('#arvaussyotto').focusout(function (event) {
        if ($.cookie('playername') === null) {
            $('#arvaussyotto').val("Nimi tähän ja menoksi!");
        }
    });
    $("#arvaussyotto").keyup(function(event){
        if(event.keyCode == 13){
            checkName();
            $('#arvaussyotto').val("");
        }
    });
    checkIfPlayerExists($.cookie('playername'));
    guessPollInit();
});
