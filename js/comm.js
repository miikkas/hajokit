$(document).ready(function () {

    function lahetaCanvas() {
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
});
