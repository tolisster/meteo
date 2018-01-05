window.App = window.App || {};

window.App.GraphPage = (function () {
	function GraphPage(db, storeName) {
		this.fromSelect = document.getElementById('from-select');
		this.toSelect = document.getElementById('to-select');
		const graphCanvas = document.getElementById('graph-canvas');

		// it's a trick! needed in order to overcome the remove event listener
		this.filter = this.filter.bind(this);

		const className = storeName.charAt(0).toUpperCase() + storeName.slice(1) + 'Graph';
		this.graph = new App[className](graphCanvas.getContext('2d'));

		this.store = new App.MeteoStore(db, storeName);

		const page = this;
		this.store.oncount = function (count) {
			page.graph.setCount(count);
		};

		let fillSelect = true;
		let lastYear;
		this.store.onnextdata = function (value) {
			page.graph.add(value);
			if (fillSelect) {
				if (value.y !== lastYear) {
					page.fromSelect.add(new Option(value.y, value.y));
					page.toSelect.add(new Option(value.y, value.y));
					lastYear = value.y;
				}
			}
		};

		this.store.onenddata = function () {
			if (fillSelect) {
				page.toSelect.value = lastYear;
				page.fromSelect.addEventListener('change', page.filter);
				page.toSelect.addEventListener('change', page.filter);
				fillSelect = false;
			}

			page.graph.update();
		};

		this.store.load(storeName);
	}

	GraphPage.prototype.filter = function () {
		this.store.abort();
		this.graph.clear();
		const from = parseInt(this.fromSelect.value);
		const to = parseInt(this.toSelect.value);
		if (from <= to) {
			this.store.filter(from, to);
		}
	};

	GraphPage.prototype.destroy = function () {
		this.fromSelect.removeEventListener('change', this.filter);
		this.toSelect.removeEventListener('change', this.filter);
		this.store.destroy();
		this.graph.destroy();
		removeOptions(this.fromSelect);
		removeOptions(this.toSelect);
	};

	function removeOptions(select) {
		for (let i = select.options.length - 1; i >= 0; i--) {
			select.remove(i);
		}
	}

	return GraphPage;

})();
