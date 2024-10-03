
/******************************************************************************
 *
 * Draws a rectangle on a JSX board, given specified bounds.
 *
 * Inputs:
 *   board - the jsx board to draw on
 *   bounds - an object specifying the bounds of the rectangle, must
 *     be of the form: {x, y, width, height}
 *   args (optional) - a JSON object that contains constants controlling
 *     how the rectangle should be drawn
 *
 */

function rectangle(board, bounds, args) {

    // Exit if no board is specified

    if (board === undefined) {
        console.error("A JSX board must be specified to draw a rectangle on.");
        return;
    }

    // Check to see if any parameters were specified, make a default empty
    //   object if not

    if (args === undefined) {
        args = {};
    }

    // Make sure the bounds were specified, or else exit

    if (bounds === undefined || bounds.x === undefined || bounds.y === undefined
        || bounds.width === undefined || bounds.height === undefined) {
        console.error("Bounds for rectangle not specified, expected an objected of type: " +
            " {x: Number, y: Number, width: Number, height: Number");
        return
    }

    let borderColor = args.borderColor ? args.borderColor : 'black';
    let showBorder = args.showBorder ? args.showBorder : true;
    let borderWidth = args.borderWidth ? args.borderWidth : 1;
    let borderOpacity = args.borderOpacity ? args.borderOpacity : 1;
    let showFill = args.showFill ? args.showFill : false;
    let fillColor = args.fillColor ? args.fillColor : 'green';
    let fillOpacity = args.fillOpacity ? args.fillOpacity : 0.2;

    let x = bounds.x;
    let y = bounds.y;
    let w = bounds.width;
    let h = bounds.height;

    var poly = board.create('polygon', [[x, y], [x+w, y], [x+w, y-h], [x, y-h]]);

    poly.setAttribute({ highlight: false});
    poly.setAttribute({ fixed: true });

    if (showFill) {
        poly.setAttribute({ fillColor: fillColor });
        poly.setAttribute({ fillOpacity: fillOpacity });
    } else {
        poly.setAttribute({ fillOpacity: 0 });
    }

    for(let point of poly.vertices) {
        point.setAttribute({ visible: false });
    }

    if (showBorder) {

        poly.setAttribute({ strokeWidth: borderWidth });
        poly.setAttribute({ strokeOpacity: borderOpacity });
        for(let border of poly.borders) {
            border.setAttribute({ strokeColor: borderColor });
            border.setAttribute({ fixed: true });
            border.setAttribute({ highlight: false });
        }
    }


}


///////////////////////////////////////////////////////////////////////////////
//
//  This function draws a rectangle on the a JSX Board using the coordinates:
//  	[x, y, width, height] as an input
//
///////////////////////////////////////////////////////////////////////////////

class Point2 {

	constructor(board, x, y, properties) {
		this.p = board.create('point', [x, y], properties);
		this.x = x;
		this.y = y;
	}

	setCoords(x, y, delay) {
		delay = delay || 0;
		this.x = x;
		this.y = y;
		this.p.moveTo([x,y], delay);
	}

}

class Rectangle2 {

	constructor(board, x, y, width, height, color) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
		this.p1 = new Point2(board, x, y, { visible: false });
		this.p2 = new Point2(board, x + width, y, { visible: false });
		this.p3 = new Point2(board, x + width, y + height, { visible: false });
		this.p4 = new Point2(board, x, y + height, { visible: false });
		this.rect = board.create('polygon', [this.p1.p, this.p2.p, this.p3.p, this.p4.p], {
			hasInnerPoints: false,
			fillColor: color,
			fixed: true,
			highlight: false,
			borders: {
				strokeColor: '#0000FF',
				fixed: true,
				highlight: false
			}
		});
	}

	setHeight(height, delay) {
		delay = delay || 0;
		this.p3.setCoords(this.x + this.width, this.y + height, delay);
		this.p4.setCoords(this.x, this.y + height, delay);
		this.height = height;
	}


	setWidth(width, delay) {
		delay = delay || 0;
		this.p2.setCoords(this.x + width, this.y, delay);
		this.p3.setCoords(this.x + width, this.y + this.height, delay);
		this.width = width;
	}

	setCoords(x, y, delay) {
		delay = delay || 0;
		this.p1.setCoords(x, y, delay);
		this.p2.setCoords(x + this.width, y, delay);
		this.p3.setCoords(x + this.width, y + this.height, delay);
		this.p4.setCoords(x, y + this.height, delay);
		this.x = x;
		this.y = y;
	}

	setColor(color) {
		this.color = color;
		this.rect.setAttribute( { fillColor: color } );
		this.rect.needsUpdate = true;
		// Find a way to set the border of the polygon to the new color (set each border separately)
	}

}
