    function sendGuess(playername, guessword) {
        
        var guess = {playername: guessword};
        $.ajax ({
            type: "POST",
            url: "guess",
            dataType: "text", 
            data: guess
        }).fail(function (response, textStatus, xhr) {
            console.log('Failed to send message: ' + new String(response) + ', ' + textStatus);
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

$(document).ready(function () {
    getGuesses('');
    var player = 'gunther';
    $("#arvaussyotto").keyup(function(event){
        if(event.keyCode == 13){
            sendGuess(player, $('#arvaussyotto').val());
	    $('#arvaussyotto').val("");
        }
    });
});
