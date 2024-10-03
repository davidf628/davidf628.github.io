
// Pattern for a restricted interval:

const interval_pattern =
    [ /(\(|\[|\{)\s*/,                         // (, [, or {
      /[\w\+\-\*\/\^\(\)\.]*\s*/,               // -2, 1.8, -inf, -oo, pi/2, etc.
      /,\s*/,                                   // ,
      /[\w\+\-\*\/\^\(\)\.]*\s*/,               //  -2, 1.8, +inf, +oo, pi/4, etc.
      /(\)|\]|\})/ ];                          // ), ], or }
const regex_interval = combineRegex(interval_pattern);


// Pattern for a hole in the graph:

const hole_pattern =
        /[Xx]\s*!=\s*/ +            // x !=
        /(-?\d*\.?\d*)/;            // -2, 1.8, etc.
const regex_hole = combineRegex(hole_pattern);

/******************************************************************************
 * A function can be defined such as: y = 2x-5 (-2,5] and the interval needs
 *  to be removed for graphing this function determines if an interval exists
 *  and returns it if so, or a blank string if it does not
 * @param relation {string} The relation to check for an interval
 * @returns if an interval exists, it will return the interval. If no interval
 *  exists then it will return '', and if a syntax error occurs in the interval
 *  then 'undefined' is returned
*/
function getInterval(relation) {

    // Look for the 'on' keyword to identify a restricted interal
    if (relation.search('on') !== -1) {
        relation = removeSpaces(relation);
        let interval_start = relation.search('on')+2;
        let interval = relation.substring(interval_start);
        if ((interval.search(regex_interval) !== -1) || (interval.search(regex_hole) !== -1)) {
            return interval;
        } else {
            console.error(`\n${relation} contains a mal-formed interval\n`);
            return undefined;
        }
    } else {
        return '';
    }

}

/**
 * Removes the specified interval from a function string
 * @param {string} relation an expression of the form y=2x+5 (-2,5)
 * @returns the expression without the specified interval
 */
function removeInterval(relation) {
    relation = relation.replace(getInterval(relation),'');
    relation = relation.replace('on','').trim();
    return relation;
}

function spliceInterval(relation) {
    let interval = getInterval(relation);
    let func = removeInterval(relation);
    return [func, interval];
}

///////////////////////////////////////////////////////////
//
// Gets the lower and bound of a interval expressed as:
//     (-2,5), (1.5, 10], (-inf,2), [2, infinity)
//
////////////////////////////////////////////////////////////

function getLowerEndpoint(interval) {
    if (interval !== '') {
        interval = removeSpaces(interval);
        let l = interval.split(',');
        l[0] = l[0].substring(1, l[0].length);
        if(l[0].includes('inf') || l[0].includes('-oo')) {
            return NEGATIVE_INFINITY;
        } else {
            return evalstr(l[0]);
        }
    } else {
        return NEGATIVE_INFINITY;
    }
}

function getUpperEndpoint(interval) {
	if (interval !== '') {
        interval = removeSpaces(interval);
        let l = interval.split(',');
        l[1] = l[1].substring(0, l[1].length - 1);
        if(l[1].includes('inf') || l[1].includes('oo')) {
            return POSITIVE_INFINITY;
        } else {
            return evalstr(l[1]);
        }
    } else {
        return POSITIVE_INFINITY;
    }
}

function getEndpoints(interval) {
    let lower_val = getLowerEndpoint(interval);
    let upper_val = getUpperEndpoint(interval);
    return [lower_val, upper_val];
}

function getHoleValue(interval) {
	return evalstr(interval.split('=')[1]);
}

/////////////////////////////////////////////////////////////////
//
// Determines whether an interval is open or closed on the
//   upper or lower limit.
//
/////////////////////////////////////////////////////////////////

function isInterval(interval) {
    interval = removeSpaces(interval);
    let regex = combineRegex( [/^/, regex_interval, /$/ ]);
    return interval.search(regex) != -1;
}

function lowerBoundOpen(interval) {
	return isInterval(interval) && interval.includes('(');
}

function upperBoundOpen(interval) {
	return isInterval(interval) && interval.includes(')');
}

function lowerBoundClosed(interval) {
	return isInterval(interval) && interval.includes('[');
}

function upperBoundClosed(interval) {
	return isInterval(interval) && interval.includes(']');
}

function isClosedInterval(interval) {
    return lowerBoundClosed(interval) && upperBoundClosed(interval);
}

function isOpenInterval(interval) {
    return lowerBoundOpen(interval) && upperBoundOpen(interval);
}

/**
 * Determines if a relation given represents a point or not, which should be
 *  of the form (x, y) or [x, y]
 * @param relation {string} the relation to check
 */
function isPoint(relation) {
	return isOpenInterval(relation) || isClosedInterval(relation);
}

/**
 * Determines if a relation given represents a solid point to plot. This is
 * confusing because (x,y) is the form of a solid point.
 * @param relation {string} the relation to check
 */
function isClosedPoint(relation) {
    return isOpenInterval(relation);
}

/**
 * Determines if a relation given represents a solid point to plot. This is
 * confusing because [x,y] is the form of an open circle.
 * @param relation {string} the relation to check
 */
function isOpenPoint(relation) {
    return isClosedInterval(relation);
}

/******************************************************************************
 * Determines if a relation contains an asymptote restriction or not, which
 *  should be of the form x != 5
 * @param relation {string} The relation to check
 * @todo Rename this function containsAsymptote
 */
function isAsymptote(relation) {

/*	let intervalstart = relation.search(regex_hole);
 	if (intervalstart != -1) {
		let interval = relation.substring(intervalstart, relation.length).trim();
		let relation = relation.substring(0, intervalstart).trim();
	}

	return relation === ''; */
	return relation.search(regex_hole) != -1;

}

/******************************************************************************
 * Determines if a value exists between two values, assumes an open interval.
 *  However, an additional parameter can be supplied indicating if the
 *  interval is closed.
 * @param x {number} The value to test
 * @param lower {number} The lower bound of the interval
 * @param upper {number} The upper bound of the interval
 * @param closed {boolean} Set to true if you want the bounds included
 * @returns true if x is on the interval, and false otherwise
 */

function isBetween(x, lower, upper, closed) {
    if (closed) {
        return (x >= lower) && (x <= upper);
    } else {
        return (x > lower) && (x < upper);
    }
}
