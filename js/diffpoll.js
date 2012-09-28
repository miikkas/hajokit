/*
 * This file contains functionality for getting small 
 * differential increments made by the person currently 
 * drawing, and then making those differentials visible 
 * on the client's canvas.
 */

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
            console.log(result_json);
            //Store the canvas id so that it can be used elsewhere.
            jQuery.data(document.body, 'canvasid', id);
        } catch (e) {
            window.console.log('Lord Inglip, I have failed to complete my task to acquire an ID for the game: ' + e);
        }
        getDiff(id, 0);
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
     */
    view.draw();
}

$(document).ready(function () {
    /*
     * When the document has loaded, set up the canvas and 
     * get the canvas id from the server.
     */
    paper.install(window);
    drawView = new View('piirtocanvas');
    paper.setup('piirtocanvas');
    getGameID();
});
