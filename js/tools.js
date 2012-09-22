paper.install(window);
/*
 * Global variables so that they can be accessed via HTML.
 */

var pencil, line, rect, circle, eraser, fill;
var drawcolor = 'black';
var drawsize = 5;

window.onload = function() {
    paper.setup('drawingcanvas');
    pencil = new Tool();
    line = new Tool();
    ympyra = new Tool();
    rect = new Tool();
    var path;
    var startingpoint;

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
            sendPath(path);
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
    };
    line.onMouseDrag = function(event) {
        path.lastSegment.point = event.point;
    };
    line.onMouseUp = function(event) {
        path.add(event.point);
        if (startingpoint.getDistance(event.point, false) > 0) {
            sendPath(path);
        }
    };

    //Circle
    ympyra.onMouseDown = function(event) {
        startingpoint = event.point;
    };
    ympyra.onMouseDrag = function(event) {
        var rad = startingpoint.getDistance(event.point, false);
        path = new Path.Circle(startingpoint, rad);
        path.strokeColor = drawcolor;
        path.strokeWidth = drawsize;
        path.removeOnDrag();
    };
    ympyra.onMouseUp = function(event) {
        if (rad > 0) {
            sendPath(path);
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
            sendPath(path);
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

function sendPath(path) {
    $.ajax ({
        type: "POST",
        url: "canvas/jokuid/",
        dataType: "text", 
        data: path.segments
    }).done(function (response) {
        //do something
    });
}