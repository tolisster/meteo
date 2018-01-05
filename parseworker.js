importScripts('core/HttpRequest.js');

// TODO set values from project settings on build
const dbName = 'meteo';
const dbVersion = 3;

function insertMonth(objectStore, month, values) {
	const year = parseInt(month.substr(0, 4));
	const data = {
		v: values,
		m: month, // used for keyPath and labels
		y: year, // used for index and dropdown
		a: Math.max.apply(null, values), // store maximum and minimum of month for axis
		i: Math.min.apply(null, values)
	};
	objectStore.add(data);
	postMessage({command: 'nextdata', value: data});
}

function parse(objectStore, data) {
	let lastMonth = '';
	let list = [];
	for (let i = 0; i < data.length; i++) {
		const month = data[i].t.substr(0, 7);
		if (month !== lastMonth) {
			if (lastMonth !== '') {
				insertMonth(objectStore, lastMonth, list);
				list = [];
			}
			lastMonth = month;
		}
		list.push(data[i].v);
	}
	insertMonth(objectStore, lastMonth, list);
}

onmessage = function(event) {
	const storeName = event.data.storeName;

	const httpRequest = new HttpRequest();
	httpRequest.onload = function (data) {
		const dbRequest = indexedDB.open(dbName, dbVersion);

		dbRequest.onsuccess = function (event) {
			const db = event.target.result;

			const transaction = db.transaction([storeName], 'readwrite');

			transaction.oncomplete = function () {
				close(); // done, close worker
			};

			transaction.onerror = function (event) {
				console.error('Transaction error: ' + event.target.errorCode);
			};

			postMessage({command: 'count', count: data.length});

			const objectStore = transaction.objectStore(storeName);
			parse(objectStore, data);

			postMessage({command: 'enddata'});
		};
	};
	httpRequest.open(storeName + '.json');
};
