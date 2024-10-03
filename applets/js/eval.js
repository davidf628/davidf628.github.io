
/**
 * This function will evaluate a mathematical expression, which can include
 * variables, as long as their values are specified within the object scope.
 * The function also catches any errors and just return NaN instead of throwing
 * an error. MathJS also defines log as the natural logarithm and log10 as the
 * common logarithm, this function adjusts for that.
 * @param expr {string} the mathematical expression to evaluate
 * @param scope {object} the value(s) of any variables within the expresion
 * @returns {number}
 */
function evalstr(expr, scope={}) {
	try {
		expr = replace_logarithms(expr);
		//let v = evaluate(expr, scope);
		let v = math.evaluate(expr, scope);
		return isNaN(v) ? NaN : v;
	} catch (Error) {
		return Number.NaN;
	}
}

/******************************************************************************
 * Evaluates a function expressed as:
 *    2*x - 5, ln(x - 4), etc.
 * Note that there variable is always 'x' and it is assumed that
 *    y = or f(x) = is ommitted from the start.
 * This function allows intervals to be restricted using an
 *  interval formatted as stated in [regex_interval]
 * This function can also evaluate a piecewise defined function
 *  if multiple functions are provided and separated by
 *  semicolons
*/

function evalfunc(f, x, args) {

	if(args === undefined) {
		args = {};
	}

	if(x !== undefined) {

		var variable = args.variable ? args.variable : 'x';

		f = f.toLowerCase();

		// Make sure to ignore points and asymptotes
		if (f.includes(';') || isPoint(f) || isAsymptote(f)) {
			var newf = '';
			f_list = f.split(';');
			for(var i = 0; i < f_list.length; i++) {
				if (!isPoint(f_list[i]) && !isAsymptote(f_list[i])) {
					newf += f_list[i] + ';'
				}
			}
			f = newf.substring(0, newf.length - 1);
		}

		//if(f.search(regex_hole) != -1) {
		if (isAsymptote(f)) {
			var interval = getInterval(f);
			var xloc = getHoleValue(interval);
			if(x == xloc) {
				return NaN;
			}
			f = removeInterval(f);
		}

		// if f includes a restricted interval, handle that
		//if(f.search(regex_interval) != -1) {
		if (isPoint(f)) {

			x_on_interval = false;

			if(f.includes(';')) {
				f_list = f.split(';');
			} else {
				f_list = [f];
			}
			for (var i = 0; i < f_list.length; i++) {
				var loc = f_list[i].search(regex_interval);
				if(loc != -1) {
					interval = f_list[i].substring(loc, f_list[i].length);
					lowerbound = getLowerEndpoint(interval);
					upperbound = getUpperEndpoint(interval);
					var upperboundclosed = !upperBoundOpen(interval);
					var lowerboundclosed = !lowerBoundOpen(interval);
					if((x > lowerbound) && (x < upperbound)) {
						f = f_list[i].substring(0, loc);
						x_on_interval = true;
					}
					if((x == lowerbound) && lowerboundclosed) {
						f = f_list[i].substring(0, loc);
						x_on_interval = true;
					}
					if((x == upperbound) && upperboundclosed) {
						f = f_list[i].substring(0, loc);
						x_on_interval = true;
					}
				}
			}
			if(!x_on_interval) {
				return NaN;
			}
		}

		// math.js doesn't support ln
		f = replace_logarithms(f);

		var expr = compile(f);
		var parameter = {};
		parameter[variable] = x;

		var val = expr.evaluate(parameter);

		// math.js returns complex numbers for negative values of logs, etc. This
		// code below makes sure to only return real numbers

		if (typeof(val) == 'object') {
			return NaN;
		} else {
			//return parseFloat(val);
			return val;
		}

	} else {
	 	return parseFloat(evalstr(f));
 	}
}


/******************************************************************************
 * MathJS uses log for a natural logarithm, and log10 for a common logarithm,
 * this function just replaces these names to match the more standard notation
 * with mathematics.
 * @expr {string} the mathematical expression to correct the logarithm names
 */
function replace_logarithms(expr) {
	// Find and replace the logarithm names, be sure to do this in the correct
	// order or else the names might mess themselves up.
	expr = expr.replace(/log\(/g, 'log10(');
	expr = expr.replace(/ln\(/g, 'log(');
	return expr;
}
