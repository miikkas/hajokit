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
    getDiff();
    //Set a minute timeout for the requests to enable long polling.
    $.ajaxSetup({
           timeout: 1000*60
    });
});

function getDiff() {
    /*
     * Get a new path to be drawn from the server using long 
     * polling.
     */
    
    $.ajax ({
        type: "GET",
        url: "../test.php",
        //url: "canvas/id/diff",
        dataType: "json"
    }).done(function (response) {
        drawDiff(response);
        getDiff();
    });
}

function drawDiff(diff) {
    /*
     * Draw a path described in the diff on the canvas.
     */
    
    var path = new Path();
    var point, handleIn, handleOut;
    path.strokeColor = diff.color;
    path.strokeWidth = diff.size;
    $.each(diff.segments, function(key,valueObj){
        point = new Point(valueObj.pointx, valueObj.pointy);
        handleIn = new Point(valueObj.handleInx, valueObj.handleIny);
        handleOut = new Point(valueObj.handleOutx, valueObj.handleOuty);
        path.add(point, handleIn, handleOut);
    });
    view.draw();
}

function reDraw() {
    /*
     * Redraw the canvas to show any changes.
     */
    view.draw();
}