
var chi_board = JXG.JSXGraph.initBoard('chi-distribution', {
        boundingbox: [0,0.5,24,-0.5],
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
            enabled: false
        },
        pan: {
            enabled: false
        },
        keyboard: {
            enabled: false
        }
    });

var chi_mean = 6;
var chi_stdev = Math.sqrt(jStat.chisquare.variance(6));
var chi_df = 6;


function chi_score(x) {
    return (x - chi_mean) / chi_stdev;
}

function chi_xval(t) {
    return chi_mean + t * chi_stdev;
}

var chi_curve = chi_board.create('functiongraph', [function(x) { return jStat.chisquare.pdf(x, chi_df); }], curveParam);

var chi_axis = chi_board.create('line', [[0, 0], [1, 0]], { strokeColor: 'black', strokeWidth: 1, highlight: false, fixed: true, frozen: true });

var chi_1 = chi_board.create('glider', [2, 0, chi_axis], { withLabel: false, color: 'black', snapToGrid: true, snapSizeX: 0.01 });
chi_1.on('drag',
    function() {
        if(chi_1.X() < 0) {
            chi_1.moveTo([0, 0]);
        }
        chi_x1_input.rendNodeInput.value = chi_1.X().toFixed(2);
        chi_df = Number(chi_df_input.rendNodeInput.value);
        chi_prob_input.rendNodeInput.value = current_chi_probability(chi_1.X(), chi_2.X(), chi_df);
        chi_prob_disp.setText(') = ' + current_chi_probability(chi_1.X(), chi_2.X(), chi_df));
    }
);

var chi_2 = chi_board.create('glider', [10, 0, chi_axis], { withLabel: false, color: 'black', snapToGrid: true, snapSizeX: 0.01 });
chi_2.on('drag',
    function() {
        if(chi_2.X() < 0) {
            chi_2.moveTo([0, 0]);
        }
        chi_x2_input.rendNodeInput.value = chi_2.X().toFixed(2);
        chi_x2_disp.setText('< <i>X</i> < ' + chi_2.X().toFixed(2));
        chi_df = Number(chi_df_input.rendNodeInput.value);
        chi_prob_input.rendNodeInput.value = current_chi_probability(chi_1.X(), chi_2.X(), chi_df);
        chi_prob_disp.setText(') = ' + current_chi_probability(chi_1.X(), chi_2.X(), chi_df));
    }
);

// Initialize the tick marks and axis labels so they can be updated later
var chi_ticks = [];
var chi_labels = [];
for (var i = 0; i < 20; i++) {
    chi_ticks[i] = chi_board.create('segment', [[10, 10], [10, 11]], { color: 'grey', strokeWidth: 1, fixed: true, highlight: false });
}
for (var i = 1; i < 20; i++ ) {
    chi_labels[i-1] = chi_board.create('text', [10, 10, ''], { fixed: true, highlight: false });
}

var x_min = 0;
var x_max = 4 * chi_df;

var chi_tick_delta = 2;
var chi_n_ticks = 20;

chi_set_tick_metrics(chi_df);

var chi_tick_ratio = 50; // ticks are 1/50 the value of y-max
var y_val = chi_df > 2 ? jStat.chisquare.pdf(jStat.chisquare.mode(chi_df), chi_df) * 1.3 : 0.5;

chi_board.setBoundingBox([x_min, y_val, x_max, -y_val]);
var tick_height = y_val / chi_tick_ratio;

for (var i = 0; i < chi_n_ticks; i++) {
    chi_ticks[i].point1.moveTo([i * chi_tick_delta, tick_height]);
    chi_ticks[i].point2.moveTo([i * chi_tick_delta, -tick_height]);
}

for (var i = 1; i < chi_n_ticks; i++) {
    chi_labels[i-1].setText(i * chi_tick_delta);
    chi_labels[i-1].moveTo([i * chi_tick_delta, -2 * tick_height]);
}

// input variables

var chi_df_input = chi_board.create('input', [15, 0.15, chi_df, 'df = '], inputParam);
var chi_mean_disp = chi_board.create('text', [15, 0.125, function() { return '&mu; = ' + chi_mean; }], textParam);
var chi_stdev_disp = chi_board.create('text', [15, 0.1, function() { return '&sigma; = ' + chi_stdev.toFixed(4); }], textParam);

