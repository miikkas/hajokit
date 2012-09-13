paper.install(window);
/*
 * Globaalit muuttujat, jotta niitä voi muokata html:stä käsin.
 */

var kyna, viiva, nelikulmio, ellipsi, kumi, taytto;
var vari = 'black';

window.onload = function() {
    paper.setup('piirtocanvas');
    var path;

    //Igor, kynä!
    kyna = new Tool();
    kyna.onMouseDown = function(event) {
        path = new Path();
        path.strokeColor = vari;
    }
    kyna.onMouseDrag = function(event) {
        path.add(event.point);
    }
    kyna.onMouseUp = function(event) {
        path.simplify();
    }
    
    //Viiva
    viiva = new Tool();
    viiva.onMouseDown = function(event) {
        path = new Path();
        path.strokeColor = vari;
        if (path.segments.length == 0) {
            path.add(event.point);
        }
        path.add(event.point);
    }
    viiva.onMouseDrag = function(event) {
        path.lastSegment.point = event.point;
    }
    viiva.onMouseUp = function(event) {
        path.add(event.point);
    }

    //Ympyrä
    ympyra = new Tool();
    var startPoint;
    ympyra.onMouseDown = function(event) {
        startPoint = event.point;
    }
    ympyra.onMouseDrag = function(event) {
        var rad = startPoint.getDistance(event.point, false);
        path = new Path.Circle(startPoint, rad);
        path.strokeColor = vari;
        path.removeOnDrag();
    }

    //Nelikulmio
    nelikulmio = new Tool();
    var startPoint;
    nelikulmio.onMouseDown = function(event) {
        startPoint = event.point;
    }
    nelikulmio.onMouseDrag = function(event) {
        path = new Path.Rectangle(startPoint, event.point);
        path.strokeColor = vari;
        path.removeOnDrag();
    }
}

function changeColor(color) {
    /*
     * Vaihda kalun väriä colorin mukaiseksi.
     */
    vari = color;
}
