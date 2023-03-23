
var calc_board = JXG.JSXGraph.initBoard('calculation', {
        boundingbox: [0,10,10,0],
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

var calc_text = calc_board.create('text', [0.35, 9.25, 'Enter an expression to evaluate:'], { fontSize: 18, frozen: true, fixed: true });
var calc_input = calc_board.create('input', [0.35, 8.5, '', ''], { fontSize: 18, cssStyle: 'width: 480px', frozen: true, fixed: true });
calc_input.rendNodeInput.onkeypress = function(e) {
    if(e.which == 13) {
        calc_calculate();
    }
};

var calc_button = calc_board.create('button', [8, 9.25, 'Calculate', function() { calc_calculate(); }], { frozen: true, fixed : true });
var calc_clear_button = calc_board.create('button', [7.75, 7.5, 'Clear',
    function() {
        calc_input.rendNodeInput.value = '';
    }]);

var calc_output = calc_board.create('text', [1, 7.5, '='], { anchorY: 'top', fontSize: 24, frozen: true, fixed: true });

function calc_calculate() {

    var expression = calc_input.rendNodeInput.value;
    var weightedstats = false;

    // check to see if we are doing some statistics
    if (expression.includes('1-var_stats')) {
        expression = expression.replace('1-var_stats', '');
        expression = expression.replace('(', '');
        expression = expression.replace(')', '');
        expression = expression.replace(/ /g, '');
        exression = expression.trim();
        // Determine if we are in weighted mode or not
        if (expression.includes(',')) {
            weightedstats = true;
            var lists = expression.split(',');
            var xdata = getRawData(getListByName(lists[0]));
            var fdata = getRawData(getListByName(lists[1]));
            var n = stats.wn(xdata, fdata);
            var mean = stats.wmean(xdata, fdata);
            var s = stats.wstdev(xdata, fdata);
            var sigma = stats.wstdevp(xdata, fdata);
            var sum = stats.wsum(xdata, fdata);
            var sumofsqr = stats.wsumofsqr(xdata, fdata);
            var min = stats.wmin(xdata, fdata);
            var q1 = stats.wq1(xdata, fdata);
            var median = stats.wmedian(xdata, fdata);
            var q3 = stats.wq3(xdata, fdata);
            var max = stats.wmax(xdata, fdata);
            calc_output.setText(
                '<i>n</i> = ' + round(n, PRECISION) + '<br/>'
                + '<i>x&#772;</i> = ' + round(mean, PRECISION) + '<br/>'
                + '<i>s</i> = ' + round(s, PRECISION) + '<br/>'
                + '<i>&sigma;</i> = ' + round(sigma, PRECISION) + '<br/>'
                + '&Sigma;<i>x</i> = ' + round(sum, PRECISION) + '<br/>'
                + '&Sigma;<i>x<sup>2</sup></i> = ' + round(sumofsqr, PRECISION) + '<br/>'
                + 'Minimum = ' + round(min, PRECISION) + '<br/>'
                + '<i>Q<sub>1</sub></i> = ' + round(q1, PRECISION) + '<br>'
                + 'Median = ' + round(median, PRECISION) + '<br/>'
                + '<i>Q<sub>3</sub></i> = ' + round(q3, PRECISION) + '<br>'
                + 'Maximum = ' + round(max, PRECISION));
        } else {
            var xdata = getRawData(getListByName(expression));
            var n = xdata.length;
            var mean = stats.mean(xdata);
            var s = stats.stdev(xdata);
            var sigma = stats.stdevp(xdata);
            var sum = stats.sum(xdata);
            var sumofsqr = stats.sumofsqr(xdata);
            var min = stats.min(xdata);
            var q1 = stats.q1(xdata);
            var median = stats.median(xdata);
            var q3 = stats.q3(xdata);
            var max = stats.max(xdata);
            calc_output.setText(
                '<i>n</i> = ' + round(n, PRECISION) + '<br/>'
                + '<i>x&#772;</i> = ' + round(mean, PRECISION) + '<br/>'
                + '<i>s</i> = ' + round(s, PRECISION) + '<br/>'
                + '<i>&sigma;</i> = ' + round(sigma, PRECISION) + '<br/>'
                + '&Sigma;<i>x</i> = ' + round(sum, PRECISION) + '<br/>'
                + '&Sigma;<i>x<sup>2</sup></i> = ' + round(sumofsqr, PRECISION) + '<br/>'
                + 'Minimum = ' + round(min, PRECISION) + '<br/>'
                + '<i>Q<sub>1</sub></i> = ' + round(q1, PRECISION) + '<br>'
                + 'Median = ' + round(median, PRECISION) + '<br/>'
                + '<i>Q<sub>3</sub></i> = ' + round(q3, PRECISION) + '<br>'
                + 'Maximum = ' + round(max, PRECISION));
        }
    } else if (expression.includes('lin_reg')) {
        expression = expression.replace('lin_reg', '');
        expression = expression.replace('(', '');
        expression = expression.replace(')', '');
        expression = expression.replace(/ /g, '');
        exression = expression.trim();
        var lists = expression.split(',');
        var xdata = getRawData(getListByName(lists[0]));
        var ydata = getRawData(getListByName(lists[1]));
        var r = stats.correlation(xdata, ydata);
        var rsqr = sqr(r);
        var reg = stats.linreg(xdata, ydata);
        var m = reg[0];
        var b = reg[1];
            calc_output.setText(
                '<i>a</i> = ' + round(m, PRECISION) + '<br/>'
                + '<i>b</i> = ' + round(b, PRECISION) + '<br/>'
                + '<i>r<sup>2</sup></i> = ' + round(rsqr, PRECISION) + '<br/>'
                + '<i>r</i> = ' + round(r, PRECISION));
    } else {
        // If not, just evaluate the expression
        var v = round(evalstr(expression), PRECISION);
        calc_output.setText(' = ' + v);
    }

}

var calc_1varstats = calc_board.create('button', [7, 6.5, 'Single Var Stats',
        function() {
            calc_input.rendNodeInput.value = calc_input.rendNodeInput.value + '1-var_stats(';
        }], { frozen: true, fixed: true });

var calc_linreg = calc_board.create('button', [7, 6, 'Linear Regression',
        function() {
            calc_input.rendNodeInput.value = calc_input.rendNodeInput.value + 'lin_reg(';
        }], { frozen: true, fixed: true });

var calc_combination = calc_board.create('button', [7, 5, 'Combination',
        function() {
            calc_input.rendNodeInput.value = calc_input.rendNodeInput.value + 'combinations(';
        }], { frozen: true, fixed: true });

var calc_permutation = calc_board.create('button', [7, 4.5, 'Permutation',
        function() {
            calc_input.rendNodeInput.value = calc_input.rendNodeInput.value + 'permutations(';
        }], { frozen: true, fixed: true });

var calc_factorial = calc_board.create('button', [7, 4, 'Factorial',
        function() {
            calc_input.rendNodeInput.value = calc_input.rendNodeInput.value + '!';
        }], { frozen: true, fixed: true });

let calc_squareroot = calc_board.create('button', [7, 3, '&#8730;x',
        function() {
            calc_input.rendNodeInput.value = calc_input.rendNodeInput.value + 'sqrt(';
        }], { frozen: true, fixed: true });

let calc_square = calc_board.create('button', [8, 3, 'x^y',
        function() {
            calc_input.rendNodeInput.value = calc_input.rendNodeInput.value + '^';
        }], { frozen: true, fixed: true });

var calc_about = calc_board.create('button', [7, 1, 'About',
        function() {
            alert('Statistics Calculator<br/>created by David Flenner<br/>copyright 2020<br/>'
                    + 'This program is free software: you can redistribute it and/or'
                    + 'modify it under the terms of the GNU General Public License as published by'
                    + 'the Free Software Foundation, either version 3 of the License, or'
                    + 'any later version.'
                    + 'This program is distributed in the hope that it will be useful,'
                    + 'but WITHOUT ANY WARRANTY; without even the implied warranty of'
                    + 'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the'
                    + 'GNU General Public License for more details.'
                    + 'You should have received a copy of the GNU General Public License'
                    + 'along with this program.  If not, see <https://www.gnu.org/licenses/>.'
                    + 'Dependencies:'
                    + 'JSX Graph - https://jsxgraph.uni-bayreuth.de/wp/index.html'
                    + 'math.js - https://mathjs.org/'
                    + 'jStat - https://jstat.github.io/');
        }], { frozen: true, fixed: true });

function getListByName(listname) {
    listname = listname.trim();
    listname = listname.toLowerCase();
    if(listname == "l1") {
        return list1_data;
    } else if(listname == "l2") {
        return list2_data;
    } else if(listname == "l3") {
        return list3_data;
    } else return undefined;
}

function getRawData(list_data) {
    if(list_data == undefined) {
        return undefined;
    } else {
        var raw_data = [];
        for (var i = 0; i < list_data.length; i++) {
            var data = list_data[i].rendNodeInput.value;
            if (data !== '') {
                var val = math.evaluate(data);
                raw_data.push(val);
            }
        }
        return raw_data;
    }
}