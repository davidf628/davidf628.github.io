///////////////////////////////////////////////////////////////////
//
// Displays the value of a function using a little more
//    logic than the default printing operation.
//
// Leading and trailing zeros are ommitted.
//
////////////////////////////////////////////////////////////////////

function displayNumber(val) {
	if(Math.abs(val) < 0.00000000000001) {
		return "0";
	}
	if(Math.abs(val) < 0.00001) {
		return val.toExponential(3);
	} else {
		if(typeof(val) !== 'undefined') {
			s = val.toFixed(4);
			if(s.includes('.')) {
				while(s.slice(-1) == '0') {
					s = s.substring(0, s.length - 1);
				}
				if(s.slice(-1) == '.') {
					s = s.substring(0, s.length - 1);
				}
			}
			if(s.includes('e')) {
				s = s.substring(0, 4) + s.substring(s.indexOf('e'),s.length);
			}
			return s;
		}
	}
	return '';
}

///////////////////////////////////////////////////////////////////
//
// double-values often have junk at the end, this function attempts
// to remove that junk so that calculations are a little more
// accurate.
//
////////////////////////////////////////////////////////////////////

function trimNumber(val) {

	// Make each number accurate to 12 decimal places - this also
	// has the effect of rounding numbers like 1.99999999999 to 2

	var s = val.toFixed(12);

	if(s.includes('.')) {

		// Remove any trailing zeros

		while(s.slice(-1) == '0') {
			s = s.substring(0, s.length - 1);
		}

		// If so many trailing zeros are removed that you
		// end up at a decimal, then this is an integer and
		// remove the decimal to make it so

		if(s.slice(-1) == '.') {
			s = s.substring(0, s.length - 1);
		}
	}

	return s;
}

///////////////////////////////////////////////////////////////////////////////
//
//  Displays the value of a number to a fixed number of decimal places, if
//    necessary.
//
///////////////////////////////////////////////////////////////////////////////

function formatNumber(val, dec) {
	s = val.toFixed(dec);
	if(s.includes('.')) {
		while(s.slice(-1) == '0') {
			s = s.substring(0, s.length - 1);
		}
		if(s.slice(-1) == '.') {
			s = s.substring(0, s.length - 1);
		}
	}
	if(s.includes('e')) {
		s = s.substring(0, 4) + s.substring(s.indexOf('e'),s.length);
	}
	return s;
}

/******************************************************************************
 * This function attempts to create a better presentation of mathematical
 *  expressions by removing things like 0 * something, 1 * something, etc.
 */
function makepretty(exp) {
        exp = exp.replaceAll(/\+\s*\-/g, "-");
        exp = exp.replaceAll(/\-\s*\+/g, "-");
        exp = exp.replaceAll(/\-\s*\-/g, "+");
        exp = exp.replaceAll(/\+\s*\+/g, "+");
        exp = exp.replaceAll(/\*\s*1(\D|$)/g, "$1"); // x*1 = x
        exp = exp.replaceAll(/(\D|^)(1\s*\*|1\s*\**([a-zA-Z\(]))/g, "$1$3"); // 1*x = x
        exp = exp.replaceAll(/(^|[\=\(\+\-])\s*(0\s*\*?)([a-zA-Z](\^[\-\d\.]+)*)/g, "$1"); //3+0x-4 -> 3-4
        exp = exp.replaceAll(/\+\s*\-/g, "-");
        exp = exp.replaceAll(/\-\s*\+/g, "-");
        exp = exp.replaceAll(/\-\s*\-/g, "+");
        exp = exp.replaceAll(/\+\s*\+/g, "+");
        exp = exp.replaceAll(/(^|[\(])\s*0(\s*[\+\-\)])/g, "$1");  //0+x, 0-x
        exp = exp.replaceAll(/\+\s*\-/g, "-");
        exp = exp.replaceAll(/\-\s*\+/g, "-");
        exp = exp.replaceAll(/\-\s*\-/g, "+");
        exp = exp.replaceAll(/\+\s*\+/g, "+");
        exp = exp.replaceAll(/[\+\-]\s*0(\)|\D|$)/g, "$1");  // x+0, x-0
        exp = exp.replaceAll(/\+\s*\-/g, "-");
        exp = exp.replaceAll(/\-\s*\+/g, "-");
        exp = exp.replaceAll(/\-\s*\-/g, "+");
        exp = exp.replaceAll(/\+\s*\+/g, "+");
        exp = exp.replaceAll(/=\s*\+/g, "="); // =+2x -> =2x
        exp = exp.replaceAll(/\+\s*\-/g, "-");
        exp = exp.replaceAll(/\-\s*\+/g, "-");
        exp = exp.replaceAll(/\-\s*\-/g, "+");
        exp = exp.replaceAll(/\+\s*\+/g, "+");
        if (exp[0] == "+") {
            exp = exp.substring(1);
            return exp == "" ? "0" : exp;
        }
        exp = exp.replaceAll(/^([a-zA-Z])\s*=\s*$/g,"$1=0");
        return exp;
}
