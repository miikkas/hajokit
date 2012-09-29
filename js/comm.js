function drawDiff(json) {
    /*
     * Draw a path described in the diff on the canvas.
     */
    
    var path = null,timestamp=0;
    var point, handleIn, handleOut;
    $.each(json, function(key,valueObj){
        /*
         * Parse path info if json contains game.path model
         */
        if (valueObj.model == "game.path" )
        {
         valueObj = valueObj.fields;
         if( timestamp != valueObj.epoch)
         {
            path = new Path();
            timestamp = valueObj.epoch;
         }
         path.strokeColor = valueObj.color;
         path.strokeWidth = valueObj.size;
         point = new Point(valueObj.pointx, valueObj.pointy);
         handleIn = new Point(valueObj.handleInx, valueObj.handleIny);
         handleOut = new Point(valueObj.handleOutx, valueObj.handleOuty);
         path.add(new Segment(point, handleIn, handleOut) );
        }
    });
    view.draw();
    return timestamp;
}

function getDiff(id,timestamp) {
    /*
     * Get a new path to be drawn from the server using long 
     * polling.
     */
    
    // Get a UNIX timestamp.
    var next_timestamp=timestamp;
    var url = "canvas/" + id + "/" + timestamp;
    $.ajax ({
        type: "GET",
        url: url,
        dataType: "text",
        complete: function(){getDiff(id,next_timestamp);},
        timeout: 60000
    }).done(function (response, textStatus, xhr) {
        // Server responds with 304 status code, if there's 
        // nothing new to draw.
        if (xhr.status == 200) {
            try {
                //window.console.log('new path yay');
                var jason = jQuery.parseJSON(response);
                next_timestamp = drawDiff(jason);
            }
            catch (e) {
                window.console.log('Error while getting the latest paths: ' + e);
            }
        }
        else {
            window.console.log(xhr.status + ' occurred while getting the latest paths.');
        }
    });
}

function getGameID() {
    /*
     * Get an ID for a game that will then be joined.
     */
    
    var id;
    //window.console.log('Getting ID for the game.');
    $.ajax ({
        type: "GET",
        url: "games/",
        dataType: "text"
    }).done(function (response, textStatus, xhr) {
        try {
            var result_json = jQuery.parseJSON(response);
            id = result_json[0].fields.canvas;
            //console.log(result_json);
            //Store the canvas id so that it can be used elsewhere.
            jQuery.data(document.body, 'canvasid', id);
        } catch (e) {
            window.console.log('Lord Inglip, I have failed to complete my task to acquire an ID for the game: ' + e);
        }
        getDiff(id, 0);
        getGuesses(0);
    });
}

function JSONize(string) {
    /*
     * Because JQuery seems really picky nowadays, do some 
     * hasty repairs to the given string (that by all accounts 
     * already is JSON), and return the results.
     */
    
    return jQuery.parseJSON('{"thing":' + string.replace(/\]\[/g, '],"thing":[') + '}');
}

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
            console.log('"' + name + '" arvasi ' + guessword);
            $('ul#chattiruutu').append("<li>"+name + ': ' + guessword+"</li>");
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
        });
        //TO-DO: resend?
    });
}

function addGuesses(json) {
    var timestamp = 0;
    $.each(json, function(key,valueObj){
        console.log(key + ', ' + valueObj);
    });
    return timestamp;
}

function getGuesses(timestamp) {
    var next_timestamp = timestamp;
    var canvasid = jQuery.data(document.body, 'canvasid');
    var url = "guesses/" + canvasid + "/" + timestamp;
    console.log('attemptgin to get guesses after ' + timestamp);
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

function checkName() {
    if (typeof(jQuery.data(document.body, 'playername')) == 'undefined') {
        createPlayer($('#arvaussyotto').val());
    }
    else {
        sendGuess($('#arvaussyotto').val());
    }
}

$(document).ready(function () {
    paper.install(window);
    drawView = new View('piirtocanvas');
    paper.setup('piirtocanvas');
    getGameID();
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
});
