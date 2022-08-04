// Dependencies:
//
//  - jsxgraph is required for any jsx functions
//  - math.js is required for evaluations and drawing graphs

// Useful constants

PI        = 3.14159265358979323846;
E         = 2.71828182845904523536;
LN2       = 0.69314718055994530942;
LN10      = 2.30258509299404568402;
PHI       = 1.61803398874989484821;
LNPI      = 1.14472988584940017414;
LNSQRT2PI = 0.91893853320467274178;
SQRT2PI   = 2.50662827463100050242;

NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
POSITIVE_INFINITY = Number.POSITIVE_INFINITY;

MAXGAM  = 34.648;
MAXFACT = 170;
MAXGAM  = 34.648;
MAXLGM  = 1.0383E+36;
MACHEP  = 1.08420217248550444E-19;
BIG     = 9.223372036854775808E18;
BIGINV  = 1.084202172485504434007E-19;

MAXDOUBLE = Number.MAX_VALUE;
MINDOUBLE = Number.MIN_VALUE;
MAXINT    = Number.MAX_SAFE_INTEGER;
MININT    = Number.MIN_SAFE_INTEGER;
MAXLOG    = Math.log(MAXDOUBLE);
MINLOG    = Math.log(MINDOUBLE);

dashsetting = 3;

// Convenience functions
function abs(x) { return Math.abs(x); }
function sqr(x) { return Math.pow(x, 2); }
function sqrt(x) { return Math.sqrt(x); }
function pow(x, a) { return Math.pow(x, a); }
function odd(x) { return (x % 2) == 1; }
function even(x) { return (x % 2) == 0; }
function ln(x) { return Math.log(x); }
function log(x) { return Math.log(x) / Math.log(10); }
function logb(x) { return Math.log(x) / Math.log(b); }
function ceil(x) { return Math.ceil(x); }
function floor(x) { return Math.floor(x); }
function swap(a, b) { return [b, a]; }
function sort(list) { return list.sort(function(a, b) { return a - b; }); }
function round(x, a=0) { return Math.round(x * Math.pow(10, a)) / Math.pow(10, a); }
function min(a, b) { return a <= b ? a : b; }
function max(a, b) { return a >= b ? a : b; }

