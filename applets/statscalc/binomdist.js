// Binomial Distribution Applet
//
// Improvments:
// - Add error messages to indicate bad input
// - Add button to copy scratch work to the clipboard

let binom = {
	n: 8,
	p: 0.75,
	mean: function() { return this.n * this.p; },
	stdev: function() { return sqrt(this.mean() * (1 - this.p))},

	xmin: function() { return -1; },
	xmax: function() { return this.n + 1; },
	ymin: function() { return -this.ymax(); },
	ymax: function() { return stats.max(binom_getbarheights()) * 1.5; },

	x1: 3,
	x2: 6,

	ptype: 'BETWEEN', // 'BETWEEN', 'LEFT', 'RIGHT', 'EQUAL'

}


let binom_board = JXG.JSXGraph.initBoard('binomial-distribution', {
	boundingbox: [binom.xmin(), binom.ymax(), binom.xmax(), binom.ymin()],
	//boundingbox: [-10, 10, 10, -10],
  	showCopyright: false,
  	showNavigation: false,
	keepaspectratio: false,
	axis: false,
	zoom: {
		factorX: 1.25,
		factorY: 1.25,
		wheel: false,
		needshift: false,
		eps: 0.1,
		enabled: false,
	},
	pan: {
		enabled: false,
	},
   	keyboard: {
       	enabled: false,
   	},
	showScreenShot: {
		enabled: true,
	},
});

// Create the binomial axis, labels, histogram, and interactive points

let binom_histogram = new Histogram(binom_board, binom_getbarheights(), binom_getcolors(), [-0.5, 0], 1);

let binom_axis = binom_board.create('line', [[0, 0], [1, 0]],
		{ strokeColor: 'black', strokeWidth: 1, highlight: false, fixed: true, frozen: true });

let binom_ticks = [];
let binom_labels = [];
binom_updateAxis();

let binom_p1 = binom_board.create('glider', [binom.x1, 0, binom_axis],
		{ withLabel: false, showInfobox: false, color: 'black', snapToGrid: true, snapSizeX: 1 });
binom_p1.on('drag',
	function() {
		// Bounds check on the movable point
		if(binom_p1.X() < 0) { binom_p1.moveTo([0, 0]); }
		if(binom_p1.X() > binom.n) { binom_p1.moveTo([binom.n, 0]);	}
		binom.x1 = binom_p1.X();
		binom_x1_input.set(binom.x1);
		binom_docalc();
	}
);

let binom_p2 = binom_board.create('glider', [binom.x2, 0, binom_axis],
		{ withLabel: false, showInfobox: false, color: 'black', snapToGrid: true, snapSizeX: 1 });
binom_p2.on('drag',
	function() {
		// Bounds check on the movable point
		if(binom_p2.X() < 0) { binom_p2.moveTo([0, 0]); }
		if(binom_p2.X() > binom.n) { binom_p2.moveTo([binom.n, 0]);	}
		binom.x2 = binom_p2.X();
		binom_x2_input.set(binom.x2);
		binom_docalc();
	}
);

// Create the mean and standard deviation output items

let binom_mean_label = binom_board.create('text', [7, 0.42,
	function() {
		return '&mu; = ' + binom.mean().toFixed(4);
	}],	textParam);

let binom_stdev_label = binom_board.create('text', [7, 0.37,
	function() {
		return '&sigma; = ' + binom.stdev().toFixed(4);
	}],	textParam);

// Checkboxes

let binom_cb = [];

binom_cb['BETWEEN'] = JSXCheckbox(binom_board, -0.5, -0.07, 'P(a &le; x &le; b)', true,
	function() { set_cb_between_active(); }, { fontSize: 18, frozen: true });

binom_cb['LEFT'] = JSXCheckbox(binom_board, -0.5, -0.13, 'P(x &le; b)', false,
	function() { set_cb_left_active(); }, { fontSize: 18, frozen: true });

binom_cb['RIGHT'] = JSXCheckbox(binom_board, -0.5, -0.19, 'P(x &ge; a)', false,
	function() { set_cb_right_active(); }, { fontSize: 18, frozen: true });

