
/**
 * This library uses a type of object I created called a PlotObject, which is
 * an array of PlotPieces. A plot piece can consist of the following:
 *  + curve = {
 *      type: 'curve',
 *      relation: {string},
 *      interval: {string},
 *      jsxobject: JSXGraph.Curve,
 *      lowerendpoint: JSXGraph.Point,
 *      upperendpoint: JSXGraph.Point
 *    },
 *  + point = {
 *      type: 'point',
 *      jsxobject: JSXGraph.Point,
 *      coords: {string},
 *      solid: {boolean}
 *    }
 *
 *
 * All of these applets use a standardized method of creating and evaluating
 * functions from strings. Here is an overview of the notation used:
 *
 * Functions: (independent count: 1, dependent count: 1)
 * ---------
 *   - y = 2x-5  or f(x)=2x-5: both will be interpreted as a fuction of x and
 *       defined on the interval x in (-oo, oo)
 *   - x = 2y+5  or g(y) =3y+4: both will be interpreted as functions of y
 *       and defined on the interval y in (-oo, oo)
 *   - y = x^2 - 1 on (-3, 8]: interpreted as a function of x defined on the
 *       interval from x = -3 to x = 8
 *   - y = 3x - 4 on x!=2: will produce a graph with a hole at (2, 2)
 *   Notes: oo can be used to represent infinity, and any variable names
 *    can be used as long as the independent and dependent variable are
 *    well defined
 *
 * Parametric Equations: (independent count: 1, dependent count: 2)
 * --------------------
 *   - <2t, -8t-1> on (-4, 3]: parametric equations where the parameter t
 *       is restricted from t = -4 to t = 3
 *   Notes: an interval for t must be supplied and neither endpoint
 *    can be infinity
 *
 * Implicit Equations: (independent count: 2, dependent count: 1)
 * ------------------
 *   - x^2+xy^3=4
 *   Notes: restricted intervals are ignored
 *
 * Points:
 * ------
 *   - (2, -4): a closed point to draw on the graph
 *   - [3, 6]: an open point to draw on a graph
 *
 * Asymptotes:
 * ----------
 *   - x != 5: the location of a vertical asymptote
 *
 * Sequential Plots:
 * ----------------
 *   - a=2n+1: a sequential graph plot
 *
 * Piecewise Defined Functions:
 * ---------------------------
 *   - Piecewise defined functions can contain many of the above items
 *     collected together and separated by semicolons
 *   - (2,5); (-3, 1); (6,10) : plots a set of points
 *   - 1 / (x+1)^2; x!=-1 : Graphs a rational with an asymptote
 *   - 2x on (-oo,4); x^2-1 on [4, 5]; -x+4 on (5,oo) : piecewise defined function
 *
 *
 * All graphs can be drawn using solid or dashed lines, and a step interval
 * may be specified
 *
 * A graph will consist of just a piece of a curve. However, the plot routine
 * can return an array of pieces of graphs, points, and asymptotes as an array.
 *
 */

// Dependencies:
//
//  - jsxgraph is required for any jsx functions
//  - math.js is required for evaluations and drawing graphs

// Useful constants
let dashsetting = 3;

/**
 * Goes through a PlotPieces array and finds a piece that is a curve, which
 * can then be updated and modified
 * @param {PlotPieces[]} plot_pieces
 * @returns {PlotPiece} the plot piece found
 */
function getPlotPiece(plot_pieces) {
    for(let piece of plot_pieces) {
        if(piece.type == 'curve') {
            return piece
        }
    }
}

function getCurve(plot_piece) {
    for(let piece of plot_pieces) {
        if(piece.type == 'curve') {
            return piece.curve
        }
    }
}

/**
 * Plots a function, it can restrict to a specified interval and will draw open
 * and closed endpoints if they are needed.
 * @param board {JSXGraph.board} - JSXGraph board to draw the curve on
 * @param relation {string} - the function to draw, this can include a
 *  restricted domain
 * @param args {object} - special arguments to affect the way the function
 *  is drawn
 * @option {string or hex} color: the color of the curve
 * @option {string} interval: another way to specify a restricted interval
 * @option {float} width: the width of the curve
 * @option {string} variable: the variable used within the function
 * @option {boolean} dashed: whether or not to draw a dashed curve
 * @option {PlotPiece} piece: a wrapper for a JSX curve object, this contains
 *  the curve, and the possible endpoints of the curve
 * @returns {PlotPiece} a Plot Piece which contains the curve
 */
