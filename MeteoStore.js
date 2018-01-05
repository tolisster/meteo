window.App = window.App || {};

window.App.MeteoStore = (function () {
	let abortRequest = [];
	let cursorRequest = null;

	function MeteoStore(db) {
		this.db = db;
	}

	MeteoStore.prototype.load = function (name) {
		this.name = name;
		const count = localStorage.getItem(name + '-count');
		if (count) {
			this.oncount(parseInt(count));
			const objectStore = this.db.transaction(name).objectStore(name);
			iterateCursor.call(this, objectStore);
		} else {
			loadFromServer.call(this);
		}
	};

	MeteoStore.prototype.filter = function (from, to) {
		this.oncount((new Date(to + 1, 0) - new Date(from, 0)) / (1000 * 60 * 60 * 24));

		const objectStore = this.db.transaction(this.name).objectStore(this.name);
		const index = objectStore.index('year');
		iterateCursor.call(this, index, IDBKeyRange.bound(from, to));
	};

	function iterateCursor(index, query) {
		if (query === undefined) {
			query = null;
		}
		cursorRequest = index.openCursor(query);
		cursorRequest.onsuccess = cursorSuccess.bind(this);
	}

	function cursorSuccess(event) {
		const index = abortRequest.indexOf(event.currentTarget);
		if (index > -1) {
			abortRequest.splice(index, 1);
			return;
		}
		const cursor = event.target.result;
		if (cursor) {
			this.onnextdata(cursor.value);
			cursor.continue();
		}
		else {
			this.onenddata();
		}
	}

	MeteoStore.prototype.abort = function () {
		if (cursorRequest && cursorRequest.readyState === 'pending') {
			abortRequest.push(cursorRequest);
		}
	};

	function loadFromServer() {
		const store = this;
		this.loaderWorker = new Worker('parseworker.js');

		let count;
		this.loaderWorker.onmessage = function(event) {
			switch (event.data.command) {
				case 'count':
					count = event.data.count;
					store.oncount(event.data.count);
					break;
				case 'nextdata':
					store.onnextdata(event.data.value);
					break;
				case 'enddata':
					// store the state about the successful parsing and in value will be total days
					localStorage.setItem(store.name + '-count', count);
					store.onenddata();
					break;
				default:
					console.log('Command ' + event.data.command + ' not found.');
			}
		};

		this.loaderWorker.postMessage({storeName: this.name});
	}

	MeteoStore.prototype.destroy = function () {
		if (this.loaderWorker) {
			// if abort is called in the middle of parsing, then the transaction will roll back
			this.loaderWorker.terminate();
		}
		this.abort();
	};

	return MeteoStore;

})();
