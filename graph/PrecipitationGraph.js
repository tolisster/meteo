window.App = window.App || {};

window.App.PrecipitationGraph = (function () {

	/**
	 * PrecipitationGraph.prototype ---> Graph.prototype
	 */
	function PrecipitationGraph(context) {
		window.App.Graph.call(this, context);
	}

	PrecipitationGraph.prototype = Object.create(window.App.Graph.prototype);
	PrecipitationGraph.prototype.constructor = PrecipitationGraph;

	PrecipitationGraph.prototype.drawImitated = function () {
		this.context.save();
		this.context.fillStyle = '#999';
		let t = 0;
		for (let m = 0; m < this.data.length; m++) {
			const count = this.data[m].v.length;
			// draw triangles is well suited like precipitation for a month
			this.context.beginPath();
			this.context.moveTo(this.mapToContextX(t + count / 2), this.mapToContextY(this.data[m].a));
			this.context.lineTo(this.mapToContextX(t), this.areaHeight);
			this.context.lineTo(this.mapToContextX(t + count), this.areaHeight);
			this.context.closePath();
			this.context.fill();
			t += count;
		}
		this.context.restore();
	};

	PrecipitationGraph.prototype.drawReal = function () {
		this.context.strokeStyle = '#000';
		let t = 0;
		for (let m = 0; m < this.data.length; m++) {
			const values = this.data[m].v;
			for (let d = 0; d < values.length; d++) {
				this.context.fillRect(
					this.mapToContextX(t + d),
					this.mapToContextY(values[d]),
					this.mapToContextWidth(1),
					this.mapToContextHeight(values[d])
				);
			}
			t += values.length;
		}
	};

	PrecipitationGraph.prototype.draw = function () {
		// calculate when to display the imitated graph based on the width of month on canvas
		if (this.mapToContextWidth(30) < 1) {
			this.drawImitated();
		} else {
			this.drawReal();
		}
	};

	return PrecipitationGraph;

})();