function evalstr(expr, scope={}) {
	try {
		let v = math.evaluate(expr, scope);
		return isNaN(v) ? NaN : v;
	} catch (Error) {
		return Number.NaN;
	}
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

///////////////////////////////////////////////////////////////////////////////
//
//  Creates a random integer between a and b, inclusive
//
//		@param a - minimum value for the random number
//		@param b - maximum value for the random number
//
///////////////////////////////////////////////////////////////////////////////

function randomInteger(a, b) {
	return Math.floor((b-a+1) * Math.random()) + a;
}

///////////////////////////////////////////////////////////////////////////////
//
//  Creates a random float between a and b, inclusive
//
//		@param a - minimum value for the random number
//		@param b - maximum value for the random number
//
///////////////////////////////////////////////////////////////////////////////

function randomFloat(a, b) {
	return Math.random() * (b - a + 2) + a - 1;
}

///////////////////////////////////////////////////////////////////////////////
//
//  Shuffles an array. Uses the Fisher-Yates (aka Knuth) Shuffle algorithm
//
//	@param array - the array to re-order the elements of
//
///////////////////////////////////////////////////////////////////////////////

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

/*
		Returns the factorial of n if 0 <= n <= 170 and n is an integer,
		or else 0 is returned.

		You will get creepy results if n is not an integer.
*/
function factorial (n) {

	var i, fact = 1;

	if ((n <= MAXFACT) && (n >= 0)) {
		for(i = n; i >= 1; i--) {
			fact *= i;
		}
	}
	else fact = 0;

	return fact;
}

/*
		Returns the number of permutations of n objects taken r at a time.

		Beware the use of non-integer values for n and r!
*/
function permutation (n, r) {
		return (factorial(n) / factorial(n - r));
}

/*
		Returns the number of combinations of n objects taken r at a time.

		Beware the use of non-integer values for n and r!
*/
function combination (n, r) {
		return (factorial(n) / (factorial(r) * factorial(n - r)));
}

/*
		Returns the binomial probability of x successes for n trials and
		probability of success p.

*/

function binompdf(n, p, x) {
	return combination(n, x) * Math.pow(p, x) * Math.pow(1 - p, n - x);
}

function binomcdf(n, p, x) {
	var sum = 0;
	var i;
	for(i = 0; i <= x; i++) {
		sum += binompdf(n, p, i);
	}
	return sum;
}

/*
	Calculates normal distribution values. Used to draw bell curves.
*/
function normalpdf(x, mean, stdev) {
	mean = mean || 0;
	stdev = stdev || 1;
	var scale = 1 / Math.sqrt(2 * Math.PI * Math.pow(stdev, 2));
	var z = (x - mean) / stdev;
	var exponent = -0.5 * Math.pow(z, 2);
	return scale * Math.exp(exponent);
}

/*
	Calculates probabilites based on a normal distribution. Approximations
	found using Taylor Polynomials.
*/

function normalcdf(z) {

	var coeff;
	var n = 0;
	var sum = 0;
	var a = 0;
	var b = 0.1;
	var precision = 1E-16;

	if (z > 3.9) {
		return 1.0;
	} else if (z < -3.9) {
		return 0.0;
	} else while (Math.abs(b - a) > precision) {
		a = b;
		coeff = Math.pow(-1, n) / (factorial(n) * Math.pow(2, n) * (2 * n + 1));
		b = coeff * Math.pow(z, 2 * n + 1);
		sum += b;
		n++;
	}

	return 0.5 + (1 / Math.sqrt(2 * Math.PI)) * sum;

}

function invnorm(p)
{
	//
	// Lower tail quantile for standard normal distribution function.
	//
	// This function returns an approximation of the inverse cumulative
	// standard normal distribution function.  I.e., given P, it returns
	// an approximation to the X satisfying P = Pr{Z <= X} where Z is a
	// random variable from the standard normal distribution.
	//
	// The algorithm uses a minimax approximation by rational functions
	// and the result has a relative error whose absolute value is less
	// than 1.15e-9.
	//
	// Author:      Peter J. Acklam
	// (Javascript version by Alankar Misra @ Digital Sutras (alankar@digitalsutras.com))
	// Time-stamp:  2005-11-29 10:01:53 +01:00
	// E-mail:      pjacklam@online.no
	// WWW URL:     http://home.online.no/~pjacklam

	// An algorithm with a relative error less than 1.15�10-9 in the entire region.

	// Coefficients in rational approximations
	var a = new Array (-3.969683028665376e+01,  2.209460984245205e+02,
					   -2.759285104469687e+02,  1.383577518672690e+02,
					   -3.066479806614716e+01,  2.506628277459239e+00);

	var b = new Array (-5.447609879822406e+01,  1.615858368580409e+02,
					   -1.556989798598866e+02,  6.680131188771972e+01,
					   -1.328068155288572e+01 );

	var c = new Array (-7.784894002430293e-03, -3.223964580411365e-01,
					   -2.400758277161838e+00, -2.549732539343734e+00,
					    4.374664141464968e+00,  2.938163982698783e+00);

	var d = new Array (7.784695709041462e-03,  3.224671290700398e-01,
					   2.445134137142996e+00,  3.754408661907416e+00);

	// Define break-points.
	var plow  = 0.02425;
	var phigh = 1 - plow;

	// Rational approximation for lower region:
	if ( p < plow ) {
		var q  = Math.sqrt(-2 * Math.log(p));
		return (((((c[0]*q + c[1])*q + c[2])*q + c[3])*q + c[4])*q + c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
	}

	// Rational approximation for upper region:
	if ( phigh < p ) {
		var q  = Math.sqrt(-2*Math.log(1-p));
		return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
	}

	// Rational approximation for central region:
	var q = p - 0.5;
	var r = q * q;
	return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}

///////////////////////////////////////////////////////////////////////////////
//
//  Calculates the t-distribution pdf for a given value of tc and degrees of
//  freedom. Formula for the pdf found at wikipedia.org.
//
// 		@param t - The t-score with which to find the point on the
//			t-distribution curve
// 		@param df - Number of degrees of freedom
//
//  	@return The point on the t-distribution curve with df degrees of
//   		freedom at a given t-score.
//
///////////////////////////////////////////////////////////////////////////////

function tpdf(t, df) {
	var p, q;

	if (df < 1) {
		return NaN;
	} else {
		p = 0.5 * (df + 1);
		q = 0.5 * df;
		var s1 = gamma(p) / (Math.sqrt(df * PI) * gamma(q));
		var s2 = Math.pow(1 + sqr(t) / df, -p);
		return s1 * s2;
	}
}

 //////////////////////////////////////////////////////////////////////////////
 //
 //  Calculates the t-distribution cdf for a given value of tc and degrees of
 //  	freedom. Formula for the cdf derived from distrib.mac from Maxima.
 //
 //		@param t - The t-score with which to calculate the cumulative area
 //     		   under the t-dist curve to the left of
 //
 //     @param df - The number of degrees of freedom
 //
 //     @return Cumulative t probability from -inf up to the given value of t
 //
 //////////////////////////////////////////////////////////////////////////////

function tcdf(t, df) {
	if(df < 1) {
		return NaN;
	} else {
		if(t >= 0.0) {
			return 1.0 - iBeta(df / 2.0, 0.5, df / (df + sqr(t))) / 2;
		} else {
			return iBeta(df / 2.0, 0.5, df / (df + sqr(t))) / 2;
		}
	}
}

///////////////////////////////////////////////////////////////////////////////
//
//  Converts a probability into a t-score. Algorithm from Maxima.
//
//     @param p - Probability
//     @param df - Number of Degrees of Freedom
//
//     @return The t-score that corresponds to a probability given, based on
//       		a number of degrees of freedom within the distribution.
//
///////////////////////////////////////////////////////////////////////////////

function tinv (p, df) {

	if(p == 0.0) return -Infinity;
	if(p == 1.0) return Infinity;
	if(p == 0.5) return 0.0;

	var aux = 0.0;
	var sgn = 0;

	if(p < 0.5) {
		aux = 2 * p;
		sgn = -1;
	} else {
		aux = 2 * (1 - p);
		sgn = 1;
	}
	return sgn * Math.sqrt(df * (1 / iiBeta(aux, df / 2.0, 0.5) - 1));

}

var stats = {

	///////////////////////////////////////////////////////////////////////////////
	//  Finds the minimum value in an array of numbers.
	///////////////////////////////////////////////////////////////////////////////

	min: function(list) {
		var min = MAXDOUBLE
		for(var i = 0; i < list.length; i++) {
			if(list[i] < min) {
				min = list[i];
			}
		}
		return min;
	},

	///////////////////////////////////////////////////////////////////////////////
	//  Finds the maximum value in an array of numbers.
	///////////////////////////////////////////////////////////////////////////////

	max: function(list) {
		var max = MINDOUBLE;
		for(var i = 0; i < list.length; i++) {
			if(list[i] > max) {
				max = list[i];
			}
		}
		return max;
	},

	///////////////////////////////////////////////////////////////////////////////
	//  Calculates the value of the median in an array
	///////////////////////////////////////////////////////////////////////////////

	median: function(list) {
		var a = sort(list);
		var mid = a.length / 2;
		var med = MINDOUBLE;
		if (a.length % 2 == 0) {
			med = (a[mid - 1] + a[mid]) / 2;
		} else {
			med = a[Math.floor(mid)];
		}
		return med;
	},

	///////////////////////////////////////////////////////////////////////////////
	//  Calculates q1 for the values of the items in an array
	///////////////////////////////////////////////////////////////////////////////

	q1: function(list) {
		var a = sort(list);
		var mid = a.length / 2;
		return stats.median(a.slice(0, Math.floor(mid)));
	},

	//////////////////////////////////////////////////////////////////////////////
	//  Calculates q1 for the values of the items in an array
	//////////////////////////////////////////////////////////////////////////////

	q3: function(list) {
		var a = sort(list);
		var mid = a.length / 2;
		return stats.median(a.slice(Math.ceil(mid), a.length));
	},

	///////////////////////////////////////////////////////////////////////////
	//  Computes the sum of an array of numbers.
	///////////////////////////////////////////////////////////////////////////

	sum: function(list) {
		var s = 0;
		for(var i = 0; i < list.length; i++) {
			s += list[i];
		}
		return s;
	},

	//////////////////////////////////////////////////////////////////////////////
	//  Computes the sum of the squares of an array of numbers.
	//////////////////////////////////////////////////////////////////////////////

	sumofsqr: function(list) {
		var s = 0;
		for(var i = 0; i < list.length; i++) {
			s += sqr(list[i]);
		}
		return s;
	},

	///////////////////////////////////////////////////////////////////////////
	//  Calculates the arithmetic mean of a set of values.
	///////////////////////////////////////////////////////////////////////////

	mean: function(list) {
		return stats.sum(list) / list.length;
	},

	///////////////////////////////////////////////////////////////////////////
	//  Calculates the arithmetic mean of a set of values,
	//   subject to an array of frequencies.
	///////////////////////////////////////////////////////////////////////////

	wmean: function(list, freq) {

		if (list.length != freq.length) {
			return NaN;
		}

		for (var i = 0; i < freq.length; i++) {
			if (freq[i] < 0) {
				return NaN;
			}
		}

		var s = 0;
		for(var i = 0; i < list.length; i++) {
			s += list[i] * freq[i];
		}
		return s / stats.sum(freq);

	},

	//////////////////////////////////////////////////////////////////////////////
	//  Calculates the sample standard deviation of a set of values.
	//////////////////////////////////////////////////////////////////////////////

	stdev: function(list) {
		var mu = stats.mean(list);
		var ssd = 0; // sum of squared deviations
		for(var i = 0; i < list.length; i++) {
			ssd += sqr(list[i] - mu);
		}
		return sqrt(ssd / (list.length - 1));
	},

	///////////////////////////////////////////////////////////////////////////////
	//  Calculates the population standard deviation of a set of values.
	///////////////////////////////////////////////////////////////////////////////

	stdevp: function(list) {
		var mu = stats.mean(list);
		var ssd = 0; // sum of squared deviations
		for(var i = 0; i < list.length; i++) {
			ssd += sqr(list[i] - mu);
		}
		return sqrt(ssd / list.length);
	},

	///////////////////////////////////////////////////////////////////////////////
	//  Calculates the number of items in a frequency table. Allows for
	//.   non-integer frequencies.
	///////////////////////////////////////////////////////////////////////////////

	wn: function(list, freq) {
		if (list.length != freq.length) {
			return NaN;
		}

		for (var i = 0; i < freq.length; i++) {
			if (freq[i] < 0) {
				return NaN;
			}
		}
		return stats.sum(freq);
	},

	///////////////////////////////////////////////////////////////////////////////
	//  Finds the weighted minimum value in an array of numbers.
	///////////////////////////////////////////////////////////////////////////////

	wmin: function(list, freq) {
		if (list.length != freq.length) {
			return NaN;
		}

		for (var i = 0; i < freq.length; i++) {
			if (freq[i] < 0) {
				return NaN;
			}
		}
		return stats.min(list);
	},

	///////////////////////////////////////////////////////////////////////////////
	//  Finds the maximum value in an array of numbers.
	///////////////////////////////////////////////////////////////////////////////

	wmax: function(list, freq) {

		if (list.length != freq.length) {
			return NaN;
		}

		for (var i = 0; i < freq.length; i++) {
			if (freq[i] < 0) {
				return NaN;
			}
		}
		return stats.max(list);
	},

	///////////////////////////////////////////////////////////////////////////
	//  Computes the weighted sum of an array of numbers.
	///////////////////////////////////////////////////////////////////////////

	wsum: function(list, freq) {

		if (list.length != freq.length) {
			return NaN;
		}

		for (var i = 0; i < freq.length; i++) {
			if (freq[i] < 0) {
				return NaN;
			}
		}

		var s = 0;
		for(var i = 0; i < list.length; i++) {
			s += list[i] * freq[i];
		}
		return s;
	},

	///////////////////////////////////////////////////////////////////////////
	//  Computes a dot product of two sets of numbers, similar to a weighted
	//  sum, but allows for "frequencies" to be negative.
	///////////////////////////////////////////////////////////////////////////

	innerproduct: function(list1, list2) {

		if (list1.length != list2.length) {
			return NaN;
		}

		var s = 0;
		for(var i = 0; i < list1.length; i++) {
			s += list1[i] * list2[i];
		}
		return s;
	},

	///////////////////////////////////////////////////////////////////////////////
	//  Calculates the weighted median in an array
	///////////////////////////////////////////////////////////////////////////////

	wmedian: function(list, freq) {

		if (list.length != freq.length) {
			return NaN;
		}

		for (var i = 0; i < freq.length; i++) {
			if (freq[i] < 0) {
				return NaN;
			}
		}

		[list, freq] = stats.wsort(list, freq);
		var s = stats.sum(freq);
		var mid = s / 2;
		var csum = 0;
		var index = 0;
		while (csum < mid && index < freq.length) {
			csum += freq[index];
			index += 1;
		}
		return list[index - 1];
	},

	///////////////////////////////////////////////////////////////////////////////
	//  Calculates the weighted value of q1 in an array
	///////////////////////////////////////////////////////////////////////////////

	wq1: function(list, freq) {

		if (list.length != freq.length) {
			return NaN;
		}

		for (var i = 0; i < freq.length; i++) {
			if (freq[i] < 0) {
				return NaN;
			}
		}

		[list, freq] = stats.wsort(list, freq);
		var s = stats.sum(freq);
		var mid = s / 2;
		var csum = 0;
		var index = 0;
		while (csum < mid && index < freq.length) {
			csum += freq[index];
			index += 1;
		}
		return stats.wmedian(list.slice(0, index), freq.slice(0, index));
	},


	///////////////////////////////////////////////////////////////////////////////
	//  Calculates the weighted value of q1 in an array
	///////////////////////////////////////////////////////////////////////////////

	wq3: function(list, freq) {

		if (list.length != freq.length) {
			return NaN;
		}

		for (var i = 0; i < freq.length; i++) {
			if (freq[i] < 0) {
				return NaN;
			}
		}

		[list, freq] = stats.wsort(list, freq);

		var s = stats.sum(freq);
		var mid = s / 2;
		var csum = 0;
		var index = 0;
		while (csum < mid && index < freq.length) {
			csum += freq[index];
			index += 1;
		}
		return stats.wmedian(list.slice(index, list.length), freq.slice(index, freq.length));
	},

	///////////////////////////////////////////////////////////////////////////////
	//  Computes the weighted sum of the squares of an array of numbers.
	///////////////////////////////////////////////////////////////////////////////

	wsumofsqr: function(list, freq) {

		if (list.length != freq.length) {
			return NaN;
		}

		for (var i = 0; i < freq.length; i++) {
			if (freq[i] < 0) {
				return NaN;
			}
		}

		var s = 0;
		for(var i = 0; i < list.length; i++) {
			s += sqr(list[i]) * freq[i];
		}
		return s;
	},

	///////////////////////////////////////////////////////////////////////////////
	//  Calculates the weighted sample standard deviation of a set of values.
	///////////////////////////////////////////////////////////////////////////////

	wstdev: function(list, freq) {

		if (list.length != freq.length) {
			return NaN;
		}

		for (var i = 0; i < freq.length; i++) {
			if (freq[i] < 0) {
				return NaN;
			}
		}

		var mu = stats.wmean(list, freq);
		var ssd = 0; // sum of squared deviations
		for(var i = 0; i < list.length; i++) {
			ssd += freq[i] * sqr(list[i] - mu);
		}
		return sqrt(ssd / (stats.wn(list, freq) - 1));
	},

	///////////////////////////////////////////////////////////////////////////////
	//  Calculates the weighted population standard deviation of a set of values.
	///////////////////////////////////////////////////////////////////////////////

	wstdevp: function(list, freq) {

		if (list.length != freq.length) {
			return NaN;
		}

		for (var i = 0; i < freq.length; i++) {
			if (freq[i] < 0) {
				return NaN;
			}
		}

		var mu = stats.wmean(list, freq);
		var ssd = 0; // sum of squared deviations
		for(var i = 0; i < list.length; i++) {
			ssd += freq[i] * sqr(list[i] - mu);
		}
		return sqrt(ssd / stats.wn(list, freq));
	},

	///////////////////////////////////////////////////////////////////////////////
	//  Computes the linear correlation (Pearson) cofficent for paird data.
	//		@return: NaN - The length of the x and y data sets is different
	//					   or there is not enough data in the data sets.
	///////////////////////////////////////////////////////////////////////////////

	correlation: function(x_data, y_data) {

		if(x_data.length != y_data.length) {
			return NaN;
		}

		if(x_data.length < 2) {
			return NaN;
		}

		var sx = stats.sum(x_data);
		var sy = stats.sum(y_data);
		var sxy = 0;
		var sxx = stats.sumofsqr(x_data);
		var syy = stats.sumofsqr(y_data);
		var n = x_data.length;

		for(var i = 0; i < x_data.length; i++) {
			sxy += x_data[i] * y_data[i];
		}

		var r = (n * sxy - sx * sy) / sqrt( (n * sxx - sqr(sx)) * (n * syy - sqr(sy)) );

		return r;
	},

	///////////////////////////////////////////////////////////////////////////////
	//  Computes the slope and y-intercept of of the line of best fit for a
	//    set of data.
	//		@return: NaN - The length of the x and y data sets is different
	//					   or there is not enough data in the data sets.
	///////////////////////////////////////////////////////////////////////////////

	linreg: function(x_data, y_data) {

		if(x_data.length != y_data.length) {
			return NaN;
		}

		if(x_data.length < 2) {
			return NaN;
		}

		var sx = stats.sum(x_data);
		var sy = stats.sum(y_data);
		var sxy = stats.innerproduct(x_data, y_data);
		var sxx = stats.sumofsqr(x_data);
		var n = x_data.length;

		var m = (n * sxy - sx * sy) / (n * sxx - sqr(sx));
		var b = (sy - m * sx) / n;

		return [m, b];
	},

	///////////////////////////////////////////////////////////////////////////////
	//  Expands an array based on a set of frequencies
	//.    @returns NaN if any frequency is negative or the number of frequencies
	//.        does not match the number data items
	///////////////////////////////////////////////////////////////////////////////

	expandarray: function(list, freq) {

		if (list.length != freq.length) {
			return NaN;
		}

		for (var i = 0; i < freq.length; i++) {
			if ((freq[i] < 0) || (Math.floor(freq[i]) != freq[i])) {
				return NaN;
			}
		}

		var newlist = [];
		for (var i = 0; i < list.length; i++) {
			for (var j = 0; j < freq[i]; j++) {
				newlist.push(freq[i]);
			}
		}
	},

	///////////////////////////////////////////////////////////////////////////////
	//  Sorts two arrays simultaneoulsy by the values in the first array.
	///////////////////////////////////////////////////////////////////////////////

	wsort: function(list, freq) {
		if (list.length != freq.length) {
			return NaN;
		}

		for (var i = 0; i < freq.length; i++) {
			if (freq[i] < 0) {
				return NaN;
			}
		}

		var newArray = [];

		for (var i = 0; i < list.length; i++) {
			newArray.push({ 'x' : list[i],  'f' : freq[i] });
		}

		newArray.sort(function(a, b) {
			return ((a.x < b.x) ? -1 : ((a.x == b.x) ? 0 : 1));
		});

		for (var i = 0; i < newArray.length; i++) {
			list[i] = newArray[i].x;
			freq[i] = newArray[i].f;
		}

		return [list, freq];

	},

}

///////////////////////////////////////////////////////////////////////////////
//  Deprecated functions
///////////////////////////////////////////////////////////////////////////////

function sum(list) {
	console.warn('sum is deprecated, use stats.sum instead');
	return stats.sum(list);
}

function sumofsqr(list) {
	console.warn('sumofsqr is deprecated, use stats.sumofsqr instead');
	return stats.sumofsqr(list);
}

function mean(list) {
	console.warn('mean is deprecated, use stats.mean instead');
	return sum(list) / list.length;
}

function stdevp(list) {
	console.warn('stdevp is deprecated, use stats.stdevp instead');
	return stats.stdevp(list);
}

function stdev(list) {
	console.warn('stdev is deprecated, use stats.stdev instead');
	return stats.stdev(list);
}

function correlation(x_data, y_data) {
	console.warn('correlation is deprecated, use stats.correlation instead');
	return stats.correlation(x_data, y_data);
}


///////////////////////////////////////////////////////////////////////////////
//
//  This function will calculate the gamma function for any float value,
//      this is adapted from J. Debord's FMATH.PAS.
//
///////////////////////////////////////////////////////////////////////////////

function gamma(x) {

		var p = [
						4.212760487471622013093E-5,
						4.542931960608009155600E-4,
						4.092666828394035500949E-3,
						2.385363243461108252554E-2,
						1.113062816019361559013E-1,
						3.629515436640239168939E-1,
						8.378004301573126728826E-1,
						1.000000000000000000009E0,
						0.0, 0.0 ];

		var q = [
						-1.397148517476170440917E-5,
						2.346584059160635244282E-4,
						-1.237799246653152231188E-3,
						-7.955933682494738320586E-4,
						2.773706565840072979165E-2,
						-4.633887671244534213831E-2,
						-2.243510905670329164562E-1,
						4.150160950588455434583E-1,
						9.999999999999999999908E-1,
						0.0 ];

		var sgnGam, n;
		var a, x1, z;

		sgnGam = sgnGamma(x);

		if((x == 0.0) || ((x < 0.0) && (frac(x) == 0.0))) {
				return NaN;
		}

		if(x > MAXGAM) {
				return Infinity;
		}

		a = Math.abs(x);
		if(a > 13.0) {
				if(x < 0.0) {
						n = Math.trunc(a);
						z = a - n;
						if(z > 0.5) {
								n = n + 1;
								z = a - n;
						}
						z = Math.abs(a * Math.sin(Math.PI * z)) * stirf(a);
								if(z <= PI / MAXDOUBLE) {
										return Infinity;
								}
								z = PI / z;
				} else {
						z = stirf(x);
				}
				return sgnGam * z;
		} else {
				z = 1.0;
				x1 = x;
				while(x1 >= 3.0) {
						x1 = x1 - 1.0;
						z = z * x1;
				}
				while(x1 < -0.03125) {
						z = z / x1;
						x1 = x1 + 1.0;
				}
				if(x1 <= 0.03125) {
						return gamSmall(x1, z);
				} else {
						while(x1 < 2.0) {
								z = z / x1;
								x1 = x1 + 1.0;
						}
						if((x1 == 2.0) || (x1 == 3.0)) {
								return z;
						} else {
								x1 = x1 - 2.0;
								return z * PolEvl(x1, p, 7) / PolEvl(x1, q, 8);
						}
				}
		}
}

///////////////////////////////////////////////////////////////////////////////////
//
// This function returns whether the gamma function should be positive or
// negative for a given value of x. Adapted from J. Debord's JMATH.PAS.
// 		@param x
// 		@return
//
///////////////////////////////////////////////////////////////////////////////////

function sgnGamma(x) {
	if(x > 0.0) {
		return 1;
	} else if(odd(Math.trunc(Math.abs(x)))) {
		return 1;
	} else return -1;
}

///////////////////////////////////////////////////////////////////////////////
//
//  Evaluates polynomial of degree N:
//
//			2	   N
//    y  =  C  + C x + C x  +...+ C x
//	   0	1     2 	 N
//
//  Coefficients are stored in reverse order:
//
//  Coef[0] = C  , ..., Coef[N] = C
//             N                   0
//
//  The function P1Evl() assumes that Coef[N] = 1.0 and is
//  omitted from the array. Its calling arguments are
//  otherwise the same as PolEvl().
//
///////////////////////////////////////////////////////////////////////////////

function PolEvl(x, coef, n) {

	var ans;

	ans = coef[0];
	for(var i = 1; i <= n; i++) {
		ans = ans * x + coef[i];
	}
	return ans;
}

///////////////////////////////////////////////////////////////////////////////
//
//	The Incomplete Beta Function. Algorithm adapted from some old math
//  	Pascal files I had.
//
//		@param a
//      @param b
//      @param x
//
//      @return
//
///////////////////////////////////////////////////////////////////////////////

function iBeta (a, b, x) {

		var a1, b1, x1, t, w, xc, y;
		var flag = false;

		if((a <= 0.0) || (b <= 0.0) || (x < 0.0) || (x > 1.0)) {
				return NaN;
		}

		if((x == 0.0) || (x == 1.0)) {
				return x;
		}

		if((b * x <= 1.0) && (x <= 0.95)) {
				t = pSeries(a, b, x);
		} else {
				w = 1.0 - x;

				// Reverse a and b if x is greater than the mean.
				if(x > (a / (a + b))) {
						flag = true;
						a1 = b;
						b1 = a;
						xc = x;
						x1 = w;
				} else {
						a1 = a;
						b1 = b;
						xc = w;
						x1 = x;
				}

				if(flag && (b1 * x1 <= 1.0) && (x1 <= 0.95)) {
						t = pSeries(a1, b1, x1);
				} else {
						// Choose expansion for optimal convergence
						y = x1 * (a1 + b1 - 2.0) - (a1 - 1.0);
						if(y < 0.0) {
						w = cFrac1(a1, b1, x1);
						} else {
								w = cFrac2(a1, b1, x1) / xc;
						}

						// Multiply w by the factor x^a * (1-x)^b ....?
						y = a1 * ln(x1);
						t = b1 * ln(xc);
						if((a1 + b1 < MAXGAM) && (Math.abs(y) < MAXLOG) && (Math.abs(t) < MAXLOG)) {
								t = Math.pow(xc, b1) ;
								t = t * Math.pow(x1, a1);
								t = t / a1;
								t = t * w;
								t = t * gamma(a1 + b1) / (gamma(a1) * gamma(b1));
						} else {

								// Resort to logarithms
								y = y + t + lnGamma(a1 + b1) - lnGamma(a1) - lnGamma(b1) + ln(w / a1);
								if(y < MINLOG) {
										t = 0.0;
								} else {
										t = Math.exp(y);
								}
						}
				}
		}

		if(flag) {
				if(t <= MACHEP) {
						t = 1.0 - MACHEP;
				} else {
						t = 1.0 - t;
				}
		}
		return t;
}

///////////////////////////////////////////////////////////////////////////////
//
//      Power series for incomplete beta integral. Use when b*x is small.
//
//      @param a
//      @param b
//      @param x
//
//      @return
//
///////////////////////////////////////////////////////////////////////////////

function pSeries(a, b, x) {

		var s, t, u, v, t1, z, ai;
		var n;

		ai = 1.0 / a;
		u = (1.0 - b) * x;
		v = u / (a + 1.0);
		t1 = v;
		t = u;
		n = 2;
		s = 0.0;
		z = MACHEP * ai;
		while(Math.abs(v) > z) {
				u = (n - b) * x / n;
				t = t * u;
				v = t / (a + n);
				s = s + v;
				n = n + 1;
		}
		s = s + t1;
		s = s + ai;

		u = a * ln(x);
		if((a + b < MAXGAM) && (Math.abs(u) < MAXLOG)) {
				t = gamma(a + b) / (gamma(a) * gamma(b));
				s = s * t * Math.pow(x, a);
		} else {
				t = lnGamma(a + b) - lnGamma(a) - lnGamma(b) + u + ln(s);
				if(t < MINLOG) {
						s = 0.0;
				} else {
						s = Math.exp(t);
				}
		}
		return s;
}

///////////////////////////////////////////////////////////////////////////////
//
//  The Inverse Incomplete Beta function, algorithm captured from the site:
//      http://www.nr.com/forum/showthread.php?t=825, however, it looks as though
//      it simply uses a binomial approximation to develop the inverse function.
//
//      @param p
//      @param alpha
//      @param beta
//
//      @return
//
///////////////////////////////////////////////////////////////////////////////

function iiBeta(p, alpha, beta) {

		var x = 0;
		var a = 0;
		var b = 1;
		var prec = 1e-15; // converge until there is 15 decimal places precision

		while((b - a) > prec) {
				x = (a + b) / 2;
				if(iBeta(alpha, beta, x) > p) {
						b = x;
				} else {
						a = x;
				}
		}

		return x;
}

///////////////////////////////////////////////////////////////////////////////
//
//	Stirling's formula for the gamma function. Adapted from J. Debord's
//		JMATH.PAS library.
//
//	Gamma(x) = Sqrt(2*Pi) x^(x-.5) exp(-x) (1 + 1/x P(1/x)) where P(x) is a
//		polynomial
//
///////////////////////////////////////////////////////////////////////////////

function stirf(x) {

	var STIR = [  7.147391378143610789273E-4,
								 -2.363848809501759061727E-5,
								 -5.950237554056330156018E-4,
									6.989332260623193171870E-5,
									7.840334842744753003862E-4,
								 -2.294719747873185405699E-4,
					     -2.681327161876304418288E-3,
									3.472222222230075327854E-3,
									8.333333333333331800504E-2,
									0.0 ];
		var w, p;

		w = 1.0 / x;

		if(x > 1024.0) {
				p = 6.97281375836585777429E-5 * w + 7.84039221720066627474E-4;
				p = p * w - 2.29472093621399176955E-4;
				p = p * w - 2.68132716049382716049E-3;
				p = p * w + 3.47222222222222222222E-3;
				p = p * w + 8.33333333333333333333E-2;
		} else {
				p = PolEvl(w, STIR, 8);
		}

		return SQRT2PI * Math.exp((x - 0.5) * ln(x) - x) * (1.0 + w * p);
}

///////////////////////////////////////////////////////////////////////////////
//
//      ???
//
//      @param a
//      @param b
//      @param x
//
//      @return
//
///////////////////////////////////////////////////////////////////////////////

function cFrac2(a, b, x) {

		var xk, pk, pkm1, pkm2, qk, qkm1, qkm2;
		var k1, k2, k3, k4, k5, k6, k7, k8;
		var r, t, z, ans, thresh;
		var n;

		k1 = a;
		k2 = b - 1.0;
		k3 = a;
		k4 = a + 1.0;
		k5 = 1.0;
		k6 = a + b;
		k7 = a + 1.0;
		k8 = a + 2.0;

		pkm2 = 0.0;
		qkm2 = 1.0;
		pkm1 = 1.0;
		qkm1 = 1.0;
		z = x / (1.0 - x);
		ans = 1.0;
		r = 1.0;
		n = 0;
		thresh = 3.0 * MACHEP;

		do {
				xk = -(z * k1 * k2) / (k3 * k4);
				pk = pkm1 + pkm2 * xk;
				qk = qkm1 + qkm2 * xk;
				pkm2 = pkm1;
				pkm1 = pk;
				qkm2 = qkm1;
				qkm1 = qk;

				xk = (z * k5 * k6) / (k7 * k8);
				pk = pkm1 + pkm2 * xk;
				qk = qkm1 + qkm2 * xk;
				pkm2 = pkm1;
				pkm1 = pk;
				qkm2 = qkm1;
				qkm1 = qk;

				if(qk != 0.0) { r = pk / qk; }

				if(r != 0.0) {
						t = Math.abs((ans - r) / r);
						ans = r;
				} else t = 1.0;

				if(t < thresh) { break; }

				k1 += 1.0;
				k2 -= 1.0;
				k3 += 2.0;
				k4 += 2.0;
				k5 += 1.0;
				k6 += 1.0;
				k7 += 2.0;
				k8 += 2.0;

				if((Math.abs(qk) + Math.abs(pk)) > BIG) {
						pkm2 *= BIGINV;
						pkm1 *= BIGINV;
						qkm2 *= BIGINV;
						qkm1 *= BIGINV;
				}

				if((Math.abs(qk) < BIGINV) || (Math.abs(pk) < BIGINV)) {
						pkm2 *= BIG;
						pkm1 *= BIG;
						qkm2 *= BIG;
						qkm1 *= BIG;
				}
				n++;
		} while (n <= 400);
		// Math_Err = FN_PLOSS
		// Label CDone:
		return ans;
}

///////////////////////////////////////////////////////////////////////////////
//
//	Natural Logarithm of the Gamma Function
//
//      @param x
//
//      @return
//
///////////////////////////////////////////////////////////////////////////////

function lnGamma(x) {

	var p = [ -2.163690827643812857640E3,
							-8.723871522843511459790E4,
							-1.104326814691464261197E6,
							-6.111225012005214299996E6,
							-1.625568062543700591014E7,
							-2.003937418103815175475E7,
							-8.875666783650703802159E6,
							0.0,
							0.0,
							0.0 ];

	var q = [ -5.139481484435370143617E2,
							-3.403570840534304670537E4,
							-6.227441164066219501697E5,
							-4.814940379411882186630E6,
							-1.785433287045078156959E7,
							-3.138646407656182662088E7,
							-2.099336717757895876142E7,
							 0.0,
							 0.0,
							 0.0 ];

	var n;
	var a, x1, z;

		if((x == 0.0) || ((x < 0.0) && (frac(x) == 0.0))) {
				return NaN;
		}

		if(x > MAXLGM) {
				return Infinity;
		}

		a = Math.abs(x);
		if(a > 34.0) {
				if(x < 0.0) {
						n = Math.trunc(a);
						z = a - n;
						if(z > 0.5) {
								n += 1;
								z = n - a;
						}
						z = a * Math.sin(PI * z);
						if(z == 0.0) {
								return Infinity;
						}
						z = LNPI - ln(z) - stirfL(a);
				} else {
						z = stirfL(x);
				}
				return z;
		} else if(x < 13.0) {
				z = 1.0;
				x1 = x;
				while(x1 >= 3.0) {
						x1 = x1 - 1.0;
						z = z * x1;
				}
				while(x1 < 2.0) {
						if(Math.abs(x1) <= 0.03125) {
								return ln(Math.abs(gamSmall(x1, z)));
						}
						z = z / x1;
						x1 = x1 + 1.0;
				}
				if(z < 0.0) {
						z = -z;
				}
				if(x1 == 2.0) {
						return ln(z);
				} else {
						x1 = x1 - 2.0;
						return x1 * PolEvl(x1, p, 6) / P1Evl(x1, q, 7) + ln(z);
				}
		} else return stirfL(x);
}

///////////////////////////////////////////////////////////////////////////////
//
//	Approximate Ln(Gamma) by Stirling's formula, for X >= 13
//
//      @param x
//
//      @return
//
///////////////////////////////////////////////////////////////////////////////

function stirfL(x) {

	var p = [ 4.885026142432270781165E-3,
						 -1.880801938119376907179E-3,
							8.412723297322498080632E-4,
						 -5.952345851765688514613E-4,
							7.936507795855070755671E-4,
						 -2.777777777750349603440E-3,
							8.333333333333331447505E-2,
							0.0,
							0.0,
							0.0 ];

	var q, w;

		q = ln(x) * (x - 0.5) - x;
		q = q + LNSQRT2PI;
		if(x > 1.0E+10) {
				return q;
		} else {
				w = 1.0 / sqr(x);
				return q + PolEvl(w, p, 6) / x;
		}
}

///////////////////////////////////////////////////////////////////////////////
//
//  Evaluate polynomial when coefficient of X is 1.0.
//  	Otherwise same as PolEvl.
//
///////////////////////////////////////////////////////////////////////////////

function P1Evl(x, coef, n) {

		var ans;

		ans = x + coef[0];
		for(var i = 1; i < n - 1; i++) {
				ans = ans * x + coef[i];
		}
		return ans;
}

///////////////////////////////////////////////////////////////////////////////
//
//      ???
//
//      @param a
//      @param b
//      @param x
//
//      @return
//
///////////////////////////////////////////////////////////////////////////////

function cFrac1(a, b, x) {

		var xk, pk, pkm1, pkm2, qk, qkm1, qkm2;
		var k1, k2, k3, k4, k5, k6, k7, k8;
		var r, t, ans, thresh;
		var n;

		k1 = a;
		k2 = a + b;
		k3 = a;
		k4 = a + 1.0;
		k5 = 1.0;
		k6 = b - 1.0;
		k7 = k4;
		k8 = a + 2.0;

		pkm2 = 0.0;
		qkm2 = 1.0;
		pkm1 = 1.0;
		qkm1 = 1.0;
		ans = 1.0;
		r = 1.0;
		n = 0;
		thresh = 3.0 * MACHEP;

		do {
				xk = -(x * k1 * k2) / (k3 * k4);
				pk = pkm1 + pkm2 * xk;
				qk = qkm1 + qkm2 * xk;
				pkm2 = pkm1;
				pkm1 = pk;
				qkm2 = qkm1;
				qkm1 = qk;

				xk = (x * k5 * k6) / (k7 * k8);
				pk = pkm1 + pkm2 * xk;
				qk = qkm1 + qkm2 * xk;
				pkm2 = pkm1;
				pkm1 = pk;
				qkm2 = qkm1;
				qkm1 = qk;

				if(qk != 0.0) { r = pk / qk; }

				if(r != 0.0) {
						t = Math.abs((ans - r) / r);
						ans = r;
				} else t = 1.0;

				if(t < thresh) break;

				k1 = k1 + 1.0;
				k2 = k2 + 1.0;
				k3 = k3 + 2.0;
				k4 = k4 + 2.0;
				k5 = k5 + 1.0;
				k6 = k6 - 1.0;
				k7 = k7 + 2.0;
				k8 = k8 + 2.0;

				if((Math.abs(qk) + Math.abs(pk)) > BIG) {
						pkm2 = pkm2 * BIGINV;
						pkm1 = pkm1 * BIGINV;
						qkm2 = qkm2 * BIGINV;
						qkm1 = qkm1 * BIGINV;
				}

				if((Math.abs(qk) < BIGINV) || (Math.abs(pk) < BIGINV)) {
						pkm2 *= BIG;
						pkm1 *= BIG;
						qkm2 *= BIG;
						qkm1 *= BIG;
				}
				n++;

		} while (n <= 400);
		// MathErr = FN_PLOSS;
		// Label: CDone
		return ans;
}

///////////////////////////////////////////////////////////////////////////////
//
//	Gamma function for small values of the argument. Adapted from
//		J. Debord's JMATH.PAS.
//
///////////////////////////////////////////////////////////////////////////////

function gamSmall(x1, z) {

	var s = [ -1.193945051381510095614E-3,
							 7.220599478036909672331E-3,
							-9.622023360406271645744E-3,
							-4.219773360705915470089E-2,
							 1.665386113720805206758E-1,
							-4.200263503403344054473E-2,
							-6.558780715202540684668E-1,
							 5.772156649015328608253E-1,
							 1.000000000000000000000E0,
							 0.0 ];

	var sn = [ 1.133374167243894382010E-3,
							 7.220837261893170325704E-3,
							 9.621911155035976733706E-3,
							-4.219773343731191721664E-2,
							-1.665386113944413519335E-1,
							-4.200263503402112910504E-2,
							 6.558780715202536547116E-1,
							 5.772156649015328608727E-1,
							-1.000000000000000000000E0,
							 0.0 ];

		var p;

		if(x1 == 0.0) {
				return NaN;
		}
		if(x1 < 0.0) {
				x1 = -x1;
				p = PolEvl(x1, sn, 8);
		} else {
				p = PolEvl(x1, s, 8);
		}
		return z / (x1 * p);
}

///////////////////////////////////////////////////////////////////////////////
//
//	Factorial that increases up to n?
//
//      @param a
//      @param n
//
//      @return
//
///////////////////////////////////////////////////////////////////////////////

function risingFactorial(a, n) {
		var r = 1;
		for(var i = 0; i < n; i++) {
			r = r * (a + i);
		}
		return r;
}

///////////////////////////////////////////////////////////////////////////////
//
//	Hypergeometric distribution
//
//      @param a
//      @param b
//      @param c
//      @param z
//
//      @return
//
///////////////////////////////////////////////////////////////////////////////

function hGeom(a, b, c, z) {
		var n = 0;
		var x1 = 1;
		var x0 = 0;
		while((x1 - x0) > PREC) {
				x0 = x1;
				var a1 = risingFactorial(a, n);
				var b1 = risingFactorial(b, n);
				var c1 = risingFactorial(c, n);
				var r1 = a1 * b1 / c1;
				var r2 = Math.pow(z, n) / factorial(n);
		x1 = x1 + r1 * r2;
				n++;
		}
		return x1;
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
//
//
//  The following functions create elements related to JSXGraph
//
//
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


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

class Histogram {

	constructor(board, barHeights, colors, coords, delta_x) {
		this.board = board;
		this.barHeights = barHeights;
		this.colors = colors;
		this.delta_x = delta_x || 1;
		if(coords) {
			this.x = coords[0];
			this.y = coords[1];
		} else {
			this.x = 0;
			this.y = 0;
		}

		this.bars = [];

		var length = barHeights.length;
		for(var i = 0; i < length; i++) {
			this.bars[i] = new Rectangle2(board, this.x + i * this.delta_x, this.y, this.delta_x, this.barHeights[i], this.colors[i]);
		}

	}

	setBarHeight(bar, height, delay) {
		delay = delay || 0;
		this.bars[bar].setHeight(height, delay);
		this.barHeights[bar] = height;
	}
	setBarHeights(barHeights, delay) {
		delay = delay || 0;
		var length = barHeights.length;
		for(var i = 0; i < length; i++) {
			this.bars[i].setHeight(barHeights[i], delay);
			this.barHeights[i] = barHeights[i];
		}
	}

	setBarColor(bar, color) {
		this.bars[i].setColor(color);
	}

	setBarColors(colors) {
		for(var i = 0; i < this.bars.length; i++) {
			this.bars[i].setColor(colors[i]);
		}
	}

	newBars(newbars, colors) {
		//for(var i = 0; i < this.bars.length; i++) {
		//	this.board.removeChild(this.bars[i].rect);
		//}
		this.bars = [];
		for(var i = 0; i < newbars.length; i++) {
			this.bars[i] = new Rectangle2(this.board, this.x + i * this.delta_x, this.y, this.delta_x, newbars[i], colors[i]);
		}
		this.barHeights = newbars;
		this.colors = colors;
	}

}

function JSXRectangle(board, coords) {

	// Make four invisible points to define the corners of the rectangle

	var p1 = board.create('point',
		[coords[0], coords[1]],
		{ visible: false });

	var p2 = board.create('point',
		[coords[0] + coords[2], coords[1]],
		{ visible: false });

	var p3 = board.create('point',
		[coords[0] + coords[2], coords[1] + coords[3]],
			{ visible: false });

	var p4 = board.create('point',
		[coords[0], coords[1] + coords[3]],
		{ visible: false });

	// Now draw the rectangle using a polygon

	var rect = board.create('polygon', [p1, p2, p3, p4],
		{ hasInnerPoints: false,
		  fillColor: '#0000ff',
		  borders: {
			fixed: true,
			highlight: false,
			strokeColor: '#0000FF'
		  }
		});

	return rect;
}

function JSXHistogram(board, x_labels, y_data) {

	rects = [];

	for(var i = 0; i < y_data.length; i++) {
		rects.push(JSXRectangle(board, [i, 0, 1, y_data[i]]));
	}

	return rects;
}

function JSXFrequencyDistribution (dataset, nClasses, decimals = 0) {

	var xmin = stats.min(dataset);
	var xmax = stats.max(dataset);
	var range = xmax - xmin;

	var power = pow(10, decimals);

	var classWidth = ceil((range / nClasses) * power) / power;

	var UCL = []; // upper class limits
	var LCL = []; // lower class limits
	var frequencies = [];

	for(var i = 0; i < nClasses; i++) {
		frequencies[i] = 0;
		UCL[i] = 0;
		LCL[i] = 0;
	}

	UCL[0] = xmin + classWidth - round(1 / power, decimals)
	LCL[0] = xmin;

	for(var i = 1; i < nClasses; i++) {
		UCL[i] = round(UCL[i-1] + classWidth, decimals);
		LCL[i] = round(LCL[i-1] + classWidth, decimals);
	}
	for(var i = 0; i < dataset.length; i++) {
		j = 0;
		while((dataset[i] > UCL[j]) && (j < UCL.length)) {
			j++;
		}
		frequencies[j] += 1;
	}

	return [LCL, UCL, frequencies];

}

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

///////////////////////////////////////////////////////////////////////////////
//
// Creates a checkbox at a specified location using a given label.
//   Allows user to set the box to either: checked or unchecked by default
//
// An optional function can be provided that states what the program should
//   do once the checkbox is clicked. This must be of the form:
//     function() { doSomething(); }
//
///////////////////////////////////////////////////////////////////////////////

function JSXCheckbox(board, xLoc, yLoc, label, checked, onChange, args) {

	if(args == undefined) {
		args = {};
	}
	args.fixed = (args.fixed == undefined) ? true : args.fixed;

	var cbox = board.create('checkbox', [xLoc, yLoc, label], args);
	cbox.rendNodeCheckbox.checked = checked;
	cbox._value = checked;
	JXG.addEvent(cbox.rendNodeCheckbox, 'change', onChange, cbox);
	return cbox;
}

function toggleCheckbox(cbox) {
	if(isChecked(cbox)) {
		setCheckbox(cbox, true);
	} else {
		setCheckbox(cbox, false);
	}
}

function setCheckbox(cbox, value) {
	cbox._value = value;
	cbox.rendNodeCheckbox.checked = value;
}

function isChecked(cbox) {
	return cbox._value;
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
		const node = math.parse(expression);
	} catch(err) {
		return true;
	}
	return false;
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

///////////////////////////////////////////////////////////////////////////////
//
// Determines the name of an explicitly defined function using the math.js
//   parser.
//
///////////////////////////////////////////////////////////////////////////////

function getFunctionName(expression) {

	var name = '';
	var node = math.parse(expression);

	node.traverse(
		function(node, path, parent) {
			if(node.type == 'AssignmentNode' || node.type == 'FunctionAssignmentNode') {
				name = node.name;
			}
		}
	);

	return name;
}

///////////////////////////////////////////////////////////////////////////////
//
// Changes all the instances of the variable 'x' and replaces it with
//
///////////////////////////////////////////////////////////////////////////////

function getVariables(expression) {

	var variables = [];
	var func = getFunctionName(expression);

	var node = math.parse(expression);

	node.traverse(
		function(node, path, parent) {
			if(node.type == 'SymbolNode' && node.name != func) {
				if(node.name != 'e' && node.name != 'pi' && node.name != 'i') {
					if(variables.indexOf(node.name) == -1) {
						variables.push(node.name);
					}
				}
			}
		}
	);

	return variables;

}


// Pattern for a restricted interval:

regex_math = '|[\\w\\+\\-\\*\\/^()]*';

regex_interval = '(\\(|\\[)\\s*' +                       // ( or [
				 '(-?\\d*\\.?\\d*|-inf(inity)?|-oo)' +   // -2, 1.8, -inf, -oo
				 ',\\s*' +                               // ,
				 '(-?\\d*\\.?\\d*|\\+?inf(inity)?|\\+?oo)\\s*' + // -2, 1.8, +inf, +oo
				 '(\\)|\\])';                            // ] or )

// Pattern for a hole in the graph:

	regex_hole = '[Xx]\\s*!=\\s*' +          // x !=
				 '(-?\\d*\\.?\\d*)';        // -2, 1.8, etc.

function removeSpaces(s) {
	while(s.search(' ') != -1) {
		s = s.replace(' ', '');
	}
	return s;
}

///////////////////////////////////////////////////////////
//
// A function can be defined such as: y = 2x-5 (-2,5]
//   and the interval needs to be removed for graphing
//   this function determines if an interval exists and
//   returns it if so, or a blank string if it does not
//
////////////////////////////////////////////////////////////

function getInterval(relation) {

	var interval = '';
	var intervalstart = 0;

	intervalstart = relation.search(regex_interval);
	if (intervalstart != -1) {
		interval = relation.substring(intervalstart, relation.length).trim();
	}

	intervalstart = relation.search(regex_hole);
	if (intervalstart != -1) {
		interval = relation.substring(intervalstart, relation.length).trim();
	}

	return interval;
}

function removeInterval(relation) {

	var interval = '';
	var intervalstart = 0;

	intervalstart = relation.search(regex_interval);
	if (intervalstart != -1) {
		relation = relation.substring(0, intervalstart).trim();
	}

	intervalstart = relation.search(regex_hole);
	if (intervalstart != -1) {
		relation = relation.substring(0, intervalstart).trim();
	}

	return relation;
}

///////////////////////////////////////////////////////////
//
// Gets the lower and bound of a interval expressed as:
//     (-2,5), (1.5, 10], (-inf,2), [2, infinity)
//
////////////////////////////////////////////////////////////

function getLowerEndpoint(interval) {
	interval = removeSpaces(interval);
	l = interval.split(',');
	l[0] = l[0].substring(1, l[0].length);
	if(l[0].includes('inf') || l[0].includes('-oo')) {
		return NEGATIVE_INFINITY;
	} else {
		return evalstr(l[0]);
	}
}

function getUpperEndpoint(interval) {
	interval = removeSpaces(interval);
	l = interval.split(',');
	l[1] = l[1].substring(0, l[1].length - 1);
	if(l[1].includes('inf') || l[1].includes('oo')) {
		return POSITIVE_INFINITY;
	} else {
		return evalstr(l[1]);
	}
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

function lowerBoundOpen(interval) {
	return interval.includes('(');
}

function upperBoundOpen(interval) {
	return interval.includes(')');
}

function lowerBoundClosed(interval) {
	return interval.includes('[');
}

function upperBoundClosed(interval) {
	return interval.includes(']');
}

///////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////

function isPoint(relation) {

	intervalstart = relation.search(regex_interval);
	if (intervalstart != -1) {
		interval = relation.substring(intervalstart, relation.length).trim();
		relation = relation.substring(0, intervalstart).trim();
	}

	return relation == '';

}

function isAsymptote(relation) {

	intervalstart = relation.search(regex_hole);
	if (intervalstart != -1) {
		interval = relation.substring(intervalstart, relation.length).trim();
		relation = relation.substring(0, intervalstart).trim();
	}

	return relation == '';

}

///////////////////////////////////////////////////////////////
//
// Evaluates a function expressed as:
//    2*x - 5, ln(x - 4), etc.
// Note that there variable is always 'x' and it is assumed that
//    y = or f(x) = is ommitted from the start.
//
// This function allows intervals to be restricted using an
//    interval formatted as stated in [regex_interval]
//
// This function can also evaluate a piecewise defined function
//    if multiple functions are provided and separated by
//    semicolons
//
/////////////////////////////////////////////////////////////////

function evaluate(f, x, args) {

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

		if(f.search(regex_hole) != -1) {
			var interval = getInterval(f);
			var xloc = getHoleValue(interval);
			if(x == xloc) {
				return NaN;
			}
			f = removeInterval(f);
		}

		// if f includes a restricted interval, handle that
		if(f.search(regex_interval) != -1) {

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
				//f = NaN;
				return NaN;
			}
		}

		// math.js doesn't support ln
		f = f.replace(/ln/g, "log");

		var expr = math.compile(f);
		var parameter = {};
		parameter[variable] = x;

		// math.js returns complex numbers for negative values of logs, etc. This
		// code below makes sure to only return real numbers
		try {
			var val = expr.eval(parameter); // An older version of mathjs used eval instead of evaluate
		} catch (TypeError) {
			var val = expr.evaluate(parameter);
		}
		if (typeof(val) == 'object') {
			return NaN;
		} else return parseFloat(val);
	} else {
	 	return parseFloat(evalstr(f));
 	}

}

function evalf(f, parameters) {
	var expr = math.compile(f);
	return expr.eval(parameters);
}

///////////////////////////////////////////////////////////////////////////////
//
// Plots a function, it can restrict to a specified interval or display
//   the function over the entire real line.
//
// A curve must be provided to update - which means the curve must be
//   initialized by the board to begin with.
//
// Optionally, a point for a lower endpoint, upper endpoint and hole in the
//   graph can be provided, but this is not a requirement.
//
///////////////////////////////////////////////////////////////////////////////

function plot_function(curve, relation, start_x, end_x, args) {

	if(args === undefined) {
		args = {};
	}

	var color = args.color ? args.color : 'blue';
	var interval = args.interval ? args.interval : '';
	var density = args.density ? args.density : 0.01;
	var width = args.width ? args.width : 2;
	var lowerendpoint = args.lowerendpoint ? args.lowerendpoint : -1;
	var upperendpoint = args.upperendpoint ? args.upperendpoint : -1;
	var hole = args.hole ? args.hole : -1;
	var yMax = args.yMax ? args.yMax : 10;
	var yMin = args.yMin ? args.yMin : -10;
	var yScl = args.yScl ? args.yScl : 1;
	var variable = args.variable ? args.variable : 'x';
	var dashed = (args.dashed !== undefined) ? args.dashed : false;

	var restricted_interval = false;

	curve.setAttribute({ strokeWidth: width, strokeColor: color });
	if(dashed) {
		curve.setAttribute({ dash: dashsetting });
	} else {
		curve.setAttribute({ dash: 0 });
	}

	// math.js does not support ln notation
	relation = relation.replace(/ln/g, "log");

	// If the relation is blank but not the interval then we just
	// need to plot a single point or an asymptote

	if (relation.trim() == '' && interval != '') {

		// Draw a point, but find out if it is open or closed
		if (interval.search(regex_interval) != -1) {

			var x = evalstr(getLowerEndpoint(interval));
			var y = evalstr(getUpperEndpoint(interval));
			var closed = upperBoundClosed(interval) || upperBoundClosed(interval);

			lowerendpoint.moveTo([x, y]);

			lowerendpoint.setAttribute({ strokeColor: color, visible: true });
			if (closed) {
				lowerendpoint.setAttribute({ fillColor: color });
			} else {
				lowerendpoint.setAttribute({ fillColor: 'white' });
			}

		}

		// Draw an asymptote
		if (interval.search(regex_hole) != -1) {

			var xloc = getHoleValue(interval);

			curve.dataX = [xloc, xloc];

			// TODO:
			// This -2000 and +2000 just need to be the lower and upper portion
			// of the viewing window, but I don't know how to access it without
			// referencing the board variable

			curve.dataY = [-2000, 2000];

			curve.setAttribute( { dash: dashsetting } );

			curve.updateParametricCurve();

		}

	} else {
		if(hole != -1) {
			hole.setAttribute({ visible: false });
		}

		if(lowerendpoint != -1) {
			lowerendpoint.setAttribute({ visible: false });
		}

		if(upperendpoint != -1) {
			upperendpoint.setAttribute({ visible: false });
		}

		var expr = math.compile(relation);

		if(interval != '') {

			// See if there is a hole in the graph
			if(interval.search(regex_hole) != -1) {
				hole_val = getHoleValue(interval);
				var parameter = {};
				parameter[variable] = hole_val;
				var y_val = evalstr(relation, parameter);
				hole.moveTo([hole_val, y_val]);
				hole.setAttribute( { visible: true, strokeColor: color, fillColor: 'white' });
			}

			// See if a restricted interval was defined
			if(interval.search(regex_interval) != -1) {

				restricted_interval = true;

				var lowerval = getLowerEndpoint(interval);
				var upperval = getUpperEndpoint(interval);

				if(lowerval != NEGATIVE_INFINITY) {
					start_x = lowerval;
					var parameter = {};
					parameter[variable] = lowerval;
					var y_val = evalstr(relation, parameter);
					lowerendpoint.moveTo([lowerval, y_val]);
					lowerendpoint.setAttribute({ strokeColor: color, visible: true });
					if(lowerBoundOpen(interval)) {
						lowerendpoint.setAttribute({ fillColor: 'white' });
					} else {
						lowerendpoint.setAttribute({ fillColor: color });
					}
				}

				if(upperval != POSITIVE_INFINITY) {
					end_x = upperval;
					var parameter = {};
					parameter[variable] = upperval;
					var y_val = evalstr(relation, parameter);
					upperendpoint.moveTo([upperval, y_val]);
					upperendpoint.setAttribute({ strokeColor: color, visible: true });
					if(upperBoundOpen(interval)) {
						upperendpoint.setAttribute({ fillColor: 'white' });
					} else {
						upperendpoint.setAttribute({ fillColor: color });
					}
				}

			}
		} // if(interval != '')

		// This is an explicit function of the form: f(x)
		curve.dataX = math.range(start_x, end_x + density, density).toArray();
		curve.dataY = curve.dataX.map(
			function(x) {
				var parameter = {};
				parameter[variable] = x;
				return evalstr(relation, parameter);
			}
		);

		// If the curve shoots off to infinity, this will prevent the curve from
		// drawing an "asymptote" at that value

		for(var i = 0; i < curve.dataY.length; i++) {
			if(curve.dataY[i] > (yMax + 2 * yScl)) {
				curve.dataY[i] = NaN;
			} else if(curve.dataY[i] < (yMin - 2 * yScl)) {
				curve.dataY[i] = NaN;
			}
		}

		//curve.updateParametricCurve();
		curve.updateCurve();
	}
}


///////////////////////////////////////////////////////////////////////////////
//
// Plots a polar function, it requires a start and endpoint value for theta.
//
// Returns the plotted curve.
//
///////////////////////////////////////////////////////////////////////////////

function plot_polar(curve, expression, tmin, tmax, args) {

	var color = args.color ? args.color : 'blue';
	var density = args.density ? args.density : 0.01;
	var width = args.width ? args.width : 2;
	var dashed = (args.dashed !== undefined) ? args.dashed : false;

	if(dashed) {
		curve.setAttribute({ dash: dashsetting });
	} else {
		curve.setAttribute({ dash: 0 });
	}

	// This is an explicit polar function of the form: r(t)
	if(expression != '') {

		var expr = math.compile(expression);

		var tValues = math.range(tmin, tmax + density, density).toArray();
		var rValues = tValues.map(
				function(x) {
					return expr.eval({t: x});
				});

		curve.dataX = [];
		curve.dataY = [];

		for(var i = 0; i < tValues.length; i++) {

			curve.dataX[i] = rValues[i] * Math.cos(tValues[i]);
			curve.dataY[i] = rValues[i] * Math.sin(tValues[i]);

		}

		curve.updateParametricCurve();
	}

}

///////////////////////////////////////////////////////////////////////////////
//
// Plots a parametric curve, it requires a start and endpoint value for t.
//
// Returns the plotted curve.
//
///////////////////////////////////////////////////////////////////////////////

function plot_parametric(curve, x_t, y_t, tmin, tmax, args) {

	if(args === undefined) {
		args = {};
	}

	var color = args.color ? args.color : 'blue';
	var density = args.density ? args.density : 0.01;
	var interval = args.interval ? args.interval : '';
	var variable = args.variable ? args.variable : 't';
	var width = args.width ? args.width : 2;
	var lowerendpoint = args.lowerendpoint ? args.lowerendpoint : -1;
	var upperendpoint = args.upperendpoint ? args.upperendpoint : -1;
	var hole = args.hole ? args.hole : -1;
	var dashed = (args.dashed !== undefined) ? args.dashed : false;

	curve.setAttribute({ strokeColor: color, strokeWidth: width });
	if(dashed) {
		curve.setAttribute({ dash: dashsetting });
	} else {
		curve.setAttribute({ dash: 0 });
	}

	if(hole != -1) {
		hole.setAttribute({ visible: false });
	}

	if(lowerendpoint != -1) {
		lowerendpoint.setAttribute({ visible: false });
	}

	if(upperendpoint != -1) {
		upperendpoint.setAttribute({ visible: false });
	}

	if(x_t == '') {
		x_t = args.variable;
	} else if(y_t == '') {
		y_t = args.variable;
	}

	var xFunc = math.compile(x_t);
	var yFunc = math.compile(y_t);

	var evalX = function(x) {
					var parameter = {};
					parameter[variable] = x;
					return xFunc.eval(parameter);
				};

	var evalY = function(x) {
					var parameter = {};
					parameter[variable] = x;
					return yFunc.eval(parameter);
				};

	if(interval != '') {

		// See if there is a hole in the graph
		if(interval.search(regex_hole) != -1) {

			hole_val = parseFloat(interval.split('=')[1]);
			hole.moveTo([evalX(hole_val), evalY(hole_val)]);
			hole.setAttribute( { visible: true, strokeColor: color, fillColor: 'white' });

		}

		// See if a restricted interval was defined
		if(interval.search(regex_interval) != -1) {

			restricted_interval = true;

			var lowerval = getLowerEndpoint(interval);
			var upperval = getUpperEndpoint(interval);

			if(lowerval != NEGATIVE_INFINITY) {

				tmin = lowerval;
				lowerendpoint.moveTo([evalX(lowerval), evalY(lowerval)]);
				lowerendpoint.setAttribute({ strokeColor: color, visible: true });
				if(lowerBoundOpen(interval)) {
					lowerendpoint.setAttribute({ fillColor: 'white' });
				} else {
					lowerendpoint.setAttribute({ fillColor: color });
				}
			}

			if(upperval != POSITIVE_INFINITY) {

				tmax = upperval;
				upperendpoint.moveTo([evalX(upperval), evalY(upperval)]);
				upperendpoint.setAttribute({ strokeColor: color, visible: true });
				if(upperBoundOpen(interval)) {
					upperendpoint.setAttribute({ fillColor: 'white' });
				} else {
					upperendpoint.setAttribute({ fillColor: color });
				}
			}

		}
	} // if(interval != '')

	if(!(x_t == '' && y_t == '')) {

		var tValues = math.range(tmin, tmax + density, density).toArray();

		curve.dataX = tValues.map(
				function(x) {
					var parameter = {};
					parameter[variable] = x;
					return xFunc.eval(parameter);
				});

		curve.dataY = tValues.map(
				function(x) {
					var parameter = {};
					parameter[variable] = x;
					return yFunc.eval(parameter);
				});

		curve.updateParametricCurve();

	}

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

	var func = board.jc.snippet(relation, true, ['x', 'y'], false);
	cv.func = func;
	cv.update();

/*	if(args === undefined) {
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

	board.unsuspendUpdate();*/
}

////////////////////////////////////////////////////////////////////////////////
//
//  Here is an algorithm for developing an implicit function plotter that more
//  quickly draws the curves:
//
//  found at: https://groups.google.com/forum/#!topic/jsxgraph/UFt3OoaJlg0
//
//  further resource links to investigate:
//
//		- http://shamshad-npti.github.io/scripts/implicit.js
//		- http://shamshad-npti.github.io/implicit/curve/2015/10/08/Implicit-curve/
//
//
//var ImplicitPlotter = function(board, func)
//{
//  var me = {};
//
//  me.board = board; me.func = func;
//  me.colour = "blue";
//  me.px = 300; me.py = 300;
//  me.tx = 0; me.ty = 0;
//  me.curves = [];
//
//  me.finish = function(segments)
//  {
//    board.create('transform', [-me.x1 * me.tx, me.y2 * me.ty], {type: 'translate'});
//    board.create('transform', [me.tx, -me.ty], {type: 'scale'});
//
//    var xs = [];
//    var ys = [];
//    var curves = [];
//
//    for (var i = 0; i < segments.length; i++)
//    {
//        var s = segments[i];
//        if (!s.lineTo && xs.length)
//        {
//            curves.push(board.create('curve', [xs, ys], {strokeWidth:1, strokeColor:me.colour}));
//            xs = [];
//            ys = [];
//        }
//
//        xs.push(segments[i].x);
//        ys.push(segments[i].y);
//    }
//    if (xs.length)
//    {
//        curves.push(board.create('curve', [xs, ys], {strokeWidth:1, strokeColor:me.colour}));
//    }
//
//    return curves;
//  }
//
//  me.update = function()
//  {
//    var bbox = board.getBoundingBox();
//    me.x1 = 1.2 * bbox[0]; me.x2 = 1.2 * bbox[2];
//    me.y1 = 1.2 * bbox[1]; me.y2 = 1.2 * bbox[3];
//    me.px = board.canvasWidth;
//    me.py = board.canvasHeight;
//    me.tx = me.px / (me.x2 - me.x1);
//    me.ty = me.py / (me.y2 - me.y1);
//    me.plot = new Implicit(me.func, me.finish);
//    me.curves = me.plot.update(me.x1, me.y1, me.x2, me.y2, me.px, me.py);
//  }
//
//  return me;
//};
//
//
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
//
//  This is the more advanced implementation of the above algorithm
//
////////////////////////////////////////////////////////////////////////////////

var LinkedList = function() {
	var Node = function(elem, next, prev) {
		this.elem = elem, this.next = next, this.prev = prev;
	};
	var me = this;
	me.head = new Node(null, null, null);
	me.head.next = me.head.prev = me.head;
	me.shift = function() {
		detach(me.head.next);
	};

	me.pop = function() {
		detach(me.head.prev);
	};

	me.push = function(e) {
		var node = new Node(e, me.head, me.head.prev);
		me.head.prev.next = node;
		me.head.prev = node;
	};

	me.unshift = function(e) {
		var node = new Node(e, me.head.next, me.head);
		me.head.next.prev = node;
		me.head.next = node;
	};

	me.merge = function(list) {
		if(list.isEmpty()) return;
		me.head.prev.next = list.head.next;
		list.head.next.prev = me.head.prev;
		list.head.prev.next = me.head;
		me.head.prev = list.head.prev;
		list.destroy();
	}

	me.isEmpty = function() {
		return me.head === me.head.next;
	};

	me.destroy = function() {
		me.head = new Node(null, null, null);
	}

	me.toArray = function() {
		var node = me.head.next;
		var array = [];
		while(node != me.head) {
			array.push(node.elem);
			node = node.next;
		}
		return array;
	}

	me.remove = function(current) {
		if(current instanceof Node) detach(current);
	}

	me.forEach = function(callback) {
		var current = me.head.next, next;
		while(current !== me.head) {
			next = current.next;
			callback(current.elem, current);
			current = next;
		}
	}

	function detach(node) {
		node.next.prev = node.prev;
		node.prev.next = node.next;
		node.next = node.prev = null;
		node.elem = null;
	}

};

var Point = function(x, y, lineTo) {
	var me = this;
	me.x = x, me.y = y, me.lineTo = lineTo;

	me.equals = function(p) {
		return equals(me.x, p.x, 1e-6) && equals(me.y, p.y, 1e-6);
	};

	function equals(x, y, eps) {
		if(x === y) return true;
		return ((x - eps) < y) && (y < (x + eps));
	};
};

var PointList = function(start, end) {
	var me = this;
	me.start = start, me.end = end;
	me.start.lineTo = false, me.end.lineTo = true;
	me.points = new LinkedList();

	me.merge = function(list) {
		me.points.push(me.end);
		list.start.lineTo = true;
		me.points.push(list.start);
		me.end = list.end;
		if(list.points.length == 0) return;
		me.points.merge(list.points);
	}

	me.push = function(point) {
		point.lineTo = true;
		me.points.push(me.end);
		me.end = point;
	};

	me.unshift = function(point) {
		point.lineTo = false;
		me.start.lineTo = true;
		me.points.unshift(me.start);
		me.start = point;
	};
};

var Rectangle = function(func) {
	var me = this;
	me.eval = [0, 0, 0, 0], me.rect = [0, 0, 0, 0];
	me.x = 0, me.y = 0, me.children = null, me.status = null;
	me.singular = false, me.func = func;

	me.copy = function(r) {
		for(var i = 0; i < 4; i++) {
			me.eval[i] = r.eval[i];
			me.rect[i] = r.rect[i];
		}
		me.x = r.x, me.y = r.y;
		me.singular = r.singular;
	};

	me.set = function(x, y, fx, fy, singular) {
		me.x = x, me.y = y, me.rect[2] = fx, me.rect[3] = fy;
		me.singular = singular;
	};

	me.split = function() {
		if(me.children === null) {
			me.children = [];
			for(var i = 0; i < 4; i++) {
				me.children.push(new Rectangle(me.func));
			}
		}
		var r = me.children;
		var w2 = me.rect[2] * 0.5;
		var h2 = me.rect[3] * 0.5;
		for(var i = 0; i < 4; i++) {
			r[i].copy(me);
			r[i].rect[2] = w2;
			r[i].rect[3] = h2;
		}
		r[1].rect[0] += w2;
		r[2].rect[0] += w2;
		r[2].rect[1] += h2;
		r[3].rect[1] += h2;
		r[0].eval[1] = me.func(r[1].rect[0], r[1].rect[1]);
		r[0].eval[2] = me.func(r[2].rect[0], r[2].rect[1]);
		r[0].eval[3] = me.func(r[3].rect[0], r[3].rect[1]);
		r[1].eval[2] = me.func(r[2].rect[0] + w2, r[2].rect[1]);
		r[2].eval[3] = me.func(r[2].rect[0], r[2].rect[1] + h2);
		r[1].eval[0] = r[0].eval[1];
		r[1].eval[3] = r[0].eval[2];
		r[2].eval[0] = r[0].eval[2];
		r[2].eval[1] = r[1].eval[2];
		r[3].eval[0] = r[0].eval[3];
		r[3].eval[1] = r[0].eval[2];
		r[3].eval[2] = r[2].eval[3];
		return r;
	};

	me.x1 = function() {return me.rect[0]; };
	me.y1 = function() {return me.rect[1]; };
	me.x2 = function() {return me.rect[0] + me.rect[2]; };
	me.y2 = function() {return me.rect[1] + me.rect[3]; };
};

var Implicit = function(func, finish) {
	var me = this;
	var EMPTY = 0, FINISHED = -1, T_INV = -1, VALID = 1;
	var LIST_THRESHOLD = 16, MAX_SPLIT = 32, RES_COARSE = 8;
	var MAX_DEPTH = 4, T0101 = 5;

	me.func = func, me.finish = finish, me.grid = null;
	me.temp = null, me.plotDepth = 0, me.segmentCheckDepth = 0;
	me.openList = [], me.segments = [];
	me.sw = 0, me.sh = 0, me.pts = [null, null];

	function buildStatus(r) {
		var z = 0, p = 0, n = 0, k = true;
		for(var i = 0; i < 4; i++) {
			if(!isFinite(r.eval[i]) || isNaN(r.eval[i])) {
				k = false;
				break;
			}
			if(r.eval[i] < 0.0) n++;
			else if(r.eval[i] > 0.0) p++;
			else z++;
		}
		r.status = {pos: p, neg: n, zero: z, valid: k, empty: !k || ((z + 1) | p | n) >= 4};
	}

	function interpolate(p1, p2, fa, fb) {
		var r = -fb / (fa - fb);
		if (r >= 0 && r <= 1) { return r * (p1 - p2) + p2; }
		return (p1 + p2) * 0.5;
	};

	function createLine(x1, y1, x2, y2) {
		me.pts[0] = new Point(x1, y1, false);
		me.pts[1] = new Point(x2, y2, true);
		return VALID;
	}

	function oppSign(x, y) {
		return x * y < 0.0;
	}

	me.abortList = function() {
		for(var i = 0; i < me.openList.length; i++) {
			me.segments.push(me.openList[i].start);
			me.segments = me.segments.concat(me.openList[i].points.toArray());
			me.segments.push(me.openList[i].end);
		}
		me.openList = [];
	};

	me.create = function(r) {
		if(r.status.empty) return EMPTY;
		var zer = r.status.zero;
		var neg = r.status.neg;
		var pos = r.status.pos;
		if(((zer + 1) | neg | pos) >= 4) { return EMPTY; }
		var x1 = r.x1(), x2 = r.x2(), y1 = r.y1(), y2 = r.y2();
		var tl = r.eval[0], tr = r.eval[1], br = r.eval[2], bl = r.eval[3];
		switch(zer) {
			case 0:
				var k = 0;
				if(neg === pos && !oppSign(tl, br)) return T0101;
				if(oppSign(tl, tr)) me.pts[k++] = new Point(interpolate(x1, x2, tl, tr), y1, k !== 0);
				if(oppSign(tr, br)) me.pts[k++] = new Point(x2, interpolate(y1, y2, tr, br), k !== 0);
				if(oppSign(br, bl)) me.pts[k++] = new Point(interpolate(x1, x2, bl, br), y2, k !== 0);
				if(oppSign(bl, tl)) me.pts[k++] = new Point(x1, interpolate(y1, y2, tl, bl), k !== 0);
				return VALID;
			case 1:
				if(neg === 3 || pos === 3) {
					if(tl === 0.0) return createLine(x1, y1, x1, y1);
					if(tr === 0.0) return createLine(x2, y1, x2, y1);
					if(bl === 0.0) return createLine(x1, y2, x2, y2);
					if(br === 0.0) return createLine(x2, y2, x2, y2);
				}
				if(tl === 0.0) {
					if(oppSign(bl, br)) return createLine(x1, y1, interpolate(x1, x2, bl, br), y2);
					if(oppSign(tr, br)) return createLine(x1, y1, x2, interpolate(y1, y1, tr, br));
					return EMPTY;
				}
				if(tr === 0.0) {
					if(oppSign(bl, br)) return createLine(interpolate(x1, x2, bl, br), y2, x2, y1);
					if(oppSign(bl, tl)) return createLine(x1, interpolate(y1, y2, tl, bl), x2, y1);
					return EMPTY;
				}
				if(br === 0.0) {
					if(oppSign(tl, tr)) return createLine(interpolate(x1, x2, tl, tr), y1, x2, y2);
					if(oppSign(tl, bl)) return createLine(x1, interpolate(y1, y2, tl, bl), x2, y2);
					return EMPTY;
				}
				if(bl === 0.0) {
					if(oppSign(tl, tr)) return createLine(x1, y2, interpolate(x1, x2, tl, tr), y1);
					if(oppSign(tr, br)) return createLine(x1, y2, x2, interpolate(y1, y2, tr, br));
					return EMPTY;
				}
				return EMPTY;
			case 2:
				if(pos === 2 || neg === 2) {
					if(tl === 0.0) {
						if(tr === 0.0) return createLine(x1, y1, x2, y1);
						if(bl === 0.0) return createLine(x1, y1, x1, y2);
					} else if(br === 0.0) {
						if(tr === 0.0) return createLine(x2, y1, x2, y2);
						if(bl === 0.0) return createLine(x1, y2, x2, y2);
					}
				} else {
					if(tr === 0.0 && bl === 0.0) return createLine(x1, y2, x2, y1);
					if(tl === 0.0 && br === 0.0) return createLine(x1, y1, x2, y2);
				}
				return EMPTY;
		}
	};

	me.append = function(r) {
		var cfg = me.create(r);
		if(cfg === VALID) {
			if(me.pts[0].x > me.pts[1].x) {
				var temp = me.pts[0]; me.pts[0] = me.pts[1]; me.pts[1] = temp;
			}
			var inx1 = -1, inx2 = -1;

			for(var i = 0; i < me.openList.length; i++) {
				if(me.pts[1].equals(me.openList[i].start)) {
					inx1 = i;
					break;
				}
			}

			for(var i = 0; i < me.openList.length; i++) {
				if(me.pts[0].equals(me.openList[i].end)) {
					inx2 = i;
					break;
				}
			}

			if(inx1 !== -1 && inx2 !== -1) {
				me.openList[inx2].merge(me.openList[inx1]);
				me.openList.splice(inx1, 1);
			} else if(inx1 !== -1) {
				me.openList[inx1].unshift(me.pts[0]);
			} else if(inx2 !== -1) {
				me.openList[inx2].push(me.pts[1]);
			} else {
				me.openList.push(new PointList(me.pts[0], me.pts[1]));
			}
			if(me.openList.length > LIST_THRESHOLD) {
				me.abortList();
			}
		}
		return cfg;
	};

	me.update = function(x1, y1, x2, y2, px, py, fast) {
		x1 -= 0.25 * Math.PI / px;
		if(fast) {
			me.sw = 8;
			me.sh = 8;
		} else {
			me.sw = Math.min(MAX_SPLIT, Math.floor(px / RES_COARSE));
			me.sh = Math.min(MAX_SPLIT, Math.floor(py / RES_COARSE));
		}
		if (me.sw == 0 || me.sh == 0) { return; }
		if (me.grid === null || me.grid.length !== me.sh || me.grid[0].length !== me.sw) {
			me.grid = [];
			for (var i = 0; i < me.sh; i++) {
				var col = [];
				for (var j = 0; j < me.sw; j++) {
					col.push(new Rectangle(me.func));
				}
				me.grid.push(col);
			}
		}

		if(me.temp === null) {
			me.temp = new Rectangle(me.func);
		}

		var w = x2 - x1, h = y2 - y1, cur, prev;
		var frx = w / me.sw, fry = h / me.sh;

		var vertices = [], xcoords = [], ycoords = [];

		for (var i = 0; i <= me.sw; i++) {
			xcoords.push(x1 + i * frx);
		}

		for (var i = 0; i <= me.sh; i++) {
			ycoords.push(y1 + i * fry)
		}

		for (var i = 0; i <= me.sw; i++) {
			vertices.push(me.func(xcoords[i], ycoords[0]));
		}
		var i, j, dx, dy, fx, fy;

		for (i = 1; i <= me.sh; i++) {
			prev = me.func(xcoords[0], ycoords[i]);
			fy = ycoords[i] - 0.5 * fry;
			for (j = 1; j <= me.sw; j++) {
				cur = me.func(xcoords[j], ycoords[i]);
				var rect = me.grid[i - 1][j - 1];
				rect.set(j - 1, i - 1, frx, fry, false);
				rect.rect[0] = xcoords[j - 1];
				rect.rect[1] = ycoords[i - 1];
				rect.eval[0] = vertices[j - 1];
				rect.eval[1] = vertices[j];
				rect.eval[2] = cur;
				rect.eval[3] = prev;
				rect.status = buildStatus(rect);
				vertices[j - 1] = prev;
				prev = cur;
			}
			vertices[me.sw] = prev;
		}

		me.plotDepth = 2;
		me.segmentCheckDepth = 1;
		LIST_THRESHOLD = 48;

		for (i = 0; i < me.sh; i++) {
			for (j = 0; j < me.sw; j++) {
				if (!me.grid[i][j].singular && me.grid[i][j].status != EMPTY) {
					me.temp.copy(me.grid[i][j]);
					me.plot(me.temp, 0);
					me.grid[i][j].status = FINISHED;
				}
			}
		}

		for (var k = 0; k < 4; k++) {
			for (i = 0; i < me.sh; i++) {
				for (j = 0; j < me.sw; j++) {
					if (me.grid[i][j].singular
							&& me.grid[i][j].status != FINISHED) {
						me.temp.copy(grid[i][j]);
						me.plot(temp, 0);
						me.grid[i][j].status = FINISHED;
					}
				}
			}
		}
		me.abortList();
		me.finish(me.segments);
	};

	me.makeTree = function(r, d) {
		var children = r.split();
		me.plot(children[0], d);
		me.plot(children[1], d);
		me.plot(children[2], d);
		me.plot(children[3], d);
	};

	me.plot = function(r, d) {
		if(d < me.segmentCheckDepth) {
			me.makeTree(r, d + 1);
			return;
		}
		buildStatus(r);
		if(!r.status.empty) {
			if(d >= me.plotDepth) {
				if(me.append(r, d === MAX_DEPTH) === T0101 && d < MAX_DEPTH) {
					me.makeTree(r, d + 1);
				}
			} else {
				me.makeTree(r, d + 1);
			}
		}
	};
 };

// plotter code using jsxgraph

var CanvasPlotter = function(board, func) {
var me = {};

me.board = board; me.func = func;
me.x1 = -10; me.x2 = 10;
me.y1 = -10; me.y2 = 10;
me.color = "green";
me.px = 300; me.py = 300;
	me.tx = 0; me.ty = 0;
	me.working = false;

	me.finish = function(segments)
	{
		board.create('transform', [-me.x1 * me.tx, me.y2 * me.ty], {type: 'translate'});
		board.create('transform', [me.tx, -me.ty], {type: 'scale'});

	var xs = [];
	var ys = [];

		for (var i = 0; i < segments.length; i++)
		{
		var s = segments[i];
		if (!s.lineTo && xs.length)
		{
			board.create('curve', [xs, ys], {strokeWidth:2});
			xs = [];
			ys = [];
		}

		xs.push(segments[i].x);
		ys.push(segments[i].y);
		}
	if (xs.length)
	{
		board.create('curve', [xs, ys], {strokeWidth:2});
	}
	}

	me.update = function(fast = false)
	{
		me.px = board.canvasWidth;//canvas.scrollWidth;
		me.py = board.canvasHeight;//canvas.scrollHeight;
		me.tx = me.px / (me.x2 - me.x1);
		me.ty = me.py / (me.y2 - me.y1);
		me.plot = new Implicit(me.func, me.finish);
		me.plot.update(me.x1, me.y1, me.x2, me.y2, me.px, me.py, fast);
	}

	return me;
};

//var cv = new CanvasPlotter(board, function(x, y) {return -1;});




///////////////////////////////////////////////////////////////////////////////
//
// Plots a relation in two dimensions. The format of the input is expected to
//    be one of the following formats:
//
//          y = f(x), or just f(x) - for standard rectangular functions
//          r = f(t) - for polar equations
//          [ x(t), y(t) ] - for parametric equations
//          x = g(y) - for rectangular equations rotated by 90 degrees
//          *** functionality for general equations to come at a later time
//
//    Rectangular functions can be plotted on a restricted interval
//
//    Polar and parametric equations must have an interval of t provided to
//        plot over
//
//    If no equals sign is provided, it is assumed that the function is a
//        rectangular function of x.
//
//
///////////////////////////////////////////////////////////////////////////////

function plot(curve, relation, start_x, end_x, args) {

	if(args === undefined) {
		var args = {};
	}

	var holeloc = '';
	var endpoints = [];

	relation = relation.toLowerCase();

	if (isImplicitEquation(relation)) {
		relation = convertImplicitEquation(relation);
	}

	// math.js does not support ln notation for natural logarithm
	relation = relation.replace(/ln/g, "log");

	if (relation == '' && args.interval != '') {

		// This is just a point, just determine if it's open or closed and plot

		var interval = args.interval.trim();
		var closed = false;

		if (interval.startsWith('[') || interval.endsWith(']')) {
			closed = true;
		}

		var vals = interval.split(',');
		vals[0] = vals[0].substring(1, vals[0].length);
		vals[1] = vals[1].substring(0, vals[1].length-1);

		var lowerendpoint = args.lowerendpoint ? args.lowerendpoint : -1;
		var upperendpoint = args.upperendpoint ? args.upperendpoint : -1;
		var hole = args.hole ? args.hole : -1;
		var color = args.color ? args.color : 'blue';

		if(hole != -1) {
			hole.setAttribute({ visible: false });
		}

		if(lowerendpoint != -1) {
			lowerendpoint.setAttribute({ visible: false });
		}

		if(upperendpoint != -1) {
			upperendpoint.setAttribute({ visible: false });
		}


		var x = evalstr(vals[0]);
		var y = evalstr(vals[1]);

		lowerendpoint.moveTo([x, y]);

		lowerendpoint.setAttribute({ strokeColor: color, visible: true });
		if (closed) {
			lowerendpoint.setAttribute({ fillColor: color });
		} else {
			lowerendpoint.setAttribute({ fillColor: 'white' });
		}

	} else {

		var vars = getVariables(relation);
		var fname = getFunctionName(relation);

		// if there is no function name given, and we can assume it is a function
		// of x, then just append a y =
		if(fname == '' && ((vars[0] == 'x' && vars.length == 1) || (vars.length == 0))) {
			fname = 'y';
		}
		relation = removeFunctionName(relation);

		if(fname != '') {

			if(vars.length == 0) {

				// Plot: horizontal line
				if(fname == 'y') {
					args.density = 1;
					plot_function(curve, relation, start_x, end_x, args);
				}

				// Plot vertical line
				if(fname == 'x') {
					args.variable = 't';
					args.density = 1;
					var bounds = JSXGetBounds(board);
					var tmin = bounds.ymin;
					var tmax = bounds.ymax;
					plot_parametric(curve, relation, 't', tmin, tmax, args);
				}

				// Plot is a circle
				if(fname == 'r') {
					args.variable = 't';
					var interval = args.interval ? args.interval : '';
					var tmin = 0;
					var tmax = 2 * PI;
					if (interval != '') {
						var lval = getLowerEndpoint(interval);
						tmin = lval == NEGATIVE_INFINITY ? -12 * PI : lval;
						var uval = getUpperEndpoint(interval);
						tmax = uval == POSITIVE_INFINITY ? 12 * PI : uval;
					}

					plot_polar(curve, relation, tmin, tmax, args);
				}
			}

			if(vars.length == 1) {

				if(vars[0] == 'x' || fname == 'f' || fname == 'y') {

					// rectangular plot y = f(x)
					plot_function(curve, relation, start_x, end_x, args);

				} else if(vars[0] == 'y' || fname == 'g' || fname == 'x') {

					// rectangular x = g(y)
					args.variable = vars[0];
					var bounds = JSXGetBounds(board);
					var tmin = bounds.ymin;
					var tmax = bounds.ymax;
					plot_parametric(curve, relation, args.variable, tmin, tmax, args);

				} else if(fname == 'r' && vars[0] == 't') {

					// Polar Graph
					var interval = args.interval ? args.interval : '';
					var tmin = 0;
					var tmax = 2 * PI;
					if (interval != '') {
						var lval = getLowerEndpoint(interval);
						tmin = lval == NEGATIVE_INFINITY ? -12 * PI : lval;
						var uval = getUpperEndpoint(interval);
						tmax = uval == POSITIVE_INFINITY ? 12 * PI : uval;
					}

					plot_polar(curve, relation, tmin, tmax, args);

				}

			} // if(vars.length == 1)

		} else if(vars[0] == 't' && vars.length == 1) {
			// Parametrically defined functions

			var interval = args.interval ? args.interval : '';
			var bounds = JSXGetBounds(board);
			var tmin = bounds.xmin < bounds.ymin ? bounds.xmin : bounds.ymin;
			var tmax = bounds.xmax > bounds.ymax ? bounds.xmax : bounds.ymax;
			if (interval != '') {
				var lval = getLowerEndpoint(interval);
				tmin = lval == NEGATIVE_INFINITY ? tmin : lval;
				var uval = getUpperEndpoint(interval);
				tmax = uval == POSITIVE_INFINITY ? tmax : uval;
			}
			relation = removeSpaces(relation);
			var cloc = relation.search(',');

			var x_t = removeSpaces(relation.substring(1, cloc));
			var y_t = removeSpaces(relation.substring(cloc + 1, relation.length - 1));

			plot_parametric(curve, x_t, y_t, tmin, tmax, args);

		} else if(vars.length == 2) {
			implicit_plot(relation, args);
		}

	}

}



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

function makeJSFunction(board, s, variable) {

	variable = variable === undefined ? 'x' : variable;

	s = preprocessFunction(s);

	return board.jc.snippet(s, true, variable, false);
}

///////////////////////////////////////////////////////////////////////////////
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

///////////////////////////////////////////////////////////////////////////////
//
// Example of a function that handles multiple parameter inputs
//
///////////////////////////////////////////////////////////////////////////////

		 // function Point(arg) {
				// var loc = arg.loc ? arg.loc : [0, 0];
				// var visible = arg.visible ? arg.visible : false;
				// var snapToGrid = arg.snapToGrid ? arg.snapToGrid : false;
				// var snapSize = arg.snapSize ? arg.snapSize : 1;
				// var name = arg.name ? arg.name : 'p';
				// var showInfoBox =  arg.showInfoBox ? arg.showInfoBox : false;

				// var p = board.create('point', loc, {
						// visible: visible,
						// snapToGrid: snapToGrid,
						// snapSizeX: snapSize,
						// snapSizeY: snapSize,
						// name: name,
						// showInfoBox: false
				// });

				// return p;

		// }