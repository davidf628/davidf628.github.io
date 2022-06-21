
// Normal Distribution applet

// Improvements:
//
// - When P(X>a) or P(X<b) modes are selected, show and hide the input boxes that are not needed
//   for better clarity
// - Provide error messages for clarity: put a message on top line of program to indicate error
//   and let it disappear on keypress
// - Provide help button for assistance
// - Make label on the points larger for easier readability when being dragged
// - Turn calculations into values in all input boxes

let normal_board = JXG.JSXGraph.initBoard('standard_normal', {
    boundingbox: [-4,0.48,4,-0.48],
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
    showScreenshot: {
        enabled: true,
    },
});

let normal = {
    mean: 0,
    stdev: 1,
    x1: -2,
    x2: 2,
    n: 1,
    probtype: 'BETWEEN',   // 'LEFT', 'RIGHT', 'BETWEEN'
    functype: 'PROBABILITY',  // 'PROBABILITY', 'INVERSE'
    prob: 0,
}
normal.prob = normal_cprob();
        
// This text area is for debugging purposes only and should only be enabled when testing
//let normal_debug_data = normal_board.create('text', [-3.8, 0.45,
//    function() {
//        return `[mean]: ${normal.mean} [stdev]: ${normal.stdev} [x1]: ${normal.x1} [x2]: ${normal.x2} [prob]: ${normal.prob} [func]: ${normal.functype} [type]: ${normal.probtype}`;
//    }], { frozen: true });


// Helpful functions for converting x-values and z-scores
function zScore(x) {
    return (x - normal.mean) / (normal.stdev / sqrt(normal.n));
}
        
function xValue(z) {
    return normal.mean + z * (normal.stdev / sqrt(normal.n));
}
        
// Create the normal distribution curve, and the axis with tick marks
let normal_curve = normal_board.create('functiongraph', [
    function(x) { 
        return jStat.normal.pdf(x, normal.mean, normal.stdev / sqrt(normal.n)); 
    }], curveParam);

let normal_axis = normal_board.create('axis', [[0, 0], [1, 0]],	{ ticks: { visible: false } });

let normal_ticks = [];
let normal_axislabels = [];
for (let i = -3; i <= 3; i++) {
    normal_ticks[i + 3] = normal_board.create('segment', [[i,.01], [i,-0.01]], { color: 'grey', strokeWidth: 1, fixed: true, highlight: false });
    normal_axislabels[i + 3] = normal_board.create('text', [i-.05, -0.02, i], { fixed: true, highlight: false });
}

// Create the shaded regions - we need one for between, left, and right-tail probabilities
let shadedregionleft = normal_board.create('integral',
[[ function() { return xValue(-10); }, function() { return normal.x2; }], normal_curve], shadeParam);
shadedregionleft.setAttribute({ visible: false });

let shadedregionright = normal_board.create('integral',
[[ function() { return normal.x1; }, function() { return xValue(10); }], normal_curve], shadeParam);
shadedregionright.setAttribute({ visible: false });

let shadedregionbetween = normal_board.create('integral',
[[ function() { return normal.x1; }, function() { return normal.x2; }], normal_curve], shadeParam);

// Create the glider tools along the x-axis
let normal_x1 = normal_board.create('glider', [-2, 0, normal_axis], { withLabel: false, color: 'black', snapToGrid: true, snapSizeX: 0.01 });
normal_x1.on('drag',
    function() {

        update_normal_axis();

        normal.x1 = normal_x1.X().toFixed(2);
        normal_x1_input.set(normal.x1);
        
        normal.prob = normal_cprob();
        normal_prob_input.set(normal.prob);
    }
);
        
let normal_x2 = normal_board.create('glider', [2, 0, normal_axis], { withLabel: false, color: 'black', snapToGrid: true, snapSizeX: 0.01 });
normal_x2.on('drag',
    function() {

        update_normal_axis();

        normal.x2 = normal_x2.X().toFixed(2);
        normal_x2_input.set(normal.x2);

        // This calculates the inverse normal in "BETWEEN" mode
        if(normal.functype == 'INVERSE' && normal.probtype == 'BETWEEN') {
            let old_z = zScore(normal.x2);
            normal.x1 = xValue(-old_z).toFixed(2);
            normal_x1.moveTo([normal.x1,0]);
            normal_x1_input.set(normal.x1);
        }

        normal.prob = normal_cprob();
        normal_prob_input.set(normal.prob);
    }
);
       