var chi_shadeleft = chi_board.create('integral',
    [[ 0 , function() { return chi_2.X(); }], chi_curve], shadeParam);
chi_shadeleft.setAttribute({ visible: false });

var chi_shaderight = chi_board.create('integral',
    [[ function() { return chi_1.X(); }, function() { return 4 * chi_df; }], chi_curve], shadeParam);
chi_shaderight.setAttribute({ visible: false });

var chi_shadebetween = chi_board.create('integral',
    [[ function() { return chi_1.X(); }, function() { return chi_2.X(); }], chi_curve], shadeParam);

var chi_x1_input = chi_board.create('input', [2, -0.11, '2', 'P( '], inputParam);

var chi_x2_input = chi_board.create('input', [9, -0.11, '10', ' < <i>X</i> < '], inputParam);

var chi_x2_disp = chi_board.create('text', [9, -0.11, '< <i>X</i> < 2'], textParam);
chi_x2_disp.setAttribute({ visible: false });

var chi_prob_input = chi_board.create('input', [17, -0.11, '0.7950', ') = '], inputParam);
chi_prob_input.setAttribute({ visible: false });

var chi_prob_disp = chi_board.create('text', [17, -0.11, ') = 0.7950'], textParam);

// Buttons

var chi_calc_button = chi_board.create('button', [15, -0.14, 'Calculate',
    function () {

        if(isChecked(chi_cb_area)) {
            if(!isNaN(chi_x1_input.Value())) {
                chi_1.moveTo([chi_x1_input.Value(), 0]);
            }

            if(!isNaN(chi_x2_input.Value())) {
                chi_2.moveTo([chi_x2_input.Value(), 0]);
            }
            chi_df = Number(chi_df_input.rendNodeInput.value);
            chi_prob_input.rendNodeInput.value = current_chi_probability(chi_x1_input.Value(), chi_x2_input.Value(), chi_df);
            chi_prob_disp.setText(') = ' + current_chi_probability(chi_x1_input.Value(), chi_x2_input.Value(), chi_df));

        } else {
            if(!isNaN(chi_prob_input.Value())) {

                chi_df = Number(chi_df_input.rendNodeInput.value);
                var chi = jStat.chisquare.inv(chi_prob_input.Value(), chi_df);
                chi_2.moveTo([chi, 0]);
                chi_x2_input.rendNodeInput.value = chi;
                chi_x2_disp.setText('< <i>X</i> < ' + chi.toFixed(8));

            }
        }
}], { frozen: true });

var chi_update = chi_board.create('button', [17, 0.075, 'Update', function() {

        var new_df = chi_df_input.rendNodeInput.value;

        if (new_df >= 1) {

            chi_df = new_df;

            chi_set_tick_metrics(chi_df);

            var y_val = chi_df > 2 ? jStat.chisquare.pdf(jStat.chisquare.mode(chi_df), chi_df) * 1.3 : 0.5;

            chi_board.setBoundingBox([x_min, y_val, x_max, -y_val]);
            var tick_height = y_val / chi_tick_ratio;

            // Move all ticks and labels off screen
            for (var i = 0; i < 20; i++) {
                chi_ticks[i].point1.moveTo([10, 10]);
                chi_ticks[i].point2.moveTo([10, 11]);
            }

            for (var i = 1; i < 20; i++) {
                chi_labels[i-1].setText('');
                chi_labels[i-1].moveTo([10, 10]);
            }

            if (chi_tick_delta != -1) {

                // Update the display for just the labels and ticks we want
                for (var i = 0; i < chi_n_ticks; i++) {
                    chi_ticks[i].point1.moveTo([i * chi_tick_delta, tick_height]);
                    chi_ticks[i].point2.moveTo([i * chi_tick_delta, -tick_height]);
                }

                for (var i = 1; i < chi_n_ticks; i++) {
                    chi_labels[i-1].setText(i * chi_tick_delta);
                    chi_labels[i-1].moveTo([i * chi_tick_delta, -2 * tick_height]);
                }
            }

            chi_mean = jStat.chisquare.mean(chi_df);
            chi_stdev = Math.sqrt(jStat.chisquare.variance(chi_df));


            var cur_x1 = chi_x1_input.rendNodeInput.value;
            var cur_x2 = chi_x2_input.rendNodeInput.value;

            if(cur_x2 > 4 * chi_df) {
                cur_x2 = 3 * chi_df;
            }

            chi_1.moveTo([cur_x1, 0]);
            chi_2.moveTo([cur_x2, 0]);

            chi_x1_input.rendNodeInput.value = cur_x1;
            chi_x2_input.rendNodeInput.value = cur_x2;
            chi_x2_disp.setText('< <i>X</i> < ' + Number(cur_x2).toFixed(8));

            chi_prob_input.rendNodeInput.value = current_chi_probability(cur_x1, cur_x2, chi_df);
            chi_prob_disp.setText(') = ' + current_chi_probability(cur_x1, cur_x2, chi_df));

        }

        chi_df_input.rendNodeInput.value = chi_df;

}], { frozen: true });