function plot_function(board, relation, args) {

	if(args === undefined) {
		args = {};
	}

    let interval;
	let color = args.color ? args.color : 'blue';
	let width = args.width ? args.width : 2;
	let dashed = (args.dashed !== undefined) ? args.dashed : false;
    let plot_piece = args.piece ? args.piece : { type: 'curve' };
    let curve = isEmptyObject(args.piece) ?
        board.create('curve', [0,0], 0, 0, { visible: false }) :
        args.piece.jsxobject;

    [relation, interval] = spliceInterval(relation);
    plot_piece.relation = relation;
    plot_piece.interval = interval;

    let bounds = JSXGetBounds(board);

	curve.setAttribute({ strokeWidth: width, strokeColor: color, highlight: false });
    curve.setAttribute({ dash: dashed ? dashsetting : 0 });

	// math.js does not support ln notation
	relation = replace_logarithms(relation);
    let expr = math.compile(relation);

    let [ start_x, end_x ] = getEndpoints(interval);

    // Plot an endpoint if the lower bound is restricted
    if (isBetween(start_x, bounds.xmin, bounds.xmax)) {
        let x_coord = start_x;
        let y_coord = expr.evaluate({ x: x_coord });
        plot_piece.lowerendpoint = plot_endpoint(board, [x_coord, y_coord],
            lowerBoundClosed(interval), color, plot_piece.lowerendpoint);
    } else if (plot_piece.lowerendpoint) {
        plot_piece.lowerendpoint.setAttribute({ visible: false });
    }

    // Plot an endpoint if the upper bound is restricted
    if (isBetween(end_x, bounds.xmin, bounds.xmax)) {
        let x_coord = end_x;
        let y_coord = expr.evaluate({ x: x_coord });
        plot_piece.upperendpoint = plot_endpoint(board, [x_coord, y_coord],
            upperBoundClosed(interval), color, plot_piece.upperendpoint);
    } else if (plot_piece.upperendpoint) {
        plot_piece.upperendpoint.setAttribute({ visible: false });
    }

    start_x = start_x == NEGATIVE_INFINITY ? bounds.xmin : start_x;
    end_x = end_x == POSITIVE_INFINITY ? bounds.xmax : end_x;

    curve.X = x => x;
    curve.Y = x => isBetween(x, start_x, end_x) ? expr.evaluate({ x: x }) : NaN;

    plot_piece.jsxobject = curve;
    curve.updateCurve();
    return plot_piece;

}

/**
 * Plots a function x=g(y), it can restrict to a specified interval and will
 * draw open and closed endpoints if they are needed.
 * @param board {JSXGraph.board} - JSXGraph board to draw the curve on
 * @param relation {string} - the function to draw, this can include a
 *  restricted domain
 * @param args {object} - special arguments to affect the way the function
 *  is drawn
 * @option {string or hex} color: the color of the curve
 * @option {float} width: the width of the curve
 * @option {string} variable: the variable used within the function
 * @option {boolean} dashed: whether or not to draw a dashed curve
 * @option {PlotPiece} piece: a wrapper for a JSX curve object, this contains
 *  the curve, and the possible endpoints of the curve
 * @returns {PlotPiece} a Plot Piece which contains the curve
 */
