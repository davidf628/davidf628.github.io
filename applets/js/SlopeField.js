
//////////////////////////////////////////////////////////////////////////////
//
// function to create a slope field
//
//    length - the length of the slope line, default is 1
//    density - the distance between each slope that is calculated
//    color - the color of the slope lines
//
///////////////////////////////////////////////////////////////////////////////

function JSXSlopeField(board, derivative, args) {

	var length = 1;
	var density = 1;
	var color = 'blue';

	var linesegs = [];

	if(args !== undefined) {
		length = args.length ? args.length : length;
		density = args.density ? args.density : density;
		color = args.color ? args.color : color;
	}

	var bounds = JSXGetBounds(board);

	for(var i = bounds.xmin; i <= bounds.xmax; i += density) {
		for(var j = bounds.ymin; j <= bounds.ymax; j += density) {
			var slope = evalstr(derivative, { x: i, y: j });
			var magnitude = Math.sqrt(1 + slope*slope);
			var x1 = i + length / (2 * magnitude)  ;
			var x2 = i - length / (2 * magnitude);
			var y1 = slope * (x1 - i) + j;
			var y2 = slope * (x2 - i) + j;
			linesegs.push(board.create('segment', [[x1, y1], [x2, y2]], { color: color, strokeWidth: 1, fixed: true }));
		}
	}

	return linesegs;

}
