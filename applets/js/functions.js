
///////////////////////////////////////////////////////////////////////////////
//
// Exchanges constansts pi and e to numbers and eliminates instances of
//   implicit multiplication
//
///////////////////////////////////////////////////////////////////////////////

function preprocessFunction (s) {

	// convert any instances of implicit multiplication to explicit form
	s = math.parse(s).toString({ implicit: 'show' });

	// convert any constants 'e' or 'pi' to numbers
	//s = Parser.parse(s).simplify({ e: E, pi: PI }).toString();
	s = math.simplify(s, { e: E, pi: PI }).toString();

	return s;
}



///////////////////////////////////////////////////////////////////////////////
//
// Checks to see if a function is implicitly defined by seeing if the math.js
//   parser can parse it. If not, then it is implicit, otherwise it is
//   explicit.
//
///////////////////////////////////////////////////////////////////////////////

function isImplicitEquation(expression) {
	try {
		math.parse(expression);
	} catch(err) {
		return true;
	}
	return false;
}

/**
 * Determines whether the given relation is in the form: y=f(x). This also
 * allows for functions where no 'y=' is specified, as long as the only
 * variable is 'x'
 * @param {string} relation - the mathematical relation to check
 * @returns {boolean} true if the relation is a function, false otherwise
 */
function isFunction(relation) {
    let vars = getVariables(removeInterval(relation));
    let fname = getFunctionName(relation);
    if (fname == 'x' || fname == 'r') {
        return false;
    } else {
        return (fname == 'y') || (vars.length == 1 && vars[0] == 'x') || (vars.length == 0);
    }
}

/**
 * Determines whether the given relation is in the form: x=g(y).
 * @param {string} relation - the mathematical relation to check
 * @returns {boolean} true if the relation is a function, false otherwise
 */
function isXFunction(relation) {
    let vars = getVariables(removeInterval(relation));
    let fname = getFunctionName(relation);
    if (fname == 'y' || fname == 'r') {
        return false;
    } else {
        return (fname == 'x') || (vars.length == 1 && vars[0] == 'y');
    }
}

function isVectorFunction(relation) {
    relation = removeSpaces(removeInterval(relation));
    let vars = getVariables(relation);
    if (vars.length == 1 && vars[0] == 't') {
        if (relation.slice(0,1) == '<' && relation.slice(-1) == '>' && relation.search(',') !== -1) {
            return true;
        }
    }
    return false;
}

function isPolarFunction(relation) {
    let fname = getFunctionName(relation);
    let vars = getVariables(removeInterval(relation));
    if ((fname == 'x') || (fname == 'y')) {
        return false;
    } else {
        return (fname == 'r') || (vars.length == 1 && vars[0] == 't');
    }
}

/**
 * Gets the parametric functions from a string in the form <f(t),g(t)>
 * @param {*}
 * @returns
 */
function getParametricFunctions(relation) {
    relation = removeSpaces(relation);
    relation = relation.slice(1, -1);
    return relation.split(',');
}

///////////////////////////////////////////////////////////////////////////////
//
// Converts an implicit equation to an explcit expression by finding the
//   equals sign in the equation, and negating all terms on the right-hand
//   side of the equation. Then the right and left sides are combined.
//
///////////////////////////////////////////////////////////////////////////////

function convertImplicitEquation(expression) {

	var equalloc = expression.search('=');
	var LH = expression.substring(0, equalloc);
	var RH = expression.substring(equalloc + 1, expression.length);
	var newRH = '';

	if(RH.charAt(0) != '+') {
		RH = '+' + RH;
	}

	for(var i = 0; i < RH.length; i++) {
		if(RH[i] == '+') {
			newRH += '-';
		} else if(RH[i] == '-') {
			newRH += '+';
		} else {
			newRH += RH[i];
		}
	}

	return LH + newRH;

}

///////////////////////////////////////////////////////////////////////////////
//
// Removes the function name from an equation. This is assumed to be on the
//   left-hand side of the equation, and in explicit form.
//
///////////////////////////////////////////////////////////////////////////////

function removeFunctionName(expression) {
	if(expression.search('=') != -1) {
		return expression.split('=')[1];
	} else {
		return expression;
	}
}


/**
 * Determines the name of an explicity defined function of the form y=f(x).
 * Ignores implicity defined functions and parametric sets of equations.
 * @param {string} expression - the mathematical expression to check
 * @returns a character representing the function name, or else an empty string
 */
function getFunctionName(expression) {

	var fname = '';
    try {
        var node = math.parse(expression);
        node.traverse(
            function(node, path, parent) {
                if(node.type == 'AssignmentNode' || node.type == 'FunctionAssignmentNode') {
                    fname = node.name;
                }
            }
        );
    } catch (err) {
        return '';
    }
	return fname;
}


/**
 * Determines the variables that are present in a mathematical expression
 * @param {string} expression - the expression to test
 * @returns an array containing the variables present, or an empty string
 *  if there was a syntax error
 */
function getVariables(expression) {

	// Gets a list of all variables within an expression - note that implicit multiplication doesn't work for two variables in a row
	// So sin(xy) != sin(x*y) as far as math.js is concerned

	let knownConstants = ['e', 'pi', 'i'];
	let knownFunctions = ['abs', 'cbrt', 'ceil', 'cube', 'exp', 'expm1', 'fix', 'floor', 'gcd', 'lcm', 'log', 'log10', 'log1p', 'log2',
		'norm', 'nthRoot', 'pow', 'round', 'sign', 'sqrt', 'square', 'factorial', 'gamma', 'combinations', 'factorial', 'permutations',
		'cumsum', 'mad', 'max', 'mean', 'median', 'min', 'mode', 'prod', 'std', 'sum', 'variance', 'acos', 'acosh', 'acot', 'acoth',
		'acsc', 'acsch', 'asec', 'asech', 'asin', 'asinh', 'atan', 'atan2', 'atanh', 'cos', 'cosh', 'cot', 'coth', 'csc', 'csch', 'sec',
		'sech', 'sin', 'sinh', 'tan', 'tanh'];
	let variables = [];
	let func = getFunctionName(expression);

    // if the expression represents a parametric set of equations then
    // split them up into a single expression where the components are added
    // together. This makes a valid math expression that mathjs can then use
    // to determine the variables involved.
    if (func == '') {
        // Check to see if the equation is in parametric form
        if (expression.slice(0,1) == '<' && expression.slice(-1) == '>'
                && expression.search(',') !== -1) {
            expression = expression.slice(1, -1);
            expression = expression.split(',').join('+');
        }
        // Assume then the equation is in implicit form
        expression = convertImplicitEquation(expression);
    }

    try {
        let node = math.parse(expression);

        node.traverse(
            function(node, path, parent) {
                if (node.type == 'SymbolNode') {
                    if (node.name !== func
                        && !knownConstants.includes(node.name)
                        && !knownFunctions.includes(node.name)
                        && !variables.includes(node.name)) {

                        variables.push(node.name);
                    }
                }
            }
        );
        return variables;

    } catch (err) {
        // math.js found a syntax error and therefore varibles could not be found
        return '';
    }

}

function makeJSFunction(board, s, variable) {

	variable = variable === undefined ? 'x' : variable;
	//s = preprocessFunction(s);

	return board.jc.snippet(s, true, variable, false);
}