// Create input boxes for the normal parameters
let normal_mean_input = normal_board.create('input', [1.4, 0.42, '0', '&mu; = '], inputParam);
let normal_stdev_input = normal_board.create('input', [1.4, 0.34, '1', '&sigma; = '], inputParam);
let normal_n_input = normal_board.create('input', [1.4, 0.26, '1', 'n = '], inputParam);
normal_n_input.setAttribute( { visible: false });

// Create checkboxes that allow the user to control the current operation mode
let normal_cb_between = JSXCheckbox(normal_board, -3.6, -0.1, 'P(a < x < b)', true,
    function() { normal_set_cb_between_active() }, { fontSize: 18, frozen: true });

let normal_cb_left = JSXCheckbox(normal_board, -3.6, -0.16, 'P(x < b)', false,
    function() { normal_set_cb_left_active() }, { fontSize: 18, frozen: true });

let normal_cb_right = JSXCheckbox(normal_board, -3.6, -0.22, 'P(x > a)', false,
    function() { normal_set_cb_right_active() }, { fontSize: 18, frozen: true });

let normal_cb_area = JSXCheckbox(normal_board, 1, -0.1, 'Calculate Area', true,
    function() { normal_set_cb_area_active() }, { fontSize: 18, frozen: true });

let normal_cb_xvalue = JSXCheckbox(normal_board, 1, -0.16, 'Calculate x-Value', false,
    function() { normal_set_cb_inverse_active() }, { fontSize: 18, frozen: true });

// Create input boxes for normal values
let normal_x1_input = normal_board.create('input', [-3.5, -0.32, '-2', 'P( '], inputParam);
let normal_x2_input = normal_board.create('input', [-1.3, -0.32, '2', ' < <i>X</i> < '], inputParam);
let normal_prob_input = normal_board.create('input', [1.3, -0.32, normal.prob, ') = '], inputParam);
normal_prob_input.setAttribute( { disabled: true } );

// Confirmation buttons
let normal_calc = normal_board.create('button', [2.3, -0.4, 'Calculate', 
    function() { 
        normal_docalc();
    }
], buttonParam);

let normal_copy_func = normal_board.create('button', [-3.5, -0.4, 'Copy Function',
    function() { 
        alert(normal_make_function() + ' copied to clipboard.');
        navigator.clipboard.writeText(normal_make_function()); 
    }
], buttonParam);

// Keyboard input handlers
normal_key_handler = function(e) { 
    if(e.which === 13 || e.which === 9) { 
        normal_docalc(); 
    }
};

normal_mean_input.rendNodeInput.onkeydown = function(e) { normal_key_handler(e); }
normal_stdev_input.rendNodeInput.onkeydown = function(e) { normal_key_handler(e); };
normal_n_input.rendNodeInput.onkeydown = function(e) { normal_key_handler(e); };
normal_x1_input.rendNodeInput.onkeydown = function(e) { normal_key_handler(e); };
normal_x2_input.rendNodeInput.onkeydown = function(e) { normal_key_handler(e) };
normal_prob_input.rendNodeInput.onkeydown = function(e) { normal_key_handler(e) };

// Make sure any movement a student makes updates the calculation
normal_mean_input.rendNodeInput.addEventListener('focusout', function() { normal_docalc(); });
normal_stdev_input.rendNodeInput.addEventListener('focusout', function() { normal_docalc(); });
normal_n_input.rendNodeInput.addEventListener('focusout', function() { normal_docalc(); });
normal_x1_input.rendNodeInput.addEventListener('focusout', function() { normal_docalc(); });
normal_x2_input.rendNodeInput.addEventListener('focusout', function() { normal_docalc(); });
normal_prob_input.rendNodeInput.addEventListener('focusout', function() { normal_docalc(); });

