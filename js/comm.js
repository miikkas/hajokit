paper.install(window);
var drawView;

window.onload = function() {
    drawView = new View('drawcanvas');
    paper.setup('drawingcanvas');
};

function sendCanvas() {
    /*
     * Send canvas contents to server.
     */
    
    var canvas = document.getElementById('drawingcanvas');
    var image = canvas.toDataURL("image/png");
    //Not expecting anything meaningful back from the server.
    $.ajax ({
        type: "POST",
        url: "canvas/jokuid",
        dataType: "text", 
        data: 'image=' + image
    }).done(function (response) {
        //
    });
}
function getDiff(path) {
    /*
     * GET the latest path that was drawn from the server in JSON.
     */
    
    //Do something with the id.
    $.ajax ({
        type: "GET",
        url: "canvas/jokuid/",
        dataType: "json", 
    }).done(function (response) {
        drawDiff(response);
    });
}
function drawDiff(diff) {
    /*
     * Draw a path of segments in the given diff, 
     * with the given color and size.
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
     * Draw the canvas so that any new paths actually show up.
     */
    view.draw();
}
