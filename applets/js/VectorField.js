
///////////////////////////////////////////////////////////////////////////////
//
// function to create a vector field
//
//    length - the length of the slope line, default is 1
//    density - the distance between each slope that is calculated
//    color - the color of the slope lines
//
///////////////////////////////////////////////////////////////////////////////

function JSXVectorField(board, mtext, ntext, args) {

	if(args === undefined) {
		args = {};
	}

	var vectors = [];

	var length = args.length ? args.length : 1;
	var density = args.density ? args.density : 1;
	var color = args.color ? args.color : 'red';

	var bounds = JSXGetBounds(board);

	var mfunc = math.compile(mtext);
	var nfunc = math.compile(ntext);

	for(var i = bounds.xmin; i <= bounds.xmax; i += density) {
		for(var j = bounds.ymin; j <= bounds.ymax; j += density) {

			var x0 = i;
			var y0 = j;

			var u = mfunc.eval( { x: i, y: j } );
			var v = nfunc.eval( { x: i, y: j } );

			var mag = Math.sqrt(u * u + v * v);

			var x1 = x0 + u / mag;
			var y1 = y0 + v / mag;

			//var x1 = x0 + u * 0.01;
			//var y1 = y0 + v * 0.01;

			vectors.push(board.create('arrow', [[x0, y0], [x1, y1]], { color: color, strokeWidth: 2, fixed: true }));

		}
	}

	return vectors;

}