// Functions that perform the behind-the-scene operations        
function normal_docalc() {

    update_normal_axis();

    if(normal.functype === 'PROBABILITY') {

        let tmp_x1 = evalstr(normal_x1_input.Value());
        let tmp_x2 = evalstr(normal_x2_input.Value());

        if(!isNaN(tmp_x1)) {
            normal.x1 = tmp_x1;
            normal_x1.moveTo([normal.x1, 0]);
        }

        if(!isNaN(tmp_x2)) {
            normal.x2 = tmp_x2;
            normal_x2.moveTo([normal.x2, 0]);
        }

        normal.prob = normal_cprob();
        normal_prob_input.set(normal.prob);

    } else if (normal.functype == 'INVERSE') {

        let tmp_prob = evalstr(normal_prob_input.Value());

        if (!isNaN(tmp_prob)) {
            normal.prob = tmp_prob;
        }

        if(normal.probtype == 'LEFT') {
            normal.x2 = jStat.normal.inv(normal.prob, normal.mean, normal.stdev);
            normal_x2.moveTo([normal.x2, 0]);
            normal_x2_input.set(normal.x2);
        } else if(normal.probtype == 'RIGHT') {
            normal.x1 = jStat.normal.inv(1 - normal.prob, normal.mean, normal.stdev);
            normal_x1.moveTo([normal.x1, 0]);
            normal_x1_input.set(normal.x1);
        } else if(normal.probtype == 'BETWEEN') {
            normal.x1 = jStat.normal.inv((1 - normal.prob) / 2, normal.mean, normal.stdev);
            normal.x2 = jStat.normal.inv(normal.prob / 2, normal.mean, normal.stdev);
            normal_x1.moveTo([normal.x1, 0]);
            normal_x1_input.set(normal.x1);
            normal_x2.moveTo([normal.x2, 0]);
            normal_x2_input.set(normal.x2);
        }
    }
    normal_board.update();
}

function update_normal_axis() {

    // If a new mean and standard deviation are provided, then we need to:
    //   - change the bounds on the x-axis
    //   - set the global normal.mean and normal.stdev variables
    //   - reset the positions of normal_x1 and normal_x2 on the x-axis so that they are accessible again

    if (normal_params_updated()) {
        // Save z-scores of current locations of x-axis points
        let old_z1 = zScore(normal.x1);
        let old_z2 = zScore(normal.x2);
    
        // Reset the mean and standard devaition global variables
        let temp_mean = evalstr(normal_mean_input.Value());
        let temp_stdev = evalstr(normal_stdev_input.Value());
        let temp_n = evalstr(normal_n_input.Value());
    
        if (isFinite(temp_mean)) {
            normal.mean = temp_mean;
        }
        if (isFinite(temp_stdev) && temp_stdev > 0) {
            normal.stdev = temp_stdev;
        }
        if (isFinite(temp_n) && temp_n > 0) {
            normal.n = temp_n;
        }
    
        // Set the bounds on the x-axis
        let x_min = xValue(-4);
        let x_max = xValue(4);
    
        // Set the height of the display to allow just enough height for the peak
        let y_min = (-0.4 / (normal.stdev / sqrt(normal.n))) * 1.2;
        let y_max = (0.4 / (normal.stdev / sqrt(normal.n))) * 1.2;
    
        normal_board.setBoundingBox([x_min, y_max, x_max, y_min]);
    
        // Get the locations of the new glider points
        normal.x1 = xValue(old_z1).toFixed(2);
        normal.x2 = xValue(old_z2).toFixed(2);
        normal_x1.moveTo([normal.x1, 0]);
        normal_x2.moveTo([normal.x2, 0]);
    
        // Update the value of the glider points in the input boxes
        normal_x1_input.set(normal.x1);
        normal_x2_input.set(normal.x2);
    
        // Recalculate the probability
        normal.prob = normal_cprob();
        normal_prob_input.set(normal.prob);
    
        // Finally, update the axis labels
        for(let i = -3; i <= 3; i++) {
            normal_ticks[i + 3].point1.moveTo([xValue(i), 0.02 * y_max]);
            normal_ticks[i + 3].point2.moveTo([xValue(i), -0.02 * y_max]);
            normal_axislabels[i + 3].setText(xValue(i));
            normal_axislabels[i + 3].setCoords([xValue(i), -0.06 * y_max]);
        }
        
    }

}
        