// Checkboxes

var chi_cb_area = JSXCheckbox(chi_board, 14, -0.025, 'Calculate Area', true,
    function() {
        setCheckbox(chi_cb_area, true);
        setCheckbox(chi_cb_xvalue, false);

        chi_cb[BETWEEN].setAttribute( { disabled: false, strokeColor: 'black', highlight: true  });
        chi_cb[LEFT].setAttribute( { disabled: false });
        chi_cb[RIGHT].setAttribute( { disabled: false, strokeColor: 'black', highlight: true  });

        chi_prob_input.setAttribute( { visible: false });
        chi_prob_disp.setAttribute( { visible: true });

        chi_x2_input.setAttribute( { disabled: false });
        chi_x2_input.setAttribute( { visible: true });
        chi_x2_disp.setAttribute({ visible: false });


    }, { fontSize: 18, frozen: true });

var chi_cb_xvalue = JSXCheckbox(chi_board, 14, -0.05, 'Calculate x-Value', false,
    function() {
        setCheckbox(chi_cb_xvalue, true);
        setCheckbox(chi_cb_area, false);

        chi_cb[BETWEEN].setAttribute( { disabled: true, strokeColor: 'lightgray', highlight: false });
        chi_cb[LEFT].setAttribute( { disabled: false });
        chi_cb[RIGHT].setAttribute( { disabled: true, strokeColor: 'lightgray', highlight: false });
        set_chi_cbtrue(LEFT);

        chi_1.setAttribute({ visible: false });
        chi_2.setAttribute({ visible: true });

        chi_shadeleft.setAttribute({ visible: true });
        chi_shaderight.setAttribute({ visible: false });
        chi_shadebetween.setAttribute({ visible: false });

        chi_x1_input.rendNodeInput.value = '0';
        chi_x1_input.setAttribute({ disabled: true });

        chi_x2_input.rendNodeInput.value = chi_2.X().toFixed(2);
        chi_x2_input.setAttribute({ visible: false });
        chi_x2_disp.setAttribute({ visible: true });

        chi_prob_input.setAttribute({ visible: true });
        chi_prob_disp.setAttribute({ visible: false });

        chi_2.moveTo([chi_x2_input.rendNodeInput.value, 0]);

    }, { fontSize: 18, frozen: true });

var chi_cb = [];

chi_cb[BETWEEN] = JSXCheckbox(chi_board, 2, -0.025, 'P(a < x < b)', true,
    function() {
        set_chi_cbtrue(BETWEEN);

        chi_shadeleft.setAttribute({ visible: false });
        chi_shaderight.setAttribute({ visible: false });
        chi_shadebetween.setAttribute({ visible: true });

        chi_1.setAttribute({ visible: true });
        chi_2.setAttribute({ visible: true });

        chi_x1_input.rendNodeInput.value = chi_1.X().toFixed(2);
        chi_x1_input.setAttribute({ disabled: false });

        chi_x2_input.rendNodeInput.value = chi_2.X().toFixed(2);
        chi_x2_input.setAttribute({ visible: true });
        chi_x2_input.setAttribute({ disabled: false });
        chi_x2_disp.setAttribute({ visible: false });

        chi_prob_input.setAttribute({ visible: false });
        chi_prob_disp.setAttribute({ visible: true });

    }, { fontSize: 18, frozen: true });