function plot_xfunction(board, relation, args) {

	if(args === undefined) {
		args = {};
	}

    let interval = '';
	let color = args.color ? args.color : 'blue';
	let width = args.width ? args.width : 2;
	let dashed = (args.dashed !== undefined) ? args.dashed : false;
    let plot_piece = args.piece ? args.piece : { type: 'curve' };
    let curve = isEmptyObject(args.piece) ?
        board.create('curve', [0,0], 0, 0, { visible: false }) :
        args.piece.jsxobject;

    [relation, interval] = spliceInterval(relation);
    plot_piece.relation = relation;
    plot_piece.interval = interval;

    let bounds = JSXGetBounds(board);

	curve.setAttribute({ strokeWidth: width, strokeColor: color, highlight: false });
    curve.setAttribute({ dash: dashed ? dashsetting : 0 });

	// math.js does not support ln notation
	relation = replace_logarithms(relation);

    let expr = math.compile(relation);
    let [ start_y, end_y ] = getEndpoints(interval);

    // Plot an endpoint if the lower bound is restricted
    if (isBetween(start_y, bounds.ymin, bounds.ymax)) {
        let y_coord = start_y;
        let x_coord = expr.evaluate({ y: y_coord });
        let solid = lowerBoundClosed(interval);
        plot_piece.lowerendpoint = plot_endpoint(board, [x_coord, y_coord],
            solid, color, plot_piece.lowerendpoint);
    } else if (plot_piece.lowerendpoint) {
        plot_piece.lowerendpoint.setAttribute({ visible: false });
    }

    // Plot an endpoint if the upper bound is restricted
    if (isBetween(end_y, bounds.ymin, bounds.ymax)) {
        let y_coord = end_y;
        let x_coord = expr.evaluate({ y: y_coord });
        let solid = upperBoundClosed(interval);
        plot_piece.upperendpoint = plot_endpoint(board, [x_coord, y_coord],
            solid, color, plot_piece.upperendpoint);
    } else if (plot_piece.upperendpoint) {
        plot_piece.upperendpoint.setAttribute({ visible: false });
    }

    start_y = start_y == NEGATIVE_INFINITY ? bounds.ymin : start_y;
    end_y = end_y == POSITIVE_INFINITY ? bounds.ymax : end_y;

    curve.Y = y => y;
    curve.X = y => isBetween(y, start_y, end_y) ? expr.evaluate({ y: y }) : NaN;

    plot_piece.jsxobject = curve;
    curve.updateCurve();
    return plot_piece;

}

function plot_point(board, coords, args) {

	if(args === undefined) {
		args = {};
	}

	let color = args.color ? args.color : 'blue';
	let size = args.size ? args.size : 2;
	let solid = (args.solid !== undefined) ? args.solid : true;
    let plot_piece = args.piece ? args.piece : { type: 'point' };
    let point = isEmptyObject(args.piece) ?
        board.create('point', [0,0], { visible: false }) :
        args.piece.jsxobject;

	point.setAttribute({ size: size, strokeColor: color, highlight: false });
    point.setAttribute({ fillColor: solid ? color : 'white' });
    point.moveTo(coords);
    point.setAttribute({ visible: true });

    plot_piece.jsxobject = point;
    plot_piece.coords = coords;
    plot_piece.solid = solid;

    return plot_piece;

}

/**
 * Draws either an open or closed circle at the endpoint of a curve.
 * @param {JSXGraph.Board} board - the JSXGraph drawing board to plot
 *   the point on
 * @param {float[]} coords - the coordinates to plot the endpoint in the
 *   form: (a, b)
 * @param {boolean} solid - whether to plot with an open circle or a closed
 *   circle
 * @param {string or hex} color - the color to draw the point
 * @param {JSXGraph.Point} point - a reference to a JSXGraph point, if this is
 *   null a new point will be created, otherwise it will update the coordinates
 *   of the point it is displaying
 * @returns {JSXGraph.Point} a reference to the point drawn
 */
function plot_endpoint(board, coords, solid, color, point) {
    if (!point) {
        point = board.create('point', [0,0], {
            withLabel: false,
            fixed: true,
            visible: false,
            highlight: false,
        });
    }
    point.moveTo(coords);
    point.setAttribute({
        strokeColor: color,
        fillColor: solid ? color : 'white',
        visible: true,
    });
    return point;
}

/**
 * Plots a polar function r=f(t), bounds for t should be provided as an
 * interval, but if it not, then the interval will default to -2pi to 2pi.
 * @param board {JSXGraph.board} - JSXGraph board to draw the curve on
 * @param relation {string} - the function to draw, this can include a
 *  restricted domain
 * @param args {object} - special arguments to affect the way the function
 *  is drawn
 * @option {string or hex} color: the color of the curve
 * @option {float} width: the width of the curve
 * @option {string} variable: the variable used within the function
 * @option {boolean} dashed: whether or not to draw a dashed curve
 * @option {PlotPiece} piece: a wrapper for a JSX curve object, this contains
 *  the curve, and the possible endpoints of the curve
 * @returns {PlotPiece} a Plot Piece which contains the curve
 */