function normal_set_cb_between_active() {

    normal.probtype = 'BETWEEN';

    // Update the checkboxes
    setCheckbox(normal_cb_between, true);
    setCheckbox(normal_cb_left, false);
    setCheckbox(normal_cb_right, false);

    // Update the areas under the curve
    shadedregionbetween.setAttribute({ visible: true });        
    shadedregionleft.setAttribute({ visible: false });
    shadedregionright.setAttribute({ visible: false });

    update_normal_axis();

    if(normal.functype == 'PROBABILITY') {

        // Make sure both gliders are active
        normal_x1.setAttribute({ visible: true });
        normal_x2.setAttribute({ visible: true });

        // Make sure all the correct input boxes are active
        normal_x1_input.setAttribute({ disabled: false });
        normal_x2_input.setAttribute({ disabled: false });
        normal_prob_input.setAttribute({ disabled: true });

        // Set the proper values in the input boxes
        normal_x1_input.set(normal.x1);
        normal_x2_input.set(normal.x2);

        normal.prob = normal_cprob();
        normal_prob_input.set(normal.prob);

    } else if(normal.functype == 'INVERSE') {

        // Only one glider will be active when in between/inverse mode
        normal_x1.setAttribute({ visible: false });
        normal_x2.setAttribute({ visible: true });
        
        // Make sure all the correct input boxes are active
        normal_x1_input.setAttribute({ disabled: true });
        normal_x2_input.setAttribute({ disabled: true });
        normal_prob_input.setAttribute({ disabled: false });

        // Set the proper values to the input boxes and gliders
        let old_z = zScore(normal.x2);
        normal.x1 = xValue(-old_z).toFixed(2);

        normal_x1.moveTo([normal.x1, 0]);

        normal_x1_input.set(normal.x1);
        normal_x2_input.set(normal.x2);

        normal.prob = normal_cprob();
        normal_prob_input.set(normal.prob);

    }

    normal_board.update();
}
        
function normal_set_cb_left_active() {

    normal.probtype = 'LEFT';

    // Update the Checkboxes
    setCheckbox(normal_cb_left, true);
    setCheckbox(normal_cb_right, false);
    setCheckbox(normal_cb_between, false);

    // Update the shaded regions
    shadedregionleft.setAttribute({ visible: true });
    shadedregionright.setAttribute({ visible: false });
    shadedregionbetween.setAttribute({ visible: false });

    update_normal_axis();

    normal_x1.setAttribute({ visible: false });
    normal_x2.setAttribute({ visible: true });

    normal_x1_input.set('-Infinity');
    normal_x2_input.set(normal.x2);

    normal.prob = normal_cprob();
    normal_prob_input.set(normal.prob);

    if (normal.functype == 'PROBABILITY') {

        normal_x1_input.setAttribute({ disabled: true });
        normal_x2_input.setAttribute({ disabled: false });
        normal_prob_input.setAttribute({ disabled: true });

    } else if (normal.functype == 'INVERSE') {

        normal_x1_input.setAttribute({ disabled: true });
        normal_x2_input.setAttribute({ disabled: true });
        normal_prob_input.setAttribute({ disabled: false });

    }

}
        
function normal_set_cb_right_active() {

    normal.probtype = 'RIGHT';

    // Update the checkboxes
    setCheckbox(normal_cb_left, false);
    setCheckbox(normal_cb_right, true);
    setCheckbox(normal_cb_between, false);
    
    // Update the shaded regions
    shadedregionleft.setAttribute({ visible: false });
    shadedregionright.setAttribute({ visible: true });
    shadedregionbetween.setAttribute({ visible: false });

    update_normal_axis();

    normal_x1.setAttribute({ visible: true });
    normal_x2.setAttribute({ visible: false });

    normal_x1_input.rendNodeInput.value = normal.x1;
    normal_x2_input.rendNodeInput.value = 'Infinity';

    if (normal.functype == 'PROBABILITY') {

        normal_x1_input.setAttribute({ disabled: false });
        normal_x2_input.setAttribute({ disabled: true });
        normal_prob_input.setAttribute({ disabled: true });

        normal.prob = normal_cprob();
        normal_prob_input.rendNodeInput.value = normal.prob;

    } else if (normal.functype == 'INVERSE') {

        normal_x1_input.setAttribute({ disabled: true });
        normal_x2_input.setAttribute({ disabled: true });
        normal_prob_input.setAttribute({ disabled: false });

        normal.prob = normal_cprob();
        normal_prob_input.rendNodeInput.value = normal.prob;

    }

}
        
function normal_set_cb_area_active() {

    normal.functype = 'PROBABILITY';

    setCheckbox(normal_cb_area, true);
    setCheckbox(normal_cb_xvalue, false);

    update_normal_axis();
        
    normal_prob_input.setAttribute( { disabled: true });

    if(normal.probtype == 'LEFT') {

        normal_x1_input.setAttribute( { disabled: true });
        normal_x2_input.setAttribute( { disabled: false });

    } else if(normal.probtype == 'RIGHT') {

        normal_x1_input.setAttribute( { disabled: false });
        normal_x2_input.setAttribute( { disabled: true });

    } else if(normal.probtype == 'BETWEEN') {

        normal_x1_input.setAttribute( { disabled: false });
        normal_x2_input.setAttribute( { disabled: false });
        normal_x1.setAttribute( { visible: true });
        
    }

    normal_board.update();

}
        
