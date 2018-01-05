window.App = window.App || {};

window.App.TemperatureGraph = (function () {

	const medium = 19; // average threshold temperature used for gradient

	/**
	 * TemperatureGraph.prototype ---> Graph.prototype
	 */
	function TemperatureGraph(context) {
		window.App.Graph.call(this, context);
	}

	TemperatureGraph.prototype = Object.create(window.App.Graph.prototype);
	TemperatureGraph.prototype.constructor = TemperatureGraph;

	TemperatureGraph.prototype.drawImitated = function (gradient) {
		this.context.save();
		this.context.fillStyle = gradient;
		let t = 0;
		for (let m = 0; m < this.data.length; m++) {
			const count = this.data[m].v.length;
			// simple draw filled rect
			this.context.fillRect(
				this.mapToContextX(t),
				this.mapToContextY(this.data[m].a),
				this.mapToContextWidth(count),
				this.mapToContextHeight(this.data[m].a - this.data[m].i)
			);
			t += count;
		}
		this.context.restore();
	};

	TemperatureGraph.prototype.drawReal = function (gradient) {
		this.context.beginPath();
		let moveTo = true;
		let t = 0;
		for (let m = 0; m < this.data.length; m++) {
			const values = this.data[m].v;
			for (let d = 0; d < values.length; d++) {
				const x = this.mapToContextX(t + d);
				const y = this.mapToContextY(values[d]);
				if (moveTo) {
					this.context.moveTo(x, y);
					moveTo = false;
				} else {
					this.context.lineTo(x, y);
				}
			}
			t += values.length;
		}
		this.context.strokeStyle = gradient;
		this.context.stroke();
	};

	TemperatureGraph.prototype.draw = function () {
		this.context.beginPath();
		const zeroPosition = Math.floor(this.mapToContextY(0)) + 0.5;
		this.context.moveTo(this.verticalAxisWidth, zeroPosition);
		this.context.lineTo(this.context.canvas.width - this.paddingRight, zeroPosition);
		this.context.strokeStyle = '#000';
		this.context.stroke();

		const gradient = this.context.createLinearGradient(0, 0, 0, this.areaHeight);
		const m = 1 - (medium - this.min) / (this.max - this.min);
		if (m > 0 && m < 1) {
			gradient.addColorStop(0, 'red');
			gradient.addColorStop(m, 'yellow');
		} else {
			gradient.addColorStop(0, 'yellow');
		}
		gradient.addColorStop(1, 'blue');

		// calculate when to display the imitated graph based on the width of month on canvas
		if (this.mapToContextWidth(30) < 1) {
			this.drawImitated(gradient);
		} else {
			this.drawReal(gradient);
		}
	};

	return TemperatureGraph;

})();