binom_cb['EQUAL'] = JSXCheckbox(binom_board, -0.5, -0.25, 'P(x = a)', false,
	function() { set_cb_equal_active(); }, { fontSize: 18, frozen: true });

let binom_n_input = binom_board.create('input',	[5, -0.07, binom.n, 'n = '], inputParam);

let binom_p_input = binom_board.create('input',	[5, -0.14, binom.p, 'p = '], inputParam);

let binom_x1_input = binom_board.create('input', [-0.5, -0.32, binom.x1, 'P( '], inputParam);

let binom_x2_input = binom_board.create('input', [2.5, -0.32, binom.x2, ' &le; <i>X</i> &le; '], inputParam);

let binom_prob_input = binom_board.create('input', [6, -0.32, binom_cprob(), ') = '], inputParam);
binom_prob_input.setAttribute({ disabled: true });

let binom_calc_button = binom_board.create('button', [7, -0.4, 'Calculate',
	function() { binom_docalc(); }], buttonParam);

let binom_copy_func = binom_board.create('button', [-0.5, -0.4, 'Copy Function',
    function() {
		alert(binom_make_function() + ' copied to clipboard.');
        navigator.clipboard.writeText(binom_make_function()); 
	}
], buttonParam);

// Keyboard input handlers
binomial_key_handler = function(e) { 
    if(e.which === 13 || e.which === 9) { 
        binom_docalc(); 
    }
};

binom_n_input.rendNodeInput.onkeydown = function(e) { binomial_key_handler(e); };
binom_p_input.rendNodeInput.onkeydown = function(e) { binomial_key_handler(e) };
binom_x1_input.rendNodeInput.onkeydown = function(e) { binomial_key_handler(e); };
binom_x2_input.rendNodeInput.onkeydown = function(e) { binomial_key_handler(e) };


// Make sure any movement a student makes updates the calculation
binom_n_input.rendNodeInput.addEventListener('focusout', function() { binom_docalc(); });
binom_p_input.rendNodeInput.addEventListener('focusout', function() { binom_docalc(); });
binom_x1_input.rendNodeInput.addEventListener('focusout', function() { binom_docalc(); });
binom_x2_input.rendNodeInput.addEventListener('focusout', function() { binom_docalc(); });

function binom_docalc () {

	binom_board.suspendUpdate();

	if (binom_n_updated()) {

		// Remove old histogram
		for(let i of binom_histogram.bars) {
			binom_board.removeObject(i.rect);
		}

		// Draw new histogram
		if(binom.n <= 60) {
			binom_histogram = new Histogram(binom_board, binom_getbarheights(), binom_getcolors(), [-0.5, 0], 1);
		}

		// Update Axis
		var binom_bounds = JSXGetBounds(binom_board);
		binom_bounds.ymax = binom.ymax();
		binom_bounds.ymin = binom.ymin();
		binom_bounds.xmax = binom.xmax();
		binom_bounds.xmin = binom.xmin();

		JSXSetBounds(binom_board, binom_bounds);
		binom_updateAxis();

		// Make sure values of x1 and x2 are within the new range
		if (binom.x1 < 0) {
			binom.x1 = 0;
		} else if (binom.x1 > binom.n) {
			binom.x1 = binom.n;
		}

		if (binom.x2 < 0) {
			binom.x2 = 0;
		} else if (binom.x2 > binom.n) {
			binom.x2 = binom.n;
		}
		binom_x1_input.set(binom.x1);
		binom_p1.moveTo([binom.x1, 0]);
		binom_x2_input.set(binom.x2);
		binom_p2.moveTo([binom.x2, 0]);

	} else if (binom_p_updated()) {
		// Update histogram bar heights
		var binom_bounds = JSXGetBounds(binom_board);
		binom_bounds.ymax = binom.ymax();
		binom_bounds.ymin = binom.ymin();
		binom_bounds.xmax = binom.xmax();
		binom_bounds.xmin = binom.xmin();
		JSXSetBounds(binom_board, binom_bounds);
		binom_updateAxis();
		binom_histogram.setBarHeights(binom_getbarheights(), 0);
	}

	// Check for changes in input boxes
	let temp_x1 = evalstr(binom_x1_input.Value());
	let temp_x2 = evalstr(binom_x2_input.Value());

	if(!Number.isInteger(temp_x1) || temp_x1 < 0 || temp_x1 > binom.n) {
		binom_x1_input.set(binom.x1);
	} else {
		binom.x1 = temp_x1;
		binom_p1.moveTo([binom.x1, 0]);
	}

	if(!Number.isSafeInteger(temp_x2) || temp_x2 < 0 || temp_x2 > binom.n) {
		binom_x2_input.set(binom.x2);
	} else {
		binom.x2 = temp_x2;
		binom_p2.moveTo([binom.x2, 0]);
	}

	// Run calculation
	binom_update_colors();
	binom_prob_input.set(binom_cprob());
	binom_board.unsuspendUpdate();

}