function normal_set_cb_inverse_active() {

    normal.functype = 'INVERSE';

    setCheckbox(normal_cb_xvalue, true);
    setCheckbox(normal_cb_area, false);

    update_normal_axis();

    // Turn off access to the z-score boxes and turn on access to change the probability
    normal_x1_input.setAttribute({ disabled: true });
    normal_x2_input.setAttribute({ disabled: true });
    normal_prob_input.setAttribute({ disabled: false });

    // Inverse between probabilites will be centered about the mean, so we only
    // need one input point along the x-axis
    if(normal.probtype == 'BETWEEN') {
        normal_x1.setAttribute({ visible: false });

        // Set the proper values to the input boxes and gliders
        let old_z = zScore(normal.x2);
        normal.x1 = xValue(-old_z).toFixed(2);
        
        normal_x1.moveTo([normal.x1, 0]);
        
        normal_x1_input.rendNodeInput.value = normal.x1;
        normal_x2_input.rendNodeInput.value = normal.x2;
        
        normal.prob = normal_cprob();
        normal_prob_input.rendNodeInput.value = normal.prob;

    }

    normal_board.update();

}

// Calculates normal distribution probability based on the variables in the
// global `normal` object
function normal_cprob() {

    let prob1 = jStat.normal.cdf(normal.x1, normal.mean, normal.stdev / sqrt(normal.n));
    let prob2 = jStat.normal.cdf(normal.x2, normal.mean, normal.stdev / sqrt(normal.n));

    if(normal.probtype == 'BETWEEN') {
        return round(abs(prob2 - prob1), PRECISION);
    } else if(normal.probtype == 'LEFT') {
        return round(prob2, PRECISION);
    } else if(normal.probtype == 'RIGHT') {
        return round(1 - prob1, PRECISION);
    }

}
 
// Checks to see if the user updated the values for the mean and standard deviation
function normal_params_updated() {

    let param_change = false;

    let temp_mean = evalstr(normal_mean_input.Value());
    let temp_stdev = evalstr(normal_stdev_input.Value());
    let temp_n = evalstr(normal_n_input.Value());

    if (!isFinite(temp_mean)) {
        // Input is invalid, so revert back to original 
        normal_mean_input.set(normal.mean);
    } else if (abs(temp_mean - normal.mean) > DEC_PREC) {
        // Change to new value
        normal_mean_input.set(temp_mean);
        param_change = true;
    }

    if (!isFinite(temp_stdev) || temp_stdev <= 0) {
        normal_stdev_input.set(normal.stdev);
    } else if (abs(temp_stdev - normal.stdev) > DEC_PREC) {
        normal_stdev_input.set(temp_stdev);
        param_change = true;
    }

    if (!isFinite(temp_n) || temp_n <= 0) {
        normal_n_input.set(normal.n);
    } else if (abs(temp_n - normal.n) > DEC_PREC) {
        normal_n_input.set(temp_n);
        param_change = true;
    }

    return param_change;
}

// This function doesn't technically support changes to the value of n
function normal_make_function() {
    let s = '';
    if (normal.functype === 'PROBABILITY') {
        s = 'normalcdf(';
        switch (normal.probtype) {
            case 'BETWEEN':
                s += `${normal.x1}, ${normal.x2}, ${normal.mean}, ${normal.stdev})`;
                break;
            case 'LEFT':
                s += `-E99, ${normal.x2}, ${normal.mean}, ${normal.stdev})`;
                break;
            case 'RIGHT':
                s += `${normal.x1}, E99, ${normal.mean}, ${normal.stdev})`;
                break;
        }
    } else if (normal.functype === 'INVERSE') {
        s = `invNorm(${normal.prob}, ${normal.mean}, ${normal.stdev}, `;
        switch (normal.probtype) {
            case 'BETWEEN':
                s += 'CENTER)';
                break;
            case 'LEFT':
                s += 'LEFT)';
                break;
            case 'RIGHT':
                s += 'RIGHT)';
                break;
        }

    }
    return s;
}