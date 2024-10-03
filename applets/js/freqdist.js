
function JSXFrequencyDistribution (dataset, nClasses, decimals = 0) {

	var xmin = min(dataset);
	var xmax = max(dataset);
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