function plot_polar(board, relation, args) {

    args = args === undefined ? {} : args;

    if(relation === '') {
        return {};
    }

    let interval = '';
	let color = args.color ? args.color : 'blue';
	let width = args.width ? args.width : 2;
	let dashed = (args.dashed !== undefined) ? args.dashed : false;
    let plot_piece = args.piece ? args.piece : { type: 'curve' };
    let curve = isEmptyObject(args.piece) ?
        board.create('curve', [0,0], 0, 0, { visible: false }) :
        args.piece.jsxobject;

    [relation, interval] = spliceInterval(relation);
    plot_piece.relation = relation;
    plot_piece.interval = interval;

	curve.setAttribute({ strokeWidth: width, strokeColor: color, highlight: false });
    curve.setAttribute({ dash: dashed ? dashsetting : 0 });

	// math.js does not support ln notation
	relation = replace_logarithms(relation);
    let expr = math.compile(relation);
    let [ tmin, tmax ] = getEndpoints(interval);

    // x = r cos(theta), y = r sin(theta)
    let evalX = t => expr.evaluate({ t: t }) * Math.cos(t);
    let evalY = t => expr.evaluate({ t: t }) * Math.sin(t);

    curve.X = t => isBetween(t, tmin, tmax) ? evalX(t) : NaN;
    curve.Y = t => isBetween(t, tmin, tmax) ? evalY(t) : NaN;

    plot_piece.jsxobject = curve;
    curve.updateCurve();
    return plot_piece;

}


/**
 * Plots a parametric set of equations over a specified interval of the
 * variable t. The interval can be specified adjacent to the function
 * or within the args, otherwise it will default to -10 and +10.
 * @param {JSXGraph.Board} board - the JSXGraph board to draw the curve on
 * @param {string} relation - a string containing the parametric equations. The
 * form is expected as: <f(t),g(t)> or <f(t),g(t)> (a,b)
 * @param {*} args
 */
function plot_parametric(board, relation, args) {

	args = args === undefined ? {} : args;

    if(relation === '') {
        return {};
    }

    let interval = '';
	let color = args.color ? args.color : 'blue';
	let width = args.width ? args.width : 2;
	let dashed = (args.dashed !== undefined) ? args.dashed : false;
    let plot_piece = args.piece ? args.piece : { type: 'curve' };
    let curve = isEmptyObject(args.piece) ?
        board.create('curve', [0,0], 0, 0, { visible: false,  highlight: false }) :
        args.piece.jsxobject;

	curve.setAttribute({ strokeColor: color, strokeWidth: width, highlight: false });
    curve.setAttribute({ dash: dashed ? dashsetting : 0 });

    [relation, interval] = spliceInterval(relation);
    let [x_t, y_t] = getParametricFunctions(relation);
    let [ tmin, tmax ] = getEndpoints(interval);

    tmin = tmin == NEGATIVE_INFINITY ? -10 : tmin;
    tmax = tmax == POSITIVE_INFINITY ? 10 : tmax;

    plot_piece.relation = relation;
    plot_piece.interval = interval === '' ? `(${tmin},${tmax})`
        : `${interval.slice(0,1)}${tmin},${tmax}${interval.slice(-1)}`;

	let xFunc = math.compile(x_t);
	let yFunc = math.compile(y_t);

	let evalX = t => xFunc.evaluate({ t: t });
    let evalY = t => yFunc.evaluate({ t: t });

    let [x_low, y_low] = [ evalX(tmin), evalY(tmin) ];
    let [x_high, y_high] = [ evalX(tmax), evalY(tmax) ];

    // Plot the endpoints of the curve
    plot_piece.lowerendpoint = plot_endpoint(board, [x_low, y_low],
        lowerBoundClosed(interval), color, plot_piece.lowerendpoint);

    plot_piece.upperendpoint = plot_endpoint(board, [x_high, y_high],
        upperBoundClosed(interval), color, plot_piece.upperendpoint);

    curve.X = t => isBetween(t, tmin, tmax) ? evalX(t) : NaN;
    curve.Y = t => isBetween(t, tmin, tmax) ? evalY(t) : NaN;

    plot_piece.jsxobject = curve;
    curve.updateCurve();
    return plot_piece;

}