function binom_updateAxis() {

	var step = 1;

	if (binom.n <= 20) {
		step = 1;
	} else if (binom.n > 20 && binom.n <= 50) {
		step = 2;
	} else if (binom.n > 50 && binom.n <= 100) {
		step = 5;
	} else if (binom.n > 100 && binom.n <= 200) {
		step = 10;
	} else if (binom.n <= 300) {
		step = 20;
	} else {
		step = -1;
	}

	for(let i of binom_ticks) {
		binom_board.removeObject(i);
	}

	for(let i of binom_labels) {
		binom_board.removeObject(i);
	}

	let ymax = binom.ymax();
	let tick_height = 0.01 * ymax;
	let label_pos = 0.05 * ymax;

	if(step > 0) {
		for(var i = 0; i <= (binom.n / step); i++) {
			binom_labels[i] = binom_board.create('text', 
				[(i * step) - label_pos, -label_pos, i * step], 
				{ fixed: true, highlight: false }
			);
			binom_ticks[i] = binom_board.create('segment', 
				[[(i * step), -tick_height], [(i * step), tick_height]], 
				{ color: 'grey', strokeWidth: 1, fixed: true, highlight: false }
			);
		}
	}

}

function binom_cprob() {

	if(binom.ptype === 'BETWEEN') {
		let upper = jStat.binomial.cdf(max(binom.x1, binom.x2), binom.n, binom.p);
		let lower = jStat.binomial.cdf(min(binom.x1, binom.x2) - 1, binom.n, binom.p);
		binom.prob = abs(upper - lower);
	} else if(binom.ptype === 'LEFT') {
		binom.prob = jStat.binomial.cdf(binom.x2, binom.n, binom.p);
	} else if(binom.ptype === 'RIGHT') {
		binom.prob = 1 - jStat.binomial.cdf(binom.x1 - 1, binom.n, binom.p);
	} else if(binom.ptype == 'EQUAL') {
		binom.prob = jStat.binomial.pdf(binom.x2, binom.n, binom.p);
	}

    return binom.prob;

}

function binom_getbarheights() {
	let prob = [];
	for (var i = 0; i <= binom.n; i++) {
		prob.push(jStat.binomial.pdf(i, binom.n, binom.p));
	}
	return prob;
}

function binom_getcolors() {
	let colors = [];

	if (binom.ptype === 'EQUAL') {
		for (var i = 0; i <= binom.n; i++) {
			colors[i] = i === binom.x2 ? '#0000FF' : 'white';
		}
	} else if (binom.ptype === 'LEFT') {
		for (var i = 0; i <= binom.n; i++) {
			colors[i] = i <= binom.x2 ? '#0000FF' : 'white';
		}
	} else if (binom.ptype === 'RIGHT') {
		for (var i = 0; i <= binom.n; i++) {
			colors[i] = i < binom.x1 ? 'white' : '#0000FF';
		}
	} else if (binom.ptype === 'BETWEEN') {
		var p1 = binom.x1 >= binom.x2 ? binom.x2 : binom.x1;
		var p2 = binom.x1 >= binom.x2 ? binom.x1 : binom.x2;
		for (var i = 0; i <= binom.n; i++) {
			colors[i] = i < p1 || i > p2 ? 'white' : '#0000FF';
		}
	}

	return colors;
}

