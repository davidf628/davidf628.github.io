// Useful constants

PI        = 3.14159265358979323846;  
E         = 2.71828182845904523536;
LN2       = 0.69314718055994530942;  
LN10      = 2.30258509299404568402;
PHI       = 1.61803398874989484821;
LNPI      = 1.14472988584940017414;
LNSQRT2PI = 0.91893853320467274178;
SQRT2PI   = 2.50662827463100050242;

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

// Convenience functions
function sqr(x) { return Math.pow(x, 2); }
function odd(x) { return (x % 2) == 1; }
function even(x) { return (x % 2) == 0; }
function ln(x) { return Math.log(x); }
function log(x) { return Math.log(x) / Math.log(10); }
function logb(x) { return Math.log(x) / Math.log(b); }


/* Returns a random integer between (inclusive) two integer values. */
function randInt(a, b) {
   return Math.floor((b-a-1) * Math.random()) + a;
}

function round(num, dec)
{
  var factor = Math.pow(10,dec);
  return Math.round(num * factor) / factor;
}

/* 
    Returns the factorial of n if 0 <= n <= 170 and n is an integer, 
    or else 0 is returned.
   
    You will get creepy results if n is not an integer.
*/
function factorial (n) {

    var i, fact = 1;
    
    if((n <= MAXFACT) && (n >= 0)) {
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
    The last flag means: 0 - pdf and 1 - cdf
    
*/
function binomial (x, n, p, cdf) {
    
    var prob = 0;
    
    if(cdf == 0) {
        return combination(n, x) * Math.pow(p, x) * Math.pow(1-p, n-x);
    } else {
        for(i = 0; i <= x; i++) {
            prob += combination(n, i) * Math.pow(p, i) * Math.pow(1-p, n-i);
        }
        return prob;
    }
    
}

/*
	Calculates normal distribution values. Used to draw bell curves.
*/
function normalpdf (x) {
	return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-(x*x) / 2); 
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

  // An algorithm with a relative error less than 1.15·10-9 in the entire region.

  // Coefficients in rational approximations
  var a = new Array(-3.969683028665376e+01,  2.209460984245205e+02,
                    -2.759285104469687e+02,  1.383577518672690e+02,
                    -3.066479806614716e+01,  2.506628277459239e+00);
  var b = new Array(-5.447609879822406e+01,  1.615858368580409e+02,
                    -1.556989798598866e+02,  6.680131188771972e+01,
                    -1.328068155288572e+01 );
  var c = new Array(-7.784894002430293e-03, -3.223964580411365e-01,
                    -2.400758277161838e+00, -2.549732539343734e+00,
                     4.374664141464968e+00,  2.938163982698783e+00);
  var d = new Array (7.784695709041462e-03,  3.224671290700398e-01,
                     2.445134137142996e+00,  3.754408661907416e+00);

  // Define break-points.
  var plow  = 0.02425;
  var phigh = 1 - plow;

  // Rational approximation for lower region:
  if ( p < plow ) {
           var q  = Math.sqrt(-2*Math.log(p));
           return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
                                           ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }

  // Rational approximation for upper region:
  if ( phigh < p ) {
           var q  = Math.sqrt(-2*Math.log(1-p));
           return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
                                                  ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }

  // Rational approximation for central region:
  var q = p - 0.5;
  var r = q*q;
  return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
                           (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}

///////////////////////////////////////////////////////////////////////////////
//
//  Calculates the t-distribution pdf for a given value of tc and degrees of
//  freedom. Formula for the pdf found at wikipedia.org. 
//
// 		@param t - The t-score with which to find the point on the t-distribution
//   			   curve
//
// 		@param df - Number of degrees of freedom
// 	
//  	@return The point on the t-distribution curve with df degrees of
//   		freedom at a given t-score.
//
///////////////////////////////////////////////////////////////////////////////
    

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

  // An algorithm with a relative error less than 1.15·10-9 in the entire region.

  // Coefficients in rational approximations
  var a = new Array(-3.969683028665376e+01,  2.209460984245205e+02,
                    -2.759285104469687e+02,  1.383577518672690e+02,
                    -3.066479806614716e+01,  2.506628277459239e+00);
  var b = new Array(-5.447609879822406e+01,  1.615858368580409e+02,
                    -1.556989798598866e+02,  6.680131188771972e+01,
                    -1.328068155288572e+01 );
  var c = new Array(-7.784894002430293e-03, -3.223964580411365e-01,
                    -2.400758277161838e+00, -2.549732539343734e+00,
                     4.374664141464968e+00,  2.938163982698783e+00);
  var d = new Array (7.784695709041462e-03,  3.224671290700398e-01,
                     2.445134137142996e+00,  3.754408661907416e+00);

  // Define break-points.
  var plow  = 0.02425;
  var phigh = 1 - plow;

  // Rational approximation for lower region:
  if ( p < plow ) {
           var q  = Math.sqrt(-2*Math.log(p));
           return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
                                           ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }

  // Rational approximation for upper region:
  if ( phigh < p ) {
           var q  = Math.sqrt(-2*Math.log(1-p));
           return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
                                                  ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }

  // Rational approximation for central region:
  var q = p - 0.5;
  var r = q*q;
  return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
                           (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}

///////////////////////////////////////////////////////////////////////////////
//
//  Calculates the t-distribution pdf for a given value of tc and degrees of
//  freedom. Formula for the pdf found at wikipedia.org. 
//
// 		@param t - The t-score with which to find the point on the t-distribution
//   			   curve
//
// 		@param df - Number of degrees of freedom
// 	
//  	@return The point on the t-distribution curve with df degrees of
//   		freedom at a given t-score.
//
///////////////////////////////////////////////////////////////////////////////
    
function tpdf(t, df) {
    var p, q;

    if(df < 1) {
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