/**
 * Plots a relation in two dimensions. The format of the input is expected to
 *    be one of the following formats:
 *
 *          y = f(x), or just f(x) - for standard rectangular functions
 *          r = f(t) - for polar equations
 *          < x(t), y(t) > - for parametric equations
 *          x = g(y) - for rectangular equations rotated by 90 degrees
 *          implicity defined functions such as x^2 + y^2 = 4
 *          (x,y) or [x,y] - for plotting a point, either closed or open
 *          a = f(n) - for plotting just the points along a curve
 *
 *    Rectangular functions can be plotted on a restricted interval
 *
 *    Polar and parametric equations must have an interval of t provided to
 *        plot over
 *
 *    If no equals sign is provided, it is assumed that the function is a
 *        rectangular function of x.
 *
 * @param {JSXGraph.board} board - the JSXGraph board to draw the function on
 * @param {string} relation - a string containing the function to draw
 * @param {object} args - an object containing one or more arguments to define
 *    how the curve is drawn. Possiblities are:
 *      color (string) - the color of the curve
 *	    interval (string) - a restriction on the independent variable for
 *         drawing the curve such as (-4,5]. Open and closed circles are drawn
 *	    density (float) - the step interval to pick new points
 *	    width (float) - the width of the curve
 *      size (float) - the size of the point to draw
 *	    variable (string) - the dependent variable
 *	    dashed (boolean) - whether the curve should be dashed or solid
 *
 * @returns - a reference to the curve drawn
 */

function plot(board, relation, args) {

    args = args ? args : {};

    if (relation === '') {
        return {};
    }

    let color = args.color ? args.color : 'blue';

	relation = relation.toLowerCase();
    relation = removeSpaces(relation);

    // remove any previously plotted graph from the board
    if (!isEmptyObject(args.pieces)) {
        for(let piece of args.pieces) {
            if (piece.type == 'curve') {
                if (piece.lowerendpoint) {
                    board.removeObject(piece.lowerendpoint);
                }
                if (piece.upperendpoint) {
                    board.removeObject(piece.upperendpoint);
                }
            }
            board.removeObject(piece.jsxobject)
        }
        args.pieces = {};
    }

    let plot_pieces = [];
    let relations = relation.split(";");

    for (let plot_item of relations) {

        if (isPoint(plot_item)) {

            // The plot_item is of the form (x,y) or [x,y]
            let [x, y] = getEndpoints(plot_item);
            let piece = plot_point(board, [x, y], { color: color, solid: isClosedPoint(plot_item) });
            plot_pieces.push(piece);
            continue;

        }

      /**   if (isAsymptote(plot_item)) {
            // do whatever
            continue;
        }**/

        // math.js does not support ln notation for natural logarithm
        plot_item = replace_logarithms(plot_item);

        if (isFunction(plot_item)) {
            // rectangular y = f(x)
            let piece = plot_function(board, plot_item, args);
            plot_pieces.push(piece);
            continue;
        }

        if (isXFunction(plot_item)) {
            // rectangular x = g(y)
            let piece = plot_xfunction(board, plot_item, args);
            plot_pieces.push(piece);
            continue;
        }

        if (isVectorFunction(plot_item)) {
            // paramteric: <f(t),g(t)>
            let piece = plot_parametric(board, plot_item, args);
            plot_pieces.push(piece);
            continue;
        }

        if (isPolarFunction(plot_item)) {
            // r=f(t)
            let piece = plot_polar(board, plot_item, args);
            plot_pieces.push(piece);
            continue;
        }

        if (isSequence(plot_item)) {
            // do whatever
            continue;
        }

        if (isImplicitEquation(plot_item)) {
            plot_item = convertImplicitEquation(plot_item);
            implicit_plot(plot_item, args);
            continue;
        }


    }

    return plot_pieces;

}


