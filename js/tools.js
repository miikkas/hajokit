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

function segmentsToObject(segments) {
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
    return segObj;
}

function pathToObject(pathtosend, color, size) {
    /*
     * Turn the paper.js path into a JSON object, with color 
     * and size info with all the segments that the path includes.
     */
    
    var segObj = segmentsToObject(pathtosend.segments);
    var diffObj = {
        color: color,
        size: size, 
        segments: segObj
    };
    return diffObj;
}

function sendDiff(path, color, size) {
    /*
     * POST the path that was drawn to the server in JSON. Include
     * tool color and size.
     */
    
    var id = jQuery.data(document.body, 'canvasid');
    if (typeof(id) != 'undefined') {
        var diff = JSON.stringify(pathToObject(path, color, size));
        $.ajax ({
            type: "POST",
            url: "canvas/" + id + "/",
            dataType: "json", 
            data: diff
        }).fail(function (response, textStatus, xhr) {
            console.log('Vituixmän polun lähetys');
            //TO-DO: resend?
        });
    }
}

window.onload = function() {
    paper.setup('drawingcanvas');
    pencil = new Tool();
    line = new Tool();
    circle = new Tool();
    rect = new Tool();
    eraser = new Tool();
    var path, eraserpath, startingpoint, rad, oldstrokecolor;

    $('#button').live("click", function (event) {
        path = new Path();
        path.add(new Point(280, 0));
        path.add(new Point(280, 599));
        path.strokeColor = 'red';
        path.strokeWidth = 280;
        sendDiff(path, drawcolor, drawsize);
    });

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
        if (path.segments.length !== 0) {
            sendDiff(path, drawcolor, drawsize);
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
            sendDiff(path, drawcolor, drawsize);
        }
    };

    //Circle
    circle.onMouseDown = function(event) {
        startingpoint = event.point;
    };
    circle.onMouseDrag = function(event) {
        rad = startingpoint.getDistance(event.point, false);
        var path = new Path.Circle(startingpoint, rad);
        path.strokeColor = drawcolor;
        path.strokeWidth = drawsize;
        path.removeOnDrag();
    };
    circle.onMouseUp = function(event) {
        //No point in sending zero-size circles.
        if (rad > 0) {
            sendDiff(path, drawcolor, drawsize);
        }
        rad = 0;
    };


    //Rectangle
    rect.onMouseDown = function(event) {
        startingpoint = event.point;
    };
    rect.onMouseDrag = function(event) {
        var path = new Path.Rectangle(startingpoint, event.point);
        path.strokeColor = drawcolor;
        path.strokeWidth = drawsize;
        path.removeOnDrag();
    };
    rect.onMouseUp = function(event) {
        //No point in sending zero-size rects.
        if (startingpoint.getDistance(event.point, false) > 0) {
            sendDiff(path, drawcolor, drawsize);
        }
    };

    //Eraser. Like pencil, but always white.
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
            sendDiff(path, 'white', drawsize);
        }
        drawcolor = oldstrokecolor;
    };
};
