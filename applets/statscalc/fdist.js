
// Initial Values
var f_df1 = 12;
var f_df2 = 10;
var f_mean = jStat.centralF.mean(f_df1, f_df2);
var f_stdev = Math.sqrt(jStat.centralF.variance(f_df1, f_df2));
var f_ymax = jStat.centralF.pdf(jStat.centralF.mode(f_df1, f_df2), f_df1, f_df2) * 1.3;
var f_xmax = 4;
var f_init_x1 = 0.5;
var f_init_x2 = 2;
var f_tick_delta = 0.5;
var f_n_ticks = f_xmax / f_tick_delta;
var f_tick_ratio = 50; // ticks are 1/50 the value of y-max
var f_prob_type = BETWEEN;

var f_board = JXG.JSXGraph.initBoard('f-distribution', {
        boundingbox: [0,f_ymax,f_xmax,-f_ymax],
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



var f_curve = f_board.create('functiongraph', [function(x) { return jStat.centralF.pdf(x, f_df1, f_df2); }], curveParam);

var f_axis = f_board.create('line', [[0, 0], [1, 0]], { strokeColor: 'black', strokeWidth: 1, highlight: false, fixed: true, frozen: true });

var f_1 = f_board.create('glider', [f_init_x1, 0, f_axis], { withLabel: false, color: 'black', snapToGrid: true, snapSizeX: 0.01 });
f_1.on('drag',
    function() {
        if(f_1.X() < 0) {
            f_1.moveTo([0, 0]);
        }
        f_x1_input.rendNodeInput.value = f_1.X().toFixed(2);
        f_df1 = Number(f_df1_input.rendNodeInput.value);
        f_df2 = Number(f_df2_input.rendNodeInput.value);
        f_prob_input.rendNodeInput.value = current_f_probability(f_1.X(), f_2.X(), f_df1, f_df2);
        f_prob_disp.setText(') = ' + current_f_probability(f_1.X(), f_2.X(), f_df1, f_df2));
    }
);

var f_2 = f_board.create('glider', [f_init_x2, 0, f_axis], { withLabel: false, color: 'black', snapToGrid: true, snapSizeX: 0.01 });
f_2.on('drag',
    function() {
        if(f_2.X() < 0) {
            f_2.moveTo([0, 0]);
        }
        f_x2_input.rendNodeInput.value = f_2.X().toFixed(2);
        f_x2_disp.setText('< <i>X</i> < ' + f_2.X().toFixed(2));
        f_df1 = Number(f_df1_input.rendNodeInput.value);
        f_df2 = Number(f_df2_input.rendNodeInput.value);
        f_prob_input.rendNodeInput.value = current_f_probability(f_1.X(), f_2.X(), f_df1, f_df2);
        f_prob_disp.setText(') = ' + current_f_probability(f_1.X(), f_2.X(), f_df1, f_df2));
    }
);

// Set up the tick marks on the x-axis
var f_ticks = [];
var f_labels = [];

var tick_height = f_ymax / f_tick_ratio;
for (var i = 0; i < f_n_ticks; i++) {
    f_ticks[i] = f_board.create('segment',
            [[i * f_tick_delta, tick_height], [i * f_tick_delta, -tick_height]],
            { color: 'grey', strokeWidth: 1, fixed: true, highlight: false });
}

for (var i = 1; i < f_n_ticks; i++) {
    f_labels[i-1] = f_board.create('text',
            [i * f_tick_delta, -2 * tick_height, i * f_tick_delta ],
            { fixed: true, highlight: false });

}

// input variables

var f_df1_input = f_board.create('input', [2.5, 0.9, f_df1, 'df 1 = '], inputParam);

var f_df2_input = f_board.create('input', [2.5, 0.75, f_df2, 'df 2 = '], inputParam);

// display for the mean and standard deviation

var f_mean_disp = f_board.create('text', [2.65, 0.6,
        function() { return '&mu; = ' + f_mean.toFixed(4); }], textParam);

var f_stdev_disp = f_board.create('text', [2.65, 0.45,
        function() { return '&sigma; = ' + f_stdev.toFixed(4); }], textParam);

var f_shadeleft = f_board.create('integral',
        [[ function() { return 0; } , function() { return f_2.X(); }], f_curve], shadeParam);
f_shadeleft.setAttribute({ visible: false });

var f_shaderight = f_board.create('integral',
        [[ function() { return f_1.X(); }, function() { return 100; }], f_curve], shadeParam);
f_shaderight.setAttribute({ visible: false });

var f_shadebetween = f_board.create('integral',
        [[ function() { return f_1.X(); }, function() { return f_2.X(); }], f_curve], shadeParam);

var f_x1_input = f_board.create('input', [0.2, -0.6, f_1.X(), 'P( '], inputParam);

var f_x2_input = f_board.create('input', [1.25, -0.6, f_2.X(), ' < <i>X</i> < '], inputParam);

var f_x2_disp = f_board.create('text', [1.25, -0.6, '< <i>X</i> < 2'], textParam);
f_x2_disp.setAttribute({ visible: false });

var f_prob_input = f_board.create('input', [2.5, -0.6, current_f_probability(f_1.X(), f_2.X(), f_df1, f_df2), ') = '], inputParam);
f_prob_input.setAttribute({ visible: false });

var f_prob_disp = f_board.create('text', [2.5, -0.6, ') = ' + current_f_probability(f_1.X(), f_2.X(), f_df1, f_df2)], textParam);

// Buttons

var f_calc_button = f_board.create('button', [2.75, -0.8, 'Calculate',
    function () {

        if(isChecked(f_cb_area)) {
            if(!isNaN(f_x1_input.Value())) {
                f_1.moveTo([f_x1_input.Value(), 0]);
            }

            if(!isNaN(f_x2_input.Value())) {
                f_2.moveTo([f_x2_input.Value(), 0]);
            }
            f_df1 = Number(f_df1_input.rendNodeInput.value);
            f_df2 = Number(f_df2_input.rendNodeInput.value);
            f_prob_input.rendNodeInput.value = current_f_probability(f_x1_input.Value(), f_x2_input.Value(), f_df1, f_df2);
            f_prob_disp.setText(') = ' + current_f_probability(f_x1_input.Value(), f_x2_input.Value(), f_df1, f_df2));

        } else {
            if(!isNaN(f_prob_input.Value())) {

                f_df1 = Number(f_df1_input.rendNodeInput.value);
                f_df2 = Number(f_df2_input.rendNodeInput.value);
                var f = jStat.centralF.inv(f_prob_input.Value(), f_df1, f_df2);
                f_2.moveTo([f, 0]);
                f_x2_input.rendNodeInput.value = f;
                f_x2_disp.setText('< <i>X</i> < ' + f.toFixed(8));

            }
        }
}], { frozen: true });

var f_update = f_board.create('button', [2.75, 0.3, 'Update', function() {

        var new_df1 = f_df1_input.rendNodeInput.value;
        var new_df2 = f_df2_input.rendNodeInput.value;

        if ((new_df1 >= 1) && (new_df2 >= 1)) {

            f_df1 = Number(new_df1);
            f_df2 = Number(new_df2);

            if ((f_df1 >= 1) && (f_df1 < 2)) {
                f_ymax = 2.5;
            } else if ((f_df1 >= 2) && (f_df1 < 3)) {
                f_ymax = 1.5;
            } else {
                f_ymax = jStat.centralF.pdf(jStat.centralF.mode(f_df1, f_df2), f_df1, f_df2) * 1.3;
            }

            f_board.setBoundingBox([0, f_ymax, f_xmax, -f_ymax]);
            var tick_height = f_ymax / f_tick_ratio;

            // Update the display for just the labels and ticks we want
            for (var i = 0; i < f_n_ticks; i++) {
                f_ticks[i].point1.moveTo([i * f_tick_delta, tick_height]);
                f_ticks[i].point2.moveTo([i * f_tick_delta, -tick_height]);
            }

            for (var i = 1; i < f_n_ticks; i++) {
                f_labels[i-1].setText(i * f_tick_delta);
                f_labels[i-1].moveTo([i * f_tick_delta, -2 * tick_height]);
            }

            if (f_df2 <= 2) {
                f_mean = NaN;
            } else {
                f_mean = jStat.centralF.mean(f_df1, f_df2);
                f_stdev = Math.sqrt(jStat.centralF.variance(f_df1, f_df2));
            }


            var cur_x1 = f_x1_input.rendNodeInput.value;
            var cur_x2 = f_x2_input.rendNodeInput.value;

            f_1.moveTo([cur_x1, 0]);
            f_2.moveTo([cur_x2, 0]);

            f_x1_input.rendNodeInput.value = cur_x1;
            f_x2_input.rendNodeInput.value = cur_x2;
            f_x2_disp.setText('< <i>X</i> < ' + Number(cur_x2).toFixed(8));

            f_prob_input.rendNodeInput.value = current_f_probability(cur_x1, cur_x2, f_df1, f_df2);
            f_prob_disp.setText(') = ' + current_f_probability(cur_x1, cur_x2, f_df1, f_df2));

        }

        //f_df_input.rendNodeInput.value = f_df;

}], { frozen: true });

// Checkboxes

var f_cb_area = JSXCheckbox(f_board, 2.25, -0.2, 'Calculate Area', true,
    function() {
        setCheckbox(f_cb_area, true);
        setCheckbox(f_cb_xvalue, false);

        f_cb[BETWEEN].setAttribute( { disabled: false, strokeColor: 'black', highlight: true  });
        f_cb[LEFT].setAttribute( { disabled: false });
        f_cb[RIGHT].setAttribute( { disabled: false, strokeColor: 'black', highlight: true  });

        f_prob_input.setAttribute( { visible: false });
        f_prob_disp.setAttribute( { visible: true });

        f_x2_input.setAttribute( { disabled: false });
        f_x2_input.setAttribute( { visible: true });
        f_x2_disp.setAttribute({ visible: false });

        f_prob_type = LEFT;

    }, { fontSize: 18, frozen: true });

var f_cb_xvalue = JSXCheckbox(f_board, 2.25, -0.325, 'Calculate x-Value', false,
    function() {
        setCheckbox(f_cb_xvalue, true);
        setCheckbox(f_cb_area, false);

        f_cb[BETWEEN].setAttribute( { disabled: true, strokeColor: 'lightgray', highlight: false });
        f_cb[LEFT].setAttribute( { disabled: false });
        f_cb[RIGHT].setAttribute( { disabled: true, strokeColor: 'lightgray', highlight: false });
        set_f_cbtrue(LEFT);
        f_prob_type = LEFT;

        f_1.setAttribute({ visible: false });
        f_2.setAttribute({ visible: true });

        f_shadeleft.setAttribute({ visible: true });
        f_shaderight.setAttribute({ visible: false });
        f_shadebetween.setAttribute({ visible: false });

        f_x1_input.rendNodeInput.value = '0';
        f_x1_input.setAttribute({ disabled: true });

        f_x2_input.rendNodeInput.value = f_2.X().toFixed(2);
        f_x2_input.setAttribute({ visible: false });
        f_x2_disp.setAttribute({ visible: true });

        f_prob_input.setAttribute({ visible: true });
        f_prob_disp.setAttribute({ visible: false });

        f_2.moveTo([f_x2_input.rendNodeInput.value, 0]);

    }, { fontSize: 18, frozen: true });

var f_cb = [];

f_cb[BETWEEN] = JSXCheckbox(f_board, 0.2, -0.2, 'P(a < x < b)', true,
    function() {
        set_f_cbtrue(BETWEEN);
        f_prob_type = BETWEEN;

        f_shadeleft.setAttribute({ visible: false });
        f_shaderight.setAttribute({ visible: false });
        f_shadebetween.setAttribute({ visible: true });

        f_1.setAttribute({ visible: true });
        f_2.setAttribute({ visible: true });

        f_x1_input.rendNodeInput.value = f_1.X().toFixed(2);
        f_x1_input.setAttribute({ disabled: false });

        f_x2_input.rendNodeInput.value = f_2.X().toFixed(2);
        f_x2_input.setAttribute({ visible: true });
        f_x2_input.setAttribute({ disabled: false });
        f_x2_disp.setAttribute({ visible: false });

        f_prob_input.setAttribute({ visible: false });
        f_prob_disp.setAttribute({ visible: true });

    }, { fontSize: 18, frozen: true });

f_cb[LEFT] = JSXCheckbox(f_board, 0.2, -0.325, 'P(x < b)', false,
    function() {
        set_f_cbtrue(LEFT);
        f_prob_type = LEFT;

        f_1.setAttribute({ visible: false });
        f_2.setAttribute({ visible: true });

        f_shadeleft.setAttribute({ visible: true });
        f_shaderight.setAttribute({ visible: false });
        f_shadebetween.setAttribute({ visible: false });

        f_x1_input.rendNodeInput.value = '0';
        f_x1_input.setAttribute({ disabled: true });

        f_x2_input.rendNodeInput.value = f_2.X().toFixed(2);
        f_x2_input.setAttribute({ visible: true });
        f_x2_input.setAttribute({ disabled: false });
        f_x2_disp.setAttribute({ visible: false });

        f_prob_input.setAttribute({ visible: false });
        f_prob_disp.setAttribute({ visible: true });

    }, { fontSize: 18, frozen: true });

f_cb[RIGHT] = JSXCheckbox(f_board, 0.2, -0.45, 'P(x > a)', false,
    function() {
        set_f_cbtrue(RIGHT);
        f_prob_type = RIGHT;

        f_1.setAttribute({ visible: true });
        f_2.setAttribute({ visible: false });

        f_shadeleft.setAttribute({ visible: false });
        f_shaderight.setAttribute({ visible: true });
        f_shadebetween.setAttribute({ visible: false });

        f_x1_input.rendNodeInput.value = f_1.X().toFixed(2);
        f_x1_input.setAttribute({ disabled: false });

        f_x2_input.rendNodeInput.value = 'Infinity';
        f_x2_input.setAttribute({ visible: true });
        f_x2_input.setAttribute({ disabled: true });
        f_x2_disp.setAttribute({ visible: false });

        f_prob_input.setAttribute({ visible: false });
        f_prob_disp.setAttribute({ visible: true });

    }, { fontSize: 18, frozen: true });

function current_f_probability(x1, x2, df1, df2) {

    if(typeof(x1) !== 'number') {
        x1 = Number(x1);
    }
    if(typeof(x2) !== 'number') {
        x2 = Number(x2);
    }
    if(typeof(df1) !== 'number') {
        df1 = Number(df1);
    }
    if(typeof(df2) !== 'number') {
        df2 = Number(df2);
    }

    if(f_prob_type == BETWEEN) {

        var v1 = jStat.centralF.cdf(x1, df1, df2);
        var v2 = jStat.centralF.cdf(x2, df1, df2);

        return (v2 - v1).toFixed(4);

    } else if(f_prob_type == LEFT) {

        return jStat.centralF.cdf(x2, df1, df2).toFixed(4);

    } else if(f_prob_type == RIGHT) {

        return (1 - jStat.centralF.cdf(x1, df1, df2)).toFixed(4);

    }

}

function set_f_cbtrue(box) {
    f_cb[BETWEEN].rendNodeCheckbox.checked = false;
    f_cb[LEFT].rendNodeCheckbox.checked = false;
    f_cb[RIGHT].rendNodeCheckbox.checked = false;
    f_cb[BETWEEN]._value = false;
    f_cb[LEFT]._value = false;
    f_cb[RIGHT]._value = false;
    f_cb[box].rendNodeCheckbox.checked = true;
    f_cb[box]._value = true;
}

