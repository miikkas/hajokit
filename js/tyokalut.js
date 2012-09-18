paper.install(window);
/*
 * Globaalit muuttujat, jotta niitä voi muokata html:stä käsin.
 */

var kyna, viiva, nelikulmio, ellipsi, kumi, taytto;
var piirtovari = 'black';
var piirtokoko = 5;

window.onload = function() {
    paper.setup('piirtocanvas');
    kyna = new Tool();
    viiva = new Tool();
    ympyra = new Tool();
    nelikulmio = new Tool();
    var polku;
    var alkuPiste;

    //Igor, kynä!
    kyna.onMouseDown = function(event) {
        polku = new Path();
        polku.strokeColor = piirtovari;
        polku.strokeWidth = piirtokoko;
    };
    kyna.onMouseDrag = function(event) {
        polku.add(event.point);
    };
    kyna.onMouseUp = function(event) {
        polku.simplify();
        if (polku.segments.length != 0) {
            lahetaPolku(polku);
        }
    };
    
    //Viiva
    viiva.onMouseDown = function(event) {
        polku = new Path();
        polku.strokeColor = piirtovari;
        polku.strokeWidth = piirtokoko;
        if (polku.segments.length === 0) {
            polku.add(event.point);
        }
        polku.add(event.point);
    };
    viiva.onMouseDrag = function(event) {
        polku.lastSegment.point = event.point;
    };
    viiva.onMouseUp = function(event) {
        polku.add(event.point);
        if (alkuPiste.getDistance(event.point, false) > 0) {
            lahetaPolku(polku);
        }
    };

    //Ympyrä
    ympyra.onMouseDown = function(event) {
        alkuPiste = event.point;
    };
    ympyra.onMouseDrag = function(event) {
        var rad = alkuPiste.getDistance(event.point, false);
        polku = new Path.Circle(alkuPiste, rad);
        polku.strokeColor = piirtovari;
        polku.strokeWidth = piirtokoko;
        polku.removeOnDrag();
    };
    ympyra.onMouseUp = function(event) {
        if (rad > 0) {
            lahetaPolku(polku);
        }
        rad = 0;
    };


    //Nelikulmio
    nelikulmio.onMouseDown = function(event) {
        alkuPiste = event.point;
    };
    nelikulmio.onMouseDrag = function(event) {
        polku = new Path.Rectangle(alkuPiste, event.point);
        polku.strokeColor = piirtovari;
        polku.strokeWidth = piirtokoko;
        polku.removeOnDrag();
    };
    nelikulmio.onMouseUp = function(event) {
        if (alkuPiste.getDistance(event.point, false) > 0) {
            lahetaPolku(polku);
        }
    };
};

function muutaVaria(vari) {
    /*
     * Vaihda kalun väriä colorin mukaiseksi.
     */
    piirtovari = vari;
}

function muutaKokoa(koko) {
    piirtokoko = koko;
}

function lahetaPolku(polku) {
    $.ajax ({
        type: "POST",
        url: "canvas/jokuid/",
        dataType: "text", 
        data: polku.segments
    }).done(function (response) {
        //do something
    });
}