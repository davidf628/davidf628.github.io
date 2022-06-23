// Improvements:
//
// - Add error messages when bad input is encountered
// - Hide/show input boxes on changes to which type of probability is calculated


let stu = {
	x1: -2,
	x2: 2,
	prob: 0,
	mean: 0,
	stdev: 1,
	df: 10,
	tail: 'BETWEEN', // 'BETWEEN', 'LEFT', 'RIGHT'
	mode: 'PROBABILITY' // 'PROBABILITY', 'INVERSE'
}

var t_board = JXG.JSXGraph.initBoard('t-distribution', {
		boundingbox: [-4,0.5,4,-0.5],
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

function tScore(x) {
	return (x - stu.mean) / stu.stdev;
}

function t_xval(t) {
	return stu.mean + t * stu.stdev;
}

// Create the t-distribution curve, axis and tick marks
let t_curve = t_board.create('functiongraph', [
	function(x) { 
		return jStat.studentt.pdf(tScore(x), stu.df); 
	}], curveParam);

let t_axis = t_board.create('line', [[0, 0], [1, 0]], { strokeColor: 'black', strokeWidth: 1, highlight: false, fixed: true, frozen: true });

var t_ticks = [];
var t_labels = [];
for (var i = -3; i <= 3; i++) {
	t_ticks[i + 3] = t_board.create('segment', [[i,.01], [i,-0.01]], { color: 'grey', strokeWidth: 1, fixed: true, highlight: false });
	t_labels[i + 3] = t_board.create('text', [i-.05, -0.02, i], { fixed: true, highlight: false });
}

// Create the shaded regions - one needed for left-tail, right-tail, and between 
let t_area = [];

t_area['LEFT'] = t_board.create('integral',
	[[ function() { return t_xval(-10); }, function() { return stu.x2; }], 
	t_curve], shadeParam);

t_area['RIGHT'] = t_board.create('integral',
	[[ function() { return stu.x1; }, function() { return t_xval(10); }], 
	t_curve], shadeParam);

t_area['BETWEEN'] = t_board.create('integral',
	[[ function() { return stu.x1; }, function() { return stu.x2; }], 
	t_curve], shadeParam);

t_set_area_visible(stu.tail);

// Create the gliders along the x-axis
let t_p1 = t_board.create('glider', [-2, 0, t_axis], { withLabel: false, color: 'black', snapToGrid: true, snapSizeX: 0.01 });
t_p1.on('drag',
	function() {
		update_t_axis();
		stu.x1 = t_p1.X().toFixed(2);
		t_x1_input.set(stu.x1);
		stu.prob = t_cprob();
		t_prob_input.set(stu.prob);
	}
);

let t_p2 = t_board.create('glider', [2, 0, t_axis], { withLabel: false, color: 'black', snapToGrid: true, snapSizeX: 0.01 });
t_p2.on('drag',
	function() {
		update_t_axis();
		stu.x2 = t_p2.X().toFixed(2);
		t_x2_input.set(stu.x2);
		if (stu.tail === 'BETWEEN' && stu.mode === 'INVERSE') {
			let old_t = tScore(stu.x2);
			stu.x1 = t_xval(-old_t).toFixed(2);
			t_p1.moveTo([stu.x1, 0]);
			t_x1_input.set(stu.x1);
		}
		stu.prob = t_cprob();
		t_prob_input.set(stu.prob);
	}
);

// Create input boxes for the t-distribution paramenters
let t_mean_input = t_board.create('input', [1.3, 0.45, stu.mean, '&mu; = '], inputParam);
let t_stdev_input = t_board.create('input', [1.3, 0.38, stu.stdev, 's = '], inputParam);
let t_df_input = t_board.create('input', [1.25, 0.31, stu.df, 'df = '], inputParam);

// Declare the checkboxes required to chnage input modes
let t_cb = [];

t_cb['BETWEEN'] = JSXCheckbox(t_board, -3.6, -0.1, 'P(a < x < b)', true,
	function() { t_set_cb_between_active(); }, { fontSize: 18, frozen: true });

t_cb['LEFT'] = JSXCheckbox(t_board, -3.6, -0.16, 'P(x < b)', false,
	function() { t_set_cb_left_active(); }, { fontSize: 18, frozen: true });

t_cb['RIGHT'] = JSXCheckbox(t_board, -3.6, -0.22, 'P(x > a)', false,
	function() { t_set_cb_right_active(); }, { fontSize: 18, frozen: true });

t_cb['PROBABILITY'] = JSXCheckbox(t_board, 1, -0.1, 'Calculate Area', true,
	function() { t_set_cb_area_active(); }, { fontSize: 18, frozen: true });

t_cb['INVERSE'] = JSXCheckbox(t_board, 1, -0.16, 'Calculate x-Value', false,
	function() { t_set_cb_inverse_active(); }, { fontSize: 18, frozen: true });

let t_x1_input = t_board.create('input', [-3.5, -0.32, '-2', 'P( '], inputParam);
let t_x2_input = t_board.create('input', [-1.3, -0.32, '2', ' < <i>X</i> < '], inputParam);
let t_prob_input = t_board.create('input', [1.3, -0.32, t_cprob(), ') = '], inputParam);

// Buttons
let t_calc_button = t_board.create('button', [2.3, -0.4, 'Calculate', 
	function() { 
		t_docalc(); 
	}
], buttonParam);

let t_copy_func = t_board.create('button', [-3.5, -0.4, 'Copy Function',
    function() { 
        alert(t_make_function() + ' copied to clipboard.');
        navigator.clipboard.writeText(t_make_function()); 
    }
], buttonParam);

// Keyboard input handlers
t_key_handler = function(e) { 
    if(e.which === 13 || e.which === 9) { 
    	t_docalc(); 
    }
};

t_df_input.rendNodeInput.onkeydown = function(e) { t_key_handler(e); }
t_mean_input.rendNodeInput.onkeydown = function(e) { t_key_handler(e); }
t_stdev_input.rendNodeInput.onkeypress = function(e) { t_key_handler(e); }
t_x1_input.rendNodeInput.onkeypress = function(e) { t_key_handler(e); }
t_x2_input.rendNodeInput.onkeypress = function(e) { t_key_handler(e); }
t_prob_input.rendNodeInput.onkeypress = function(e) { t_key_handler(e); }

// Make sure all movements fire an update request
t_df_input.rendNodeInput.addEventListener('focusout', function() { t_docalc(); });
t_mean_input.rendNodeInput.addEventListener('focusout', function() { t_docalc(); });
t_stdev_input.rendNodeInput.addEventListener('focusout', function() { t_docalc(); });
t_x1_input.rendNodeInput.addEventListener('focusout', function() { t_docalc(); });
t_x2_input.rendNodeInput.addEventListener('focusout', function() { t_docalc(); });
t_prob_input.rendNodeInput.addEventListener('focusout', function() { t_docalc(); });


function t_docalc() {

	update_t_axis();

	if (stu.mode === 'PROBABILITY') {

		t_update_inputs();
        
        stu.prob = t_cprob();
        t_prob_input.set(stu.prob);

	} else if (stu.mode === 'INVERSE') {

        let temp_prob = evalstr(t_prob_input.Value());

        if (isFinite(temp_prob)) {
            stu.prob = temp_prob;
        }

		if (stu.tail === 'LEFT') {
			stu.x2 = round(t_xval(jStat.studentt.inv(stu.prob, stu.df)), PRECISION);
			t_p2.moveTo([stu.x2, 0]);
			t_x2_input.set(stu.x2);
		} else if (stu.tail === 'RIGHT') {
			stu.x1 = round(t_xval(jStat.studentt.inv(1 - stu.prob, stu.df)), PRECISION);
			t_p1.moveTo([stu.x1, 0]);
			t_x1_input.set(stu.x1);
		} else if (stu.tail === 'BETWEEN') {
			stu.x1 = round(t_xval(jStat.studentt.inv((1 - stu.prob) / 2, stu.df)), PRECISION);
			stu.x2 = round(t_xval(jStat.studentt.inv((1 + stu.prob) / 2, stu.df)), PRECISION);
			t_p1.moveTo([stu.x1, 0]);
			t_x1_input.set(stu.x1);
			t_p2.moveTo([stu.x2, 0]);
			t_x2_input.set(stu.x2);
		}

	}

	t_board.update();
}

function update_t_axis() {

    // Save t-scores of current locations of x-axis points
    let old_t1 = tScore(stu.x1);
    let old_t2 = tScore(stu.x2);

    if (t_params_updated()) {
    
        // Set the bounds on the x-axis
        let x_min = t_xval(-4);
        let x_max = t_xval(4);
    
        t_board.setBoundingBox([x_min, 0.5, x_max, -0.5]);
    
        // Get the locations of the new glider points
        stu.x1 = t_xval(old_t1).toFixed(2);
        stu.x2 = t_xval(old_t2).toFixed(2);
        t_p1.moveTo([stu.x1, 0]);
        t_p2.moveTo([stu.x2, 0]);
    
        // Update the value of the glider points in the input boxes
        t_x1_input.set(stu.x1);
        t_x2_input.set(stu.x2);
    
        // Recalculate the probability
		stu.prob = t_cprob();
        t_prob_input.set(stu.prob);
    
        // Finally, update the axis labels
		for(var i = -3; i <= 3; i++) {
			t_ticks[i + 3].point1.moveTo([t_xval(i), 0.01]);
			t_ticks[i + 3].point2.moveTo([t_xval(i), -0.01]);
			t_labels[i + 3].setText(t_xval(i));
			t_labels[i + 3].setCoords([t_xval(i), -0.02]);
		}
        
    }

}

function t_cprob() {

	let prob1 = jStat.studentt.cdf(tScore(stu.x1), stu.df);
	let prob2 = jStat.studentt.cdf(tScore(stu.x2), stu.df)

	if (stu.tail === 'BETWEEN') {
		return round(abs(prob2 - prob1), PRECISION);
	} else if (stu.tail === 'LEFT') {
		return round(prob2, PRECISION);
	} else if (stu.tail === 'RIGHT') {
		return round(1 - prob1, PRECISION);
	}

}

function t_set_cb_between_active() {

	// Update the checkboxes
	stu.tail = 'BETWEEN';
	t_set_tail_cbtrue(stu.tail);
	t_set_area_visible(stu.tail);

	if (stu.mode === 'PROBABILITY') {

		// Make sure both gliders are active
		t_p1.setAttribute({ visible: true });
		t_p2.setAttribute({ visible: true });

		// Make sure all the right inputs are active
		t_x1_input.setAttribute({ disabled: false });
		t_x2_input.setAttribute({ disabled: false });
		t_prob_input.setAttribute({ disabled: true });

	} else if(stu.mode === 'INVERSE') {

		// Only one glider will be active in this mode
		t_p1.setAttribute({ visible: false });
		t_p2.setAttribute({ visible: true });

		// Make sure all the right inputs are active
		t_x1_input.setAttribute({ disabled: true });
		t_x2_input.setAttribute({ disabled: true });
		t_prob_input.setAttribute({ disabled: false });

	}

	t_docalc();

}

function t_set_cb_left_active() {

	// Set the correct checkbox
	stu.tail = 'LEFT'
	t_set_tail_cbtrue(stu.tail);
	t_set_area_visible(stu.tail);

	// Make sure the correct points are visible
	t_p1.setAttribute({ visible: false });
	t_p2.setAttribute({ visible: true });

	// Update the input boxes
	t_x1_input.set('-Infinity');

	// Make sure the correct input boxes are activated
	if (stu.mode === 'PROBABILITY') {

		t_x1_input.setAttribute({ disabled: true });
		t_x2_input.setAttribute({ disabled: false });
		t_prob_input.setAttribute({ disabled: true });

	} else if(stu.mode === 'INVERSE') {

		t_x1_input.setAttribute({ disabled: true });
		t_x2_input.setAttribute({ disabled: true });
		t_prob_input.setAttribute({ disabled: false });

	}

	t_docalc();
}

function t_set_cb_right_active() {

	// Set the correct checkbox
	stu.tail = 'RIGHT';
	t_set_tail_cbtrue(stu.tail);
	t_set_area_visible(stu.tail);

	// Make sure the correct points display
	t_p1.setAttribute({ visible: true });
	t_p2.setAttribute({ visible: false });

	// Update the input boxes
	t_x2_input.set('Infinity');

	// Make sure the correct input boxes are activated
	if (stu.mode === 'PROBABILITY') {

		t_x1_input.setAttribute({ disabled: false });
		t_x2_input.setAttribute({ disabled: true });
		t_prob_input.setAttribute({ disabled: true });

	} else if(stu.mode === 'INVERSE') {

		t_x1_input.setAttribute({ disabled: true });
		t_x2_input.setAttribute({ disabled: true });
		t_prob_input.setAttribute({ disabled: false });

	}

	t_docalc();
}

function t_set_cb_area_active() {

	stu.mode = 'PROBABILITY';
	t_set_mode_cbtrue(stu.mode);

	// Probability input is inactive in this mode
	t_prob_input.setAttribute({ disabled: true });

	if (stu.tail === 'BETWEEN') {

		t_x1_input.setAttribute({ disabled: false });
		t_x2_input.setAttribute({ disabled: false });
		// Make sure p1 is visible in case it was turned off
		t_p1.setAttribute( { visible: true } );

	} else if (stu.tail === 'LEFT') {

		t_x1_input.setAttribute({ disabled: true });
		t_x2_input.setAttribute({ disabled: false });

	} else if (stu.tail === 'RIGHT') {

		t_x1_input.setAttribute({ disabled: false });
		t_x2_input.setAttribute({ disabled: true });

	}

	t_docalc();
}

function t_set_cb_inverse_active() {

	stu.mode = 'INVERSE';
	t_set_mode_cbtrue(stu.mode);

	// Toggle which input boxes are active
	t_x1_input.setAttribute({ disabled: true });
	t_x2_input.setAttribute({ disabled: true });
	t_prob_input.setAttribute({ disabled: false });

	// There will only be one input point for a between inverse calculation
	if (stu.tail === 'BETWEEN') {
		t_p1.setAttribute( { visible: false } );
	} 

	t_docalc();

}

// Checks to see if the user updated the values for the mean and standard deviation,
// and updates the distribution's parameters if they are
function t_params_updated() {

    let param_change = false;

    let temp_mean = evalstr(t_mean_input.Value());
    let temp_stdev = evalstr(t_stdev_input.Value());
    let temp_df = evalstr(t_df_input.Value());

    if (!isFinite(temp_mean)) {
        // Input is invalid, so revert back to original 
        t_mean_input.set(stu.mean);
    } else if (abs(temp_mean - stu.mean) > DEC_PREC) {
        // Change to new value
        t_mean_input.set(temp_mean);
		stu.mean = temp_mean;
        param_change = true;
    }

    if (!isFinite(temp_stdev) || temp_stdev <= 0) {
        t_stdev_input.set(stu.stdev);
    } else if (abs(temp_stdev - stu.stdev) > DEC_PREC) {
        t_stdev_input.set(temp_stdev);
		stu.stdev = temp_stdev;
        param_change = true;
    }

    if (!isFinite(temp_df) || temp_df <= 0 || !Number.isInteger(temp_df)) {
        t_df_input.set(stu.df);
    } else if (abs(temp_df - stu.df) > DEC_PREC) {
        t_df_input.set(temp_df);
		stu.df = temp_df;
        param_change = true;
    }

    return param_change;
}

function t_update_inputs() {
	
	let temp_x1 = evalstr(t_x1_input.Value());
	let temp_x2 = evalstr(t_x2_input.Value());

	if (stu.tail === 'BETWEEN') {

		if(isFinite(temp_x1)) {
			stu.x1 = temp_x1;
			t_p1.moveTo([stu.x1, 0]);
		} else {
			t_x1_input.set(stu.x1);
			t_p1.moveTo([stu.x1, 0]);
		}

		if(isFinite(temp_x2)) {
			stu.x2 = temp_x2;
			t_p2.moveTo([stu.x2, 0]);
		} else {
			t_x2_input.set(stu.x2);
			t_p2.moveTo([stu.x2, 0]);
		}

	} else if (stu.tail === 'LEFT') {

		if(isFinite(temp_x2)) {
			stu.x2 = temp_x2;
			t_p2.moveTo([stu.x2, 0]);
		} else {
			t_x2_input.set(stu.x2);
		}

	} else if (stu.tail === 'RIGHT') {

		if(isFinite(temp_x1)) {
			stu.x1 = temp_x1;
			t_p1.moveTo([stu.x1, 0]);
		} else {
			t_x1_input.set(stu.x1);
		}

	}

}

// This function doesn't technically support changes to the value of n
function t_make_function() {
    let s = '';
    if (stu.mode === 'PROBABILITY') {
        s = 'tcdf(';
		let x1_num = abs(stu.mean - 0) < DEC_PREC ? `${stu.x1}` : `(${stu.x1} - ${stu.mean})`;
		let x2_num = abs(stu.mean - 0) < DEC_PREC ? `${stu.x2}` : `(${stu.x2} - ${stu.mean})`;
		let den = abs(stu.stdev - 1) < DEC_PREC ? '' : `/${stu.stdev}`;
        switch (stu.tail) {
            case 'BETWEEN':
                s += `${x1_num}${den}, ${x2_num}${den}, ${stu.df})`;
                break;
            case 'LEFT':
                s += `-E99, ${x2_num}${den}, ${stu.df})`;
                break;
            case 'RIGHT':
                s += `${x1_num}${den}, E99, ${stu.df})`;
                break;
        }
    } else if (stu.mode === 'INVERSE') {
        s = `invT(`;
		switch (stu.tail) {
			case 'BETWEEN':
				s += `(1 - ${stu.prob}) / 2)`;
				break;
			case 'LEFT':
				s += `${stu.prob}`;
				break;
			case 'RIGHT':
				s += `1 - ${stu.prob}`;
				break;
		}
		s += `, ${stu.df}); mean=${stu.mean}, stdev=${stu.stdev}, mode=${stu.tail}`;
    }
    return s;
}

function t_set_area_visible(tail) {
	for(let i in t_area) {
		t_area[i].setAttribute( { visible: i === tail } );
	}
}

function t_set_tail_cbtrue(tail) {
	setCheckbox(t_cb['BETWEEN'], tail === 'BETWEEN');
	setCheckbox(t_cb['LEFT'], tail === 'LEFT');
	setCheckbox(t_cb['RIGHT'], tail === 'RIGHT');
}

function t_set_mode_cbtrue(mode) {
	setCheckbox(t_cb['PROBABILITY'], mode === 'PROBABILITY');
	setCheckbox(t_cb['INVERSE'], mode === 'INVERSE');
}