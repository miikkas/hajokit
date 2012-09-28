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
    };
    return diffObj;
}

function sendDiff(path) {
    /*
     * POST the path that was drawn to the server in JSON.
     */
    
    var id = jQuery.data(document.body, 'canvasid');
    if (typeof(id) != 'undefined') {
        var diff = JSON.stringify(pathToObject(path));
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
    var startingpoint, rad, oldstrokecolor;

    //Igor, pencil!
    pencil.onMouseDown = function(event) {
        var pencilpath = new Path();
        pencilpath.strokeColor = drawcolor;
        pencilpath.strokeWidth = drawsize;
    };
    pencil.onMouseDrag = function(event) {
        pencilpath.add(event.point);
    };
    pencil.onMouseUp = function(event) {
        pencilpath.simplify();
        if (pencilpath.segments.length !== 0) {
            sendDiff(pencilpath);
        }
    };
    
    //Line
    line.onMouseDown = function(event) {
        var linepath = new Path();
        linepath.strokeColor = drawcolor;
        linepath.strokeWidth = drawsize;
        if (linepath.segments.length === 0) {
            linepath.add(event.point);
        }
        linepath.add(event.point);
        startingpoint = event.point;
    };
    line.onMouseDrag = function(event) {
        linepath.lastSegment.point = event.point;
    };
    line.onMouseUp = function(event) {
        linepath.add(event.point);
        if (startingpoint.getDistance(event.point, false) > 0) {
            sendDiff(linepath);
        }
    };

    //Circle
    circle.onMouseDown = function(event) {
        startingpoint = event.point;
    };
    circle.onMouseDrag = function(event) {
        rad = startingpoint.getDistance(event.point, false);
        var circlepath = new Path.Circle(startingpoint, rad);
        circlepath.strokeColor = drawcolor;
        circlepath.strokeWidth = drawsize;
        circlepath.removeOnDrag();
    };
    circle.onMouseUp = function(event) {
        //No point in sending zero-size circles.
        if (rad > 0) {
            sendDiff(circlepath);
        }
        rad = 0;
    };


    //Rectangle
    rect.onMouseDown = function(event) {
        startingpoint = event.point;
    };
    rect.onMouseDrag = function(event) {
        var rectpath = new Path.Rectangle(startingpoint, event.point);
        rectpath.strokeColor = drawcolor;
        rectpath.strokeWidth = drawsize;
        rectpath.removeOnDrag();
    };
    rect.onMouseUp = function(event) {
        //No point in sending zero-size rects.
        if (startingpoint.getDistance(event.point, false) > 0) {
            sendDiff(rectpath);
        }
    };

    //Eraser. Like pencil, but always white.
    eraser.onMouseDown = function(event) {
        var eraserpath = new Path();
        eraserpath.strokeWidth = drawsize;
        eraserpath.strokeColor = 'white';
    };
    eraser.onMouseDrag = function(event) {
        eraserpath.add(event.point);
    };
    eraser.onMouseUp = function(event) {
        eraserpath.simplify();
        if (eraserpath.segments.length !== 0) {
            sendDiff(eraserpath);
        }
        drawcolor = oldstrokecolor;
    };
};
