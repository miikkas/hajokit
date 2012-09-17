$(document).ready(function () {

    function lahetaCanvas() {
        /*
         * Lähetä canvasin sisältö palvelimelle.
         */
        
        var canvas = document.getElementById('piirtocanvas');
        var image = canvas.toDataURL("image/png");
        //Sinänsä kai ei tarvi odottaa palvelimelta mitään, joten 
        //voisi käyttää jotain pelkkää postia esim.
        //muista id
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
