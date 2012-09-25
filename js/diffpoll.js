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
    $("#button").live("click", function(event){
        getDiff();
    });
    // Set a minute timeout for the requests to enable long polling.
    /*$.ajaxSetup({
           timeout: 1000*60
    });*/
});

function getDiff() {
    /*
     * Get a new path to be drawn from the server using long 
     * polling.
     */
    
    $.ajax ({
        type: "GET",
        url: "canvas/1/diff",
        dataType: "json"
    }).done(function (response) {
        drawDiff(response);
        getDiff();
    }).done(function (response, textStatus, xhr) {
        // Server responds with 304 status code, if there's 
        // nothing new to draw.
        if (xhr.status != 304) {
            drawDiff(response);
        }
        //getDiff();
    });
}

function drawDiff(json) {
    /*
     * Draw a path described in the diff on the canvas.
     */
    
    var path = new Path();
    var point, handleIn, handleOut;
    console.log(json);
    /*$.each(json, function(key,valueObj){
        console.log(json[i].model);
        /*path.strokeColor = json.color;
        path.strokeWidth = json.size;
        point = new Point(valueObj.pointx, valueObj.pointy);
        handleIn = new Point(valueObj.handleInx, valueObj.handleIny);
        handleOut = new Point(valueObj.handleOutx, valueObj.handleOuty);
        path.add(point, handleIn, handleOut);*/
    //});
    //view.draw();
}

function reDraw() {
    /*
     * Redraw the canvas to show any changes.
     */
    view.draw();
}