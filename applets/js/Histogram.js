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
