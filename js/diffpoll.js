/*
 * This file contains functionality for getting small 
 * differential increments made by other players on the 
 * canvas, as well as getting an ID for a game or creating 
 * a new one.
 */

function drawDiff(json) {
    /*
     * Draw a path on the canvas as described in the received 
     * diff.
     */
    
    var path = null,timestamp=0;
    var point, handleIn, handleOut;
    $.each(json, function(key,valueObj){
        /*
         * Parse path info if json contains game.path model
         */
        if (valueObj.model == "game.path" ) {
            valueObj = valueObj.fields;
            if( timestamp != valueObj.epoch) {
                path = new Path();
                //Grab the new timestamp to be used.
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

function getDiff(id, timestamp) {
    /*
     * Get a new path to be drawn from the server using long 
     * polling.
     */
    
    var next_timestamp = timestamp;
    var url = "canvas/" + id + "/" + timestamp;
    $.ajax ({
        type: "GET",
        url: url,
        dataType: "text",
        complete: function(){getDiff(id, next_timestamp);},
        timeout: 60000
    }).done(function (response, textStatus, xhr) {
        // Server responds with 304 status code, if there's 
        // nothing new to draw.
        if (xhr.status == 200) {
            try {
                var jason = jQuery.parseJSON(response);
                next_timestamp = drawDiff(jason);
                getDiff(id, next_timestamp);
            }
            catch (e) {
                console.log('Error while getting the latest paths: ' + e);
            }
        }
        else {
            console.log(xhr.status + ' occurred while getting the latest paths.');
        }
    view.draw();
    });
}

function newGame() {
    /*
     * Create a new game and store the ID for it.
     */
    
    var id;
    $.ajax ({
        type: "GET",
        url: "games/new",
        dataType: "text"
    }).done(function (response, textStatus, xhr) {
        try {
            var result_json = jQuery.parseJSON(response);
            id = result_json[0].pk;
            // Store the canvas id so that it can be used elsewhere.
            $.cookie('canvasid', id, { expires: 7 });
            console.log('Created a new goddamn game with canvas id ' + $.cookie('canvasid'));
        } catch (e) {
            console.log('Failed to find a game, attempting again.');
        }
        //getDiff(id, 0);
    }).fail(function (xhr, textStatus, error) {
        // Try again if creating a game failed.
        newGame();
    });
}

function getGameID() {
    /*
     * Get an ID for a game that will then be joined.
     */
    
    var id;
    $.ajax ({
        type: "GET",
        url: "games/",
        dataType: "text"
    }).done(function (response, textStatus, xhr) {
        try {
            var result_json = jQuery.parseJSON(response);
            id = result_json[0].fields.canvas;
            // Store the canvas id into a cookie so that it 
            // can be used elsewhere.
            $.cookie('canvasid', id, { expires: 7 });
        } catch (e) {
            console.log('Failed to find a game, creating a new one.');
            newGame();
        }
        getDiff(id, 0);
    }).fail(function (xhr, textStatus, error) {
        // If there were no ID's, create a new game.
        newGame();
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

function reDraw() {
    /*
     * Redraw the canvas to show any changes.
     * TO-DO: needed anymore?
     */
    view.draw();
}

function checkForGames() {
    /*
     * Check if there is a cookie containing a canvas ID. 
     * If not, try to get an ID from the server.
     */
    
    if ($.cookie('canvasid') !== true) {
        getGameID();
    }
}

$(document).ready(function () {
    /*
     * When the document has loaded, set up the canvas and 
     * get the canvas id from the server.
     */
    
    checkForGames();
    paper.install(window);
    drawView = new View('piirtocanvas');
    paper.setup('piirtocanvas');
});
