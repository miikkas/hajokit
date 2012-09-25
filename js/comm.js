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
});
