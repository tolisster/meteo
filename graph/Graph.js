window.App = window.App || {};

window.App.Graph = (function () {
	let needToRender = true;  // draw at least once

	function Graph(context) {
		this.context = context;

		this.verticalAxisWidth = 40.5;
		this.horizontalAxisHeight = 60.5;
		// area of graph on canvas
		this.areaWidth = 0;
		this.areaHeight = 0;
		// padding for last horizontal label
		this.paddingRight = 8;

		this.data = [];
		// total days
		this.countData = 0;
		// maximum and minimum for vertical axis
		this.max = undefined;
		this.min = undefined;

		// run request next frame
		checkRender.call(this);
	}

	function resize() {
		// if the size of element has changed then resize canvas respectively
		const width = this.context.canvas.clientWidth;
		const height = this.context.canvas.clientHeight;
		if (this.context.canvas.width === width && this.context.canvas.height === height) {
			return false;
		}
		this.context.canvas.width = width;
		this.context.canvas.height = height;
		return true;
	}

	function checkRender() {
		if (!this.context) { // interrupt request TODO add a new setContext method with a call to checkRender again
			return;
		}
		if (resize.call(this) || needToRender) {
			needToRender = false;

			this.update();
		}
		requestAnimationFrame(checkRender.bind(this));
	}

	Graph.prototype.clear = function () {
		this.data = [];
		this.countData = 0;
		this.max = undefined;
		this.min = undefined;
		if (this.context) {
			this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
		}
	};

	Graph.prototype.setCount = function (count) {
		// set total days
		this.countData = count;
	};

	Graph.prototype.add = function (value) {
		this.max = this.max === undefined ? value.a : Math.max(this.max, value.a);
		this.min = this.min === undefined ? value.i : Math.min(this.min, value.i);
		this.data.push(value);
	};

	Graph.prototype.mapToContextHeight = function (value) {
		return value * this.heightProportion;
	};

	Graph.prototype.mapToContextY = function (value) {
		return this.areaHeight - this.mapToContextHeight(value - this.min);
	};

	Graph.prototype.mapToContextWidth = function (value) {
		return value * this.widthProportion;
	};

	Graph.prototype.mapToContextX = function (value) {
		return this.verticalAxisWidth + this.mapToContextWidth(value);
	};

	Graph.prototype.drawVerticalAxis = function () {
		this.context.beginPath();

		// vertical line
		this.context.moveTo(this.verticalAxisWidth, 0);
		this.context.lineTo(this.verticalAxisWidth, this.areaHeight);

		// labels
		this.context.textAlign = 'right';
		this.context.textBaseline = 'middle';
		// calculate the step based on the minimum distance between labels
		const step = Math.ceil(30 * (this.max - this.min) / this.areaHeight);
		// start from quotient so that zero label will be visible
		for (let i = Math.floor(this.max / step) * step; i >= this.min; i -= step) {
			const position = Math.floor(this.mapToContextY(i)) + 0.5;
			this.context.fillText(i, this.verticalAxisWidth - 10, position);
			this.context.moveTo(this.verticalAxisWidth - 4, position);
			this.context.lineTo(this.verticalAxisWidth, position);
		}
		this.context.strokeStyle = '#000';
		this.context.stroke();
	};

	Graph.prototype.drawHorizontalAxis = function () {
		// horizontal line
		this.context.beginPath();
		this.context.moveTo(this.verticalAxisWidth, this.areaHeight);
		this.context.lineTo(this.context.canvas.width - this.paddingRight, this.areaHeight);
		this.context.strokeStyle = '#000';
		this.context.stroke();

		// labels
		this.context.save();
		this.context.rotate(-Math.PI / 2);
		this.context.textAlign = 'right';
		this.context.textBaseline = 'middle';
		this.context.beginPath();
		// calculate the step based on the minimum distance between labels
		const step = Math.ceil(30 * this.data.length / this.areaWidth);
		for (let i = 0; i < this.data.length; i += step) {
			const y = Math.floor(this.verticalAxisWidth + i * this.areaWidth / this.data.length) + 0.5;
			this.context.fillText(this.data[i].m, -this.areaHeight - 10, y);
			this.context.moveTo(-this.areaHeight, y);
			this.context.lineTo(-this.areaHeight - 4, y);
		}
		this.context.strokeStyle = '#000';
		this.context.stroke();
		this.context.restore();
	};

	Graph.prototype.update = function () {
		if (!this.context || !this.data.length) {
			return;
		}

		this.areaWidth = this.context.canvas.width - this.verticalAxisWidth - this.paddingRight;
		this.areaHeight = this.context.canvas.height - this.horizontalAxisHeight;

		this.heightProportion = this.areaHeight / (this.max - this.min);
		this.widthProportion = this.areaWidth / this.countData;

		this.drawVerticalAxis();
		this.drawHorizontalAxis();
		this.draw();
	};

	Graph.prototype.destroy = function () {
		this.clear();
		this.context = null;
	};

	return Graph;

})();
