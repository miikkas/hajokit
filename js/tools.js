paper.install(window);
/*
 * Global variables so that they can be accessed via HTML.
 */

var pencil, line, rect, circle, eraser, fill;
var drawcolor = 'black';
var drawsize = 5;
var gameid = '-1';

window.onload = function() {
    $("#button").live("click", function(event){
        alert(gameid);
    });
    getGameID();
    paper.setup('drawingcanvas');
    pencil = new Tool();
    line = new Tool();
    circle = new Tool();
    rect = new Tool();
    eraser = new Tool();
    var path, startingpoint, rad;

    //Igor, pencil!
    pencil.onMouseDown = function(event) {
        path = new Path();
        path.strokeColor = drawcolor;
        path.strokeWidth = drawsize;
    };
    pencil.onMouseDrag = function(event) {
        path.add(event.point);
    };
    pencil.onMouseUp = function(event) {
        path.simplify();
        if (path.segments.length != 0) {
            sendDiff(path);
        }
    };
    
    //Line
    line.onMouseDown = function(event) {
        path = new Path();
        path.strokeColor = drawcolor;
        path.strokeWidth = drawsize;
        if (path.segments.length === 0) {
            path.add(event.point);
        }
        path.add(event.point);
        startingpoint = event.point;
    };
    line.onMouseDrag = function(event) {
        path.lastSegment.point = event.point;
    };
    line.onMouseUp = function(event) {
        path.add(event.point);
        if (startingpoint.getDistance(event.point, false) > 0) {
            sendDiff(path);
        }
    };

    //Circle
    circle.onMouseDown = function(event) {
        startingpoint = event.point;
    };
    circle.onMouseDrag = function(event) {
        rad = startingpoint.getDistance(event.point, false);
        path = new Path.Circle(startingpoint, rad);
        path.strokeColor = drawcolor;
        path.strokeWidth = drawsize;
        path.removeOnDrag();
    };
    circle.onMouseUp = function(event) {
        if (rad > 0) {
            sendDiff(path);
        }
        rad = 0;
    };


    //Rectangle
    rect.onMouseDown = function(event) {
        startingpoint = event.point;
    };
    rect.onMouseDrag = function(event) {
        path = new Path.Rectangle(startingpoint, event.point);
        path.strokeColor = drawcolor;
        path.strokeWidth = drawsize;
        path.removeOnDrag();
    };
    rect.onMouseUp = function(event) {
        if (startingpoint.getDistance(event.point, false) > 0) {
            sendDiff(path);
        }
    };

    //Eraser. Like pencil, but always white.
    eraser.onMouseDown = function(event) {
        path = new Path();
        path.strokeColor = 'white';
        path.strokeWidth = drawsize;
    };
    eraser.onMouseDrag = function(event) {
        path.add(event.point);
    };
    eraser.onMouseUp = function(event) {
        path.simplify();
        if (path.segments.length != 0) {
            sendDiff(path);
        }
    };
};

function changeColor(color) {
    /*
     * Change the color of the tool.
     */
    drawcolor = color;
}

function changeSize(size) {
    /*
     * Change the size of the tool.
     */
    drawsize = size;
}

function pathToObject(path) {
    /*
     * Turn the paper.js path into a JSON object, with color 
     * and size info with all the segments that the path includes.
     */
    
    var segObj = segmentsToObject(path.segments);
    var diffObj = {
        color: drawcolor,
        size: drawsize, 
        segments: segObj
    }
    return diffObj;
}

function segmentsToObject(segments) {
    /*
     * Turn the segments of a path into JSON objects.
     */
    
    var segObj = {};
    for (var i = 0; i < segments.length; i++) {
        segObj[i] = {
            pointx: segments[i].point.x, 
            pointy: segments[i].point.y, 
            handleInx: segments[i].handleIn.x, 
            handleIny: segments[i].handleIn.y, 
            handleOutx: segments[i].handleOut.x, 
            handleOuty: segments[i].handleOut.y
        }
    }
    return segObj;
}

function sendDiff(path) {
    /*
     * POST the path that was drawn to the server in JSON.
     */
    
        var diff = JSON.stringify(pathToObject(path));
        $.ajax ({
            type: "POST",
            url: "canvas/1/",
            //url: "canvas/" + gameid + "/",
            dataType: "json", 
            data: diff
        }).done(function (response, textStatus, xhr) {
            if (xhr.status == 200) {
                console.log('A path was succesfully sent.');
            }
            else {
                console.log('Failed to send path.');
            }
        }).fail(function (response, textStatus, xhr) {
            console.log('Vituixmän polun lähetys: ' + xhr.status + ', ' + textStatus);
        });
}

function getGameID() {
    /*
     * Get an ID for a game that will then be joined.
     */
    
    window.console.log('Getting ID for the game.');
    var id;
    $.ajax ({
        type: "GET",
        url: "games/",
        dataType: "text"
    }).success(function (response, textStatus, xhr) {
        window.console.log(response);
        try {
            id = jQuery.parseJSON(response)[0].fields.canvas;
            setGameID(id);
        } catch (e) {
            window.console.log('Lord Inglip, I have failed to complete my task to acquire an ID for the game.');
        }
        window.console.log('Got ID ' + id);
    });
}

function setGameID(id) {
    gameid = id;
}