///////////////////////////////////////////////////////////////////////////////
//
// Draws the plot of a function implicity, however, very slowly. Uses the
//   marching squares algorithm and plots using multiple segments. There's
//   probably a way of speeding the algorithm up, but for right now this at
//   least works :)
//
// It currently doesn't allow for erasing and redrawing when the window is
//   resized, so that would be the next thing to work on
//
// TODO: Allow for removal of curve when window resized
//
///////////////////////////////////////////////////////////////////////////////

function implicit_plot(relation, args) {

	if(args === undefined) {
		args = {};
	}

	board.suspendUpdate();

	var color = args.color ? args.color : 'red';
	var density = args.density ? args.density : 0.1;

	var bounds = JSXGetBounds(board);

	var nVertPoints = (bounds.ymax - bounds.ymin) / density;
	var nHorizPoints = (bounds.xmax - bounds.xmin) / density;

	var nVertCells = nVertPoints - 1;
	var nHorizCells = nHorizPoints - 1;

	var expr = math.compile(relation);

	var segmentparams = { color: color, fixed: true, highlight: false };

	for(var x = bounds.xmin; x <= bounds.xmax - density; x += density) {
		for(var y = bounds.ymin+density; y <= bounds.ymax; y += density) {
			var nw = expr.eval({x: x, y: y});
			var ne = expr.eval({x: x + density, y: y});
			var se = expr.eval({x: x + density, y: y - density});
			var sw = expr.eval({x: x, y: y - density});

			var total = 0;
			if(nw > 0) total += 8;
			if(ne > 0) total += 4;
			if(se > 0) total += 2;
			if(sw > 0) total += 1;

			var bottomInterp = -sw / (se - sw) * density;
			var topInterp    = -nw / (ne - nw) * density;
			var leftInterp   = -nw / (sw - nw) * density;
			var rightInterp	 = -ne / (se - ne) * density;

			switch (total) {
				case 0:
					break;
				case 1:
					board.create('segment', [[x, y - leftInterp], [x + bottomInterp, y - density]], segmentparams);
					break;
				case 2:
					board.create('segment', [[x + bottomInterp, y - density], [x + density, y - rightInterp]], segmentparams);
					break;
				case 3:
					board.create('segment', [[x, y - leftInterp], [x + density, y - rightInterp]], segmentparams);
					break;
				case 4:
					board.create('segment', [[x + topInterp, y], [x + density, y - rightInterp]], segmentparams);
					break;
				case 5:
					board.create('segment', [[x, y - leftInterp], [x + topInterp, y]], segmentparams);
					board.create('segment', [[x + bottomInterp, y - density], [x + density, y - rightInterp]], segmentparams);
					break;
				case 6:
					board.create('segment', [[x + topInterp, y], [x + bottomInterp, y - density]], segmentparams);
					break;
				case 7:
					board.create('segment', [[x, y - leftInterp], [x + topInterp, y]], segmentparams);
					break;
				case 8:
					board.create('segment', [[x, y - leftInterp], [x + topInterp, y]], segmentparams);
					break;
				case 9:
					board.create('segment', [[x + topInterp, y], [x + bottomInterp, y - density]], segmentparams);
					break;
				case 10:
					board.create('segment', [[x + topInterp, y], [x + density, y - rightInterp]], segmentparams);
					board.create('segment', [[x, y - leftInterp], [x + bottomInterp, y - density]], segmentparams);
					break;
				case 11:
					board.create('segment', [[x + topInterp, y], [x + density, y - rightInterp]], segmentparams);
					break;
				case 12:
					board.create('segment', [[x, y - leftInterp], [x + density, y - rightInterp]], segmentparams);
					break;
				case 13:
					board.create('segment', [[x + bottomInterp, y - density], [x + density, y - rightInterp]], segmentparams);
					break;
				case 14:
					board.create('segment', [[x, y - leftInterp], [x + bottomInterp, y - density]], segmentparams);
					break;
				case 15:
					break;
			}

		}

	}

	board.unsuspendUpdate();
}
