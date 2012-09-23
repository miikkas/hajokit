$(document).ready(function () {
    var player = 'gunther';
    $("#guessbox").keyup(function(event){
        if(event.keyCode == 13){
            sendGuess(player, $('#guessbox').val());
        }
    });
    var canvaso = document.getElementById('drawingcanvas');
    nakyma = new View('drawingcanvas');
    var image;
    contexto = canvaso.getContext('2d');
    $("#button").live("click", function(event){
        sendCanvas();
        //alert('vitun vittu');
    });
    function sendGuess(playername, guessword) {
        
        var guess = {playername: guessword};
        $.ajax ({
            type: "POST",
            url: "guess",
            dataType: json, 
            data: guess
        }).done(function (response) {
            //Add guess to a list showing all guesses so far
            /*if (guess was correct) {
                say hurray, end game
            }*/
        });
    }
    function sendCanvas() {
        /*
         * Send canvas contents to server.
         */
        var canvas = document.getElementById('drawingcanvas');
        var image = canvas.toDataURL("image/png");
        var data = [{"pk": 1, "model": "game.piirros", "fields": {"aikaleima": "2012-09-23T16:45:19.388Z", "tilanne": image}}]
        //Not expecting anything meaningful back from the server.
        $.ajax ({
            type: "POST",
            url: "canvas/1",
            data: image
        }).done(function (response) {
            alert('yay: ' + response);
        });
    }
});
