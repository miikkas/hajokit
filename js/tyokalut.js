paper.install(window);
/*
 * Globaalit muuttujat, jotta niitä voi muokata html:stä käsin.
 */

var kyna, viiva, nelikulmio, ellipsi, kumi, taytto;
var vari = 'black';

window.onload = function() {
    paper.setup('canvas');
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


}

function changeColor(color) {
    /*
     * Vaihda kalun väriä colorin mukaiseksi.
     */
    vari = color;
}
