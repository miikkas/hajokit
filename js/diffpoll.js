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
    // Initially get all diffs, then start long polling for 
    // new diffs.
    getAllDiffs();
});

function getAllDiffs() {
    /*
     * Get a new path to be drawn from the server using long 
     * polling.
     */
    
    $.ajax ({
        type: "GET",
        url: "canvas/1/",
        dataType: "text"
    }).done(function (response, textStatus, xhr) {
        // Server responds with 304 status code, if there's 
        // nothing new to draw.
        if (xhr.status == 200) {
            try {
                var jason = jQuery.parseJSON(response);
                drawDiff(jason);
            }
            catch (e) {
                window.console.log('error: ' + e);
            }
        }
        else {
            window.console.log(xhr.status + ' occurred.');
        }
        setTimeout('getDiff()', 5000);
    });
}

function getDiff() {
    /*
     * Get a new path to be drawn from the server using long 
     * polling.
     */
    
    // Get a UNIX timestamp.
    var timestamp = Math.round((new Date()).getTime() / 1000);
    var url = "canvas/1/" + timestamp;
    $.ajax ({
        type: "GET",
        url: url,
        dataType: "text"
    }).done(function (response, textStatus, xhr) {
        // Server responds with 304 status code, if there's 
        // nothing new to draw.
        if (xhr.status == 200) {
            try {
                window.console.log('received paths from server');
                var jason = jQuery.parseJSON(response);
                drawDiff(jason);
            }
            catch (e) {
                window.console.log('error: ' + e);
            }
        }
        else {
            window.console.log(xhr.status + ' occurred.');
        }
        setTimeout('getDiff()', 5000);
    });
}

function drawDiff(json) {
    /*
     * Draw a path described in the diff on the canvas.
     */
    
    window.console.log('attempting to draw stuff');
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
         if( timestamp != valueObj.aikaleima )
         {
            path = new Path();
            timestamp = valueObj.aikaleima;
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
