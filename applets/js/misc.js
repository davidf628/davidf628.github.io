///////////////////////////////////////////////////////////////////////////////
//
// Gets the window bounds of a JSX graph, the return is an object that contains
//   references to the xmin, xmax, ymin, and ymax values. The reason I use
//   this instead of board.getBoundingBox() is because I can never remember
//   the order of the bounds from JSX.
//
///////////////////////////////////////////////////////////////////////////////

function JSXGetBounds(board) {
	var bounds = board.getBoundingBox();
	var box = {
			xmin: bounds[0],
			ymax: bounds[1],
			xmax: bounds[2],
			ymin: bounds[3]
		};
	return box;
}

///////////////////////////////////////////////////////////////////////////////
//
// Sets the window bounds of a JSX graph, the input is expected to be an
//   object that contains an xmin, xmax, ymin and ymax value. If any of these
//   aren't provided, the current window bounds are used for any missing
//   values.
//
///////////////////////////////////////////////////////////////////////////////

function JSXSetBounds(board, bounds, keepAspectRatio) {

	var box = JSXGetBounds(board);

	var xmin = bounds.xmin ? bounds.xmin : box.xmin;
	var xmax = bounds.xmax ? bounds.xmax : box.xmax;
	var ymin = bounds.ymin ? bounds.ymin : box.ymin;
	var ymax = bounds.ymax ? bounds.ymax : box.ymax;

	return board.setBoundingBox([xmin, ymax, xmax, ymin], keepAspectRatio);
}

function combineRegex(regexes) {
    let new_regex = '';
    for (let regex of regexes) {
        new_regex += regex.source;
    }
    //let allFlags = regex1.flags + regex2.flags;
    //let uniqueFlags = new Set(allFlags.split(''));
    //allFlags = [...uniqueFlags].join('');
    //let combined = new RegExp(regex1.source + regex2.source, allFlags);
    return new RegExp(new_regex);
}

function htmlify(str) {
    str = str.replace('<', '&lt;');
    str = str.replace('>', '&gt;');
    return str;
}

function removeSpaces(s) {
	while(s.search(' ') != -1) {
		s = s.replace(' ', '');
	}
	return s;
}

/**
 * Determines whether or not a given object is empty, which is surprisingly
 * difficult in javascript.
 * @param {object} obj - the object to check
 * @returns true if obj === {}
 */
function isEmptyObject(obj) {
    return (obj === undefined) || (Object.keys(obj).length === 0);
}
