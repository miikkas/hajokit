if(window.addEventListener) {
    /* 
     * Keep everything in an anonymous function, called on window load.
     */
    window.addEventListener('load', function () {
        var canvas, context, canvaso, contexto;

        // Instances for the active tool, size and colour, 
        // along with default values.
        var tool;
        var tool_default = 'pencil';

        var size;
        var size_default = 2;
        
        var colour;
        var colour_default ="#FFFFFF";
        function init () {
            /* 
             * Find the canvas element.
             */
            canvaso = document.getElementById('imageView');
            if (!canvaso) {
                alert('Error: I cannot find the canvas element!');
                return;
            }
            
            if (!canvaso.getContext) {
                alert('Error: no canvas.getContext!');
                return;
            }

            // Get the 2D canvas context.
            contexto = canvaso.getContext('2d');
            if (!contexto) {
                alert('Error: failed to getContext!');
                return;
            }

            // Add the temporary canvas.
            var container = canvaso.parentNode;
            canvas = document.createElement('canvas');
            if (!canvas) {
                alert('Error: I cannot create a new canvas element!');
                return;
            }

            canvas.id     = 'imageTemp';
            canvas.width  = canvaso.width;
            canvas.height = canvaso.height;
            container.appendChild(canvas);

            context = canvas.getContext('2d');

            // Get the tool select input.
            var tool_select = document.getElementById('dtool');
            if (!tool_select) {
                alert('Error: failed to get the dtool element!');
                return;
            }
            tool_select.addEventListener('change', ev_tool_change, false);

            // Activate the default tool.
            if (tools[tool_default]) {
                tool = new tools[tool_default]();
                tool_select.value = tool_default;
            }

            // Get the size select input.
            var size_select = document.getElementById('dsize');
            if (!size_select) {
                alert('Error: failed to get the dsize element!');
                return;
            }
            size_select.addEventListener('change', ev_size_change, false);

            // Activate the default size.
            if (sizes[size_default]) {
                size = new sizes[size_default]();
                size_select.value = size_default;
                context.lineWidth = size_default;
            }

            // Get the colour select input.
            var colour_select = document.getElementById('dcolour');
            if (!colour_select) {
                alert('Error: failed to get the dcolour element!');
                return;
            }
            colour_select.addEventListener('change', ev_colour_change, false);

            // Activate the default colour.
            if (colours[colour_default]) {
                colour = new colours[colour_default]();
                colour_select.value = colour_default;
                context.strokeStyle = colour_default;
            }

            // Attach the mousedown, mousemove and mouseup event listeners.
            canvas.addEventListener('mousedown', ev_canvas, false);
            canvas.addEventListener('mousemove', ev_canvas, false);
            canvas.addEventListener('mouseup',   ev_canvas, false);
        }

        function ev_canvas (ev) {
            /*
             * The general-purpose event handler. This function just determines the mouse 
             * position relative to the canvas element.
             */
            if (ev.layerX || ev.layerX === 0) { // Firefox
                ev._x = ev.layerX;
                ev._y = ev.layerY;
            } else if (ev.offsetX || ev.offsetX === 0) { // Opera
                ev._x = ev.offsetX;
                ev._y = ev.offsetY;
            }

            // Call the event handler of the tool.
            var func = tool[ev.type];
            if (func) {
                func(ev);
            }
        }

        function ev_tool_change (ev) {
            /*
             * The event handler for any changes made to the tool selector.
             */
            if (tools[this.value]) {
                tool = new tools[this.value]();
            }
        }

        function hextorgb(hex) {
            /*
             * Changes the given hex value of a colour to an RGBA 
             * representation, eg. 255:0:0:255.
             */
            var rgb = '';
            rgb += parseInt(hex.slice(1, 3), 16) + ':';
            rgb += parseInt(hex.slice(3, 5), 16) + ':';
            rgb += parseInt(hex.slice(5, 7), 16) + ':';
            rgb += '255';
            return rgb;
        }

        function ev_size_change (ev) {
            /*
             * The event handler for any changes made to the size selector.
             */
            context.lineWidth = this.value;
        }

        function ev_colour_change (ev) {
            /*
             * The event handler for any changes made to the colour selector.
             */
            context.strokeStyle = this.value;
        }
        
        function flood_fill(x, y, targetcolor, replacementcolor, p) {
            /*
             * Performs a flood fill, replacing pixels of the targetcolor
             * with the replacementcolor, starting from coordinates x, y. 
             * TO-DO: Quite heavy because of passing the color information 
             * of the entire canvas to each recursive function call. Try to 
             * fix that.
             */
            replacementcolors = replacementcolor.split(':');
            var j = 4 * (y * canvas.width + x);
            if ((p.data[j] + ':' + p.data[j + 1] + ':' + p.data[j + 2] + ':' + p.data[j + 3]) != targetcolor || x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
                return p;
            }
            for (var i = 0; i < 4; i++) {
                p.data[j + i] = replacementcolors[i];
            }
            p = flood_fill(x - 1, y, targetcolor, replacementcolor, p);
            p = flood_fill(x + 1, y, targetcolor, replacementcolor, p);
            p = flood_fill(x, y - 1, targetcolor, replacementcolor, p);
            p = flood_fill(x, y + 1, targetcolor, replacementcolor, p);
            return p;
        }
        
        function img_update () {
            /*
             * This function draws the #imageTemp canvas on top of 
             * #imageView, after which #imageTemp is cleared. This 
             * function is called each time when the user completes 
             * a drawing operation.
             */
            contexto.drawImage(canvas, 0, 0);
            context.clearRect(0, 0, canvas.width, canvas.height);
        }

        // These objects holds the implementations of each tool/size/colour.
        var tools = {};
        var sizes = {};
        var colours = {};

        tools.pencil = function () {
            /* 
             * The drawing pencil.
             */
            var tool = this;
            this.started = false;

            // This is called when you start holding down the mouse button.
            // This starts the pencil drawing.
            this.mousedown = function (ev) {
                context.beginPath();
                context.moveTo(ev._x, ev._y);
                tool.started = true;
            };

            // This function is called every time you move the mouse. Obviously, it only 
            // draws if the tool.started state is set to true (when you are holding down 
            // the mouse button).
            this.mousemove = function (ev) {
                if (tool.started) {
                    context.lineTo(ev._x, ev._y);
                    context.stroke();
                }
            };

            // This is called when you release the mouse button.
            this.mouseup = function (ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update();
                }
            };
        };

        tools.eraser = function () {
            /* 
             * The eraser. Essentially a pencil, except that 
             * it uses only white.
             */
            var tool = this;
            this.started = false;
            var previouscolour;

            this.mousedown = function (ev) {
                previouscolour = context.strokeStyle;
                context.strokeStyle = "#FFFFFF";
                context.beginPath();
                context.moveTo(ev._x, ev._y);
                tool.started = true;
            };

            this.mousemove = function (ev) {
                if (tool.started) {
                    context.lineTo(ev._x, ev._y);
                    context.stroke();
                }
            };

            this.mouseup = function (ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update();
                    context.strokeStyle = previouscolour;
                }
            };
        };

        tools.rect = function () {
            /* 
             * The rectangle tool.
             */
            var tool = this;
            this.started = false;

            this.mousedown = function (ev) {
                tool.started = true;
                tool.x0 = ev._x;
                tool.y0 = ev._y;
            };

            this.mousemove = function (ev) {
                if (!tool.started) {
                    return;
                }

                var x = Math.min(ev._x,  tool.x0),
                y = Math.min(ev._y,  tool.y0),
                w = Math.abs(ev._x - tool.x0),
                h = Math.abs(ev._y - tool.y0);

                context.clearRect(0, 0, canvas.width, canvas.height);

                if (!w || !h) {
                    return;
                }

                context.strokeRect(x, y, w, h);
            };

            this.mouseup = function (ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update();
                }
            };
        };

        tools.ellipse = function () {
            /* 
             * The ellipse tool. Draws an ellipse with two 
             * Bezier curves.
             */
            var tool = this;
            this.started = false;

            this.mousedown = function (ev) {
                tool.started = true;
                tool.x0 = ev._x;
                tool.y0 = ev._y;
            };

            this.mousemove = function (ev) {
                    if (!tool.started) {
                        return;
                    }

                context.clearRect(0, 0, canvas.width, canvas.height);

                context.beginPath();
                context.moveTo(tool.x0, tool.y0);
                context.bezierCurveTo(tool.x0, 2 * tool.y0 - ev._y, ev._x, 2 * tool.y0 - ev._y, ev._x, tool.y0);
                context.moveTo(tool.x0, tool.y0);
                context.bezierCurveTo(tool.x0, ev._y, ev._x, ev._y, ev._x, tool.y0);
                context.stroke();
                context.closePath();
            };

            this.mouseup = function (ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update();
                }
            };
        };

        tools.line = function () {
            /* 
             * The line tool.
             */
            var tool = this;
            this.started = false;

            this.mousedown = function (ev) {
                tool.started = true;
                tool.x0 = ev._x;
                tool.y0 = ev._y;
            };

            this.mousemove = function (ev) {
                    if (!tool.started) {
                        return;
                    }

                context.clearRect(0, 0, canvas.width, canvas.height);

                context.beginPath();
                context.moveTo(tool.x0, tool.y0);
                context.lineTo(ev._x,   ev._y);
                context.stroke();
                context.closePath();
            };

            this.mouseup = function (ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update();
                }
            };
        };

        tools.fill = function () {
            /* 
             * The flood fill tool, or "paint bucket".
             */
            var tool = this;
            var p;
            this.mousedown = function (ev) {
                p = contexto.getImageData(0, 0, canvas.width, canvas.height);
                var currentcolor = p.data[4 * (ev._y * canvas.width + ev._x)] + ':' + p.data[4 * (ev._y * canvas.width + ev._x) + 1] + ':' + p.data[4 * (ev._y * canvas.width + ev._x) + 2] + ':' + p.data[4 * (ev._y * canvas.width + ev._x) + 3];
                p = flood_fill(ev._x, ev._y, currentcolor, hextorgb(context.strokeStyle), p);
                context.putImageData(p, 0, 0);
            };
            this.mouseup = function (ev) {
                img_update();
            };
        };

        init();

    }, false);
}