/*
 * This file contains functionality for getting small 
 * differential increments made by the person currently 
 * drawing, and then making those differentials visible 
 * on the client's canvas.
 */

$(document).ready(function () {
    paper.install(window);
    drawView = new View('piirtocanvas');
    paper.setup('piirtocanvas');
    //var id = getGameID();
    // Initially get all diffs, then start long polling for 
    // new diffs.
    getDiff("1",0);
});

function getGameID() {
    /*
     * Get an ID for a game that will then be joined.
     */
    
    //TO-DO: functionality
}

function getAllDiffs(id) {
    /*
     * Get a new path to be drawn from the server using long 
     * polling.
     */
    
    window.console.log('Getting all the paths');
    var url = "canvas/" + id + "/";
    $.ajax ({
        type: "GET",
        url: url,
        dataType: "text", 
        complete: function(){getDiff(id);}, 
        timeout: 10000
    }).done(function (response, textStatus, xhr) {
        // Server responds with 304 status code, if there's 
        // nothing new to draw.
        if (xhr.status == 200) {
            try {
                var jason = jQuery.parseJSON(response);
                window.console.log('Got all the paths');
                drawDiff(jason);
            }
            catch (e) {
                window.console.log('Error while getting all the paths: ' + e);
            }
        }
        else {
            window.console.log(xhr.status + ' occurred while getting all the paths.');
        }
        window.console.log('Gon start polling now.');
    });
    //getDiff();
}

function getDiff(id,timestamp) {
    /*
     * Get a new path to be drawn from the server using long 
     * polling.
     */
    
    // Get a UNIX timestamp.
    var next_timestamp=timestamp
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
                window.console.log('Received the latest paths from server');
                var jason = jQuery.parseJSON(response);
                next_timestamp = drawDiff(jason);
                window.console.log("timestamp:"+ next_timestamp);
            }
            catch (e) {
                window.console.log('Error while getting the latest paths: ' + e);
            }
        }
        else {
            window.console.log(xhr.status + ' occurred while getting the latest paths.');
        }
        window.console.log('Gon poll again soon.');
    });
    //getDiff();
}

function drawDiff(json) {
    /*
     * Draw a path described in the diff on the canvas.
     */
    
    window.console.log('Attempting to draw stuff');
    var path = null,timestamp=0;
    var point, handleIn, handleOut;
    //console.log(json)
    $.each(json, function(key,valueObj){
        //console.log(key + ', ' + valueObj.pk);
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
    window.console.log('Managed to draw stuff');
    view.draw();
    return timestamp;
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
    window.console.log('Redraw!');
    view.draw();
}