chi_cb[LEFT] = JSXCheckbox(chi_board, 2, -0.05, 'P(x < b)', false,
    function() {
        set_chi_cbtrue(LEFT);

        chi_1.setAttribute({ visible: false });
        chi_2.setAttribute({ visible: true });

        chi_shadeleft.setAttribute({ visible: true });
        chi_shaderight.setAttribute({ visible: false });
        chi_shadebetween.setAttribute({ visible: false });

        chi_x1_input.rendNodeInput.value = '0';
        chi_x1_input.setAttribute({ disabled: true });

        chi_x2_input.rendNodeInput.value = chi_2.X().toFixed(2);
        chi_x2_input.setAttribute({ visible: true });
        chi_x2_input.setAttribute({ disabled: false });
        chi_x2_disp.setAttribute({ visible: false });

        chi_prob_input.setAttribute({ visible: false });
        chi_prob_disp.setAttribute({ visible: true });

    }, { fontSize: 18, frozen: true });

chi_cb[RIGHT] = JSXCheckbox(chi_board, 2, -0.075, 'P(x > a)', false,
    function() {
        set_chi_cbtrue(RIGHT);

        chi_1.setAttribute({ visible: true });
        chi_2.setAttribute({ visible: false });

        chi_shadeleft.setAttribute({ visible: false });
        chi_shaderight.setAttribute({ visible: true });
        chi_shadebetween.setAttribute({ visible: false });

        chi_x1_input.rendNodeInput.value = chi_1.X().toFixed(2);
        chi_x1_input.setAttribute({ disabled: false });

        chi_x2_input.rendNodeInput.value = 'Infinity';
        chi_x2_input.setAttribute({ visible: true });
        chi_x2_input.setAttribute({ disabled: true });
        chi_x2_disp.setAttribute({ visible: false });

        chi_prob_input.setAttribute({ visible: false });
        chi_prob_disp.setAttribute({ visible: true });

    }, { fontSize: 18, frozen: true });

function current_chi_probability(x1, x2, df) {

    if(typeof(x1) !== 'number') {
        x1 = Number(x1);
    }
    if(typeof(x2) !== 'number') {
        x2 = Number(x2);
    }
    if(typeof(df) !== 'number') {
        df = Number(df);
    }

    if(chi_cb[BETWEEN].Value()) {

        var v1 = jStat.chisquare.cdf(x1, df);
        var v2 = jStat.chisquare.cdf(x2, df);

        return (v2 - v1).toFixed(4);

    } else if(chi_cb[LEFT].Value()) {

        return jStat.chisquare.cdf(x2, df).toFixed(4);

    } else if(chi_cb[RIGHT].Value()) {

        return (1 - jStat.chisquare.cdf(x1, df)).toFixed(4);

    }

}

function chi_set_tick_metrics(chi_df) {

    if (chi_df == 1) {
        chi_tick_delta = 0.25;
    } else if (chi_df == 2) {
        chi_tick_delta = 0.5;
    } else if (chi_df >= 3 && chi_df <= 5) {
        chi_tick_delta = 1;
    } else if (chi_df >= 6 && chi_df <= 10) {
        chi_tick_delta = 2;
    } else if (chi_df >= 11 && chi_df <= 20) {
        chi_tick_delta = 5;
    } else if (chi_df >= 21 && chi_df <= 50) {
        chi_tick_delta = 10;
    } else if (chi_df >= 51 && chi_df <= 100) {
        chi_tick_delta = 20;
    } else if (chi_df <= 1000) {
        chi_tick_delta = 50;
    } else chi_tick_delta = -1;


    x_min = 0;
    x_max = 4 * chi_df;
    if (chi_tick_delta != -1) {
        chi_n_ticks = (x_max - x_min) / chi_tick_delta;
    } else {
        chi_n_ticks = -1;
    }

}

function set_chi_cbtrue(box) {
    chi_cb[BETWEEN].rendNodeCheckbox.checked = false;
    chi_cb[LEFT].rendNodeCheckbox.checked = false;
    chi_cb[RIGHT].rendNodeCheckbox.checked = false;
    chi_cb[BETWEEN]._value = false;
    chi_cb[LEFT]._value = false;
    chi_cb[RIGHT]._value = false;
    chi_cb[box].rendNodeCheckbox.checked = true;
    chi_cb[box]._value = true;
}
