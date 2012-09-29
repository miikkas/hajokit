/*
 * This file contains the tools for drawing on the canvas, as
 * well as functionality for sending drawings to the server.
 */

paper.install(window);
/*
 * Global variables so that they can be accessed via HTML.
 */

var pencil, line, rect, circle, eraser, fill;
var drawcolor = 'black';
var drawsize = 5;


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

function segmentsToObject(segments, closed) {
    /*
     * Turn the segments of a path into JSON objects.
     */
    
    var segObj = {};
    var i;
    for (i = 0; i < segments.length; i++) {
        segObj[i] = {
            pointx: segments[i].point.x, 
            pointy: segments[i].point.y, 
            handleInx: segments[i].handleIn.x, 
            handleIny: segments[i].handleIn.y, 
            handleOutx: segments[i].handleOut.x, 
            handleOuty: segments[i].handleOut.y
        };
    }
    console.log(segments.length);
    
    /*
     * For circles and rectangles. paper.js uses a "closed" 
     * property for them, effectively connecting the last 
     * and first point together. Once sent over the network, 
     * this doesn't happen on the receiving end, so we'll 
     * manually add one more segment from the last point 
     * to the first point.
     */
    if (closed) {
        segObj[segments.length] = {
            pointx: segments[0].point.x, 
            pointy: segments[0].point.y, 
            handleInx: segments[0].handleIn.x, 
            handleIny: segments[0].handleIn.y, 
            handleOutx: segments[0].handleOut.x, 
            handleOuty: segments[0].handleOut.y
        };
    }
    return segObj;
}

function pathToObject(pathtosend, color, size, closed) {
    /*
     * Turn the paper.js path into a JSON object, with color 
     * and size info with all the segments that the path includes.
     */
    
    var segObj = segmentsToObject(pathtosend.segments, closed);
    var diffObj = {
        color: color,
        size: size, 
        segments: segObj
    };
    return diffObj;
}

function sendDiff(drawnpath, color, size, closed) {
    /*
     * POST the path that was drawn to the server in JSON. Include
     * tool color and size.
     */
    
    console.log(drawnpath);
    var id = $.cookie('canvasid');
    if (!id) {
        var diff = JSON.stringify(pathToObject(drawnpath, color, size, closed));
        $.ajax ({
            type: "POST",
            url: "canvas/" + id + "/",
            dataType: "json", 
            data: diff
        }).fail(function (response, textStatus, xhr) {
            console.log('Failed to send path.');
            //TO-DO: resend?
        });
    }
}

function clearCanvas() {
    /*
     * Send a really big white line path that effectively 
     * blanks the canvas.
     * TO-DO: doesn't work, blanks the canvas of the player 
     * firing it, but everyone else's canvases remain.
     */
    
    var blankpath = new Path.Rectangle(new Point(0, 0), new Point(550, 600));
    blankpath.strokeColor = 'white';
    blankpath.fillColor = 'white';
    blankpath.strokeWidth = drawsize;
    sendDiff(blankpath, 'white', drawsize);
    var id = $.cookie('canvasid');
    $.ajax ({
        type: "GET",
        url: "canvas/" + id + "/clear"
    }).fail(function (response, textStatus, xhr) {
        console.log('Failed to notify server about clearing.');
        //TO-DO: resend?
    });
}

window.onload = function() {
    /*
     * Once the window has loaded, create tool instances 
     * for all the tools and set the canvas up. Use 
     * different path instances for the eraser and other 
     * tools (colors tend to screw up otherwise).
     */
    
    paper.setup('drawingcanvas');
    pencil = new Tool();
    line = new Tool();
    circle = new Tool();
    rect = new Tool();
    eraser = new Tool();
    var path, eraserpath, startingpoint, rad;

    $('#button').live("click", function (event) {
        //clearCanvas();
        alert($.cookie('canvasid') + ', ' + $.cookie('playername'));
    });

    // Igor, pencil!
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
        if (path.segments.length !== 0) {
            sendDiff(path, drawcolor, drawsize, false);
        }
    };
    
    // Line
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
            sendDiff(path, drawcolor, drawsize, false);
        }
    };

    // Circle
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
        // No point in sending zero-size circles.
        if (rad > 0) {
            sendDiff(path, drawcolor, drawsize, true);
        }
        rad = 0;
    };


    // Rectangle
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
        // No point in sending zero-size rects.
        if (startingpoint.getDistance(event.point, false) > 0) {
            sendDiff(path, drawcolor, drawsize, true);
        }
    };

    // Eraser. Like pencil, but always white.
    eraser.onMouseDown = function(event) {
        eraserpath = new Path();
        eraserpath.strokeWidth = drawsize;
        eraserpath.strokeColor = 'white';
    };
    eraser.onMouseDrag = function(event) {
        eraserpath.add(event.point);
    };
    eraser.onMouseUp = function(event) {
        eraserpath.simplify();
        if (eraserpath.segments.length !== 0) {
            sendDiff(path, 'white', drawsize, false);
        }
    };
};