function binom_n_updated() {

	let param_change = false;
	let temp_n = evalstr(binom_n_input.Value());

	// If invalid input is provided, then revert back to original value of n
	if(!Number.isSafeInteger(temp_n) || temp_n < 1) {
		binom_n_input.set(binom.n)
	} else if(binom.n !== temp_n) {
		binom.n = temp_n;
		param_change = true;
	}

	return param_change;
}

function binom_p_updated() {

	let param_change = false;
	let temp_p = evalstr(binom_p_input.Value());

	// If invalid input is provided, then revert back to original value of r
	if(!isFinite(temp_p) || temp_p <= 0 || temp_p >= 1) {
		binom_p_input.set(binom.p);
	} else if (abs(temp_p - binom.p) > DEC_PREC) {
		binom.p = temp_p;
		param_change = true;
	}

	return param_change;
}

function binom_update_colors() {

	binom_board.suspendUpdate();
	var colors = binom_getcolors();

	for (var i = 0; i <= binom.n; i++) {
		if(typeof(binom_histogram.bars[i]) !== 'undefined') {
			binom_histogram.bars[i].rect.setAttribute({ fillColor: colors[i] });
		}
	}
	binom_board.unsuspendUpdate();

}

function set_cb_between_active() {
	binom.ptype = 'BETWEEN';
	set_binom_cbtrue(binom.ptype);

	// Make sure both points and input boxes are visible and enabled
	binom_p1.setAttribute({ visible: true });
	binom_p2.setAttribute({ visible: true });
	binom_x1_input.setAttribute({ disabled: false, visible: true });
	binom_x2_input.setAttribute({ disabled: false, visible: true });

	binom_x2_input.rendNodeLabel.innerHTML = ' &le; <i>X</i> &le; ';
	binom_docalc();
}

function set_cb_left_active() {
	binom.ptype = 'LEFT';
	set_binom_cbtrue(binom.ptype);

	// Make sure only p2 and x2 are visible and enabled
	binom_p1.setAttribute({ visible: false });
	binom_p2.setAttribute({ visible: true });
	binom_x1_input.setAttribute({ disabled: true, visible: true });
	binom_x2_input.setAttribute({ disabled: false, visible: true });

	binom_x2_input.rendNodeLabel.innerHTML = ' &le; <i>X</i> &le; ';
	binom_docalc();
}

function set_cb_right_active() {
	binom.ptype = 'RIGHT';
	set_binom_cbtrue(binom.ptype);

	// Make sure only p1 and x1 are visible and enabled
	binom_p1.setAttribute({ visible: true });
	binom_p2.setAttribute({ visible: false });
	binom_x1_input.setAttribute({ disabled: false, visible: true });
	binom_x2_input.setAttribute({ disabled: true, visible: true });

	binom_x2_input.rendNodeLabel.innerHTML = ' &le; <i>X</i> &le; ';
	binom_docalc();
}

function set_cb_equal_active() {
	binom.ptype = 'EQUAL';
	set_binom_cbtrue(binom.ptype);

	// Make sure only p2 and x2 are visible and enabled
	binom_p1.setAttribute({ visible: false });
	binom_p2.setAttribute({ visible: true });
	binom_x1_input.setAttribute({ disabled: true, visible: false });
	binom_x2_input.setAttribute({ disabled: false, visible: true });

	binom_x2_input.rendNodeLabel.innerHTML = 'P( X = ';
	binom_docalc();
}

function binom_make_function() {
    let s = '';
    if (binom.ptype === 'BETWEEN') {
		s += `binomcdf( ${binom.n}, ${binom.p}, ${binom.x2} ) - binomcdf( ${binom.n}, ${binom.p}, ${binom.x1 - 1} )`
	} else if (binom.ptype === 'LEFT') {
		s += `binomcdf( ${binom.n}, ${binom.p}, ${binom.x2} )`
	} else if (binom.ptype === 'RIGHT') {
		s += `1 - binomcdf( ${binom.n}, ${binom.p}, ${binom.x1 - 1} )`
	} else if (binom.ptype === 'EQUAL') {
		s += `binompdf( ${binom.n}, ${binom.p}, ${binom.x2} )`
	}
    return s;
}

function set_binom_cbtrue(box) {
	for(let i in binom_cb) {
		setCheckbox(binom_cb[i], i === box);
	}
}