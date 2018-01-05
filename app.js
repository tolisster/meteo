(function () {
	const menuBlock = document.getElementById('menu-block');

	// TODO set values from project settings on build
	const dbName = 'meteo';
	const dbVersion = 3;

	let currentPage = null;

	const stores = ['temperature', 'precipitation'];

	const dbRequest = indexedDB.open(dbName, dbVersion);

	dbRequest.onerror = function(event) {
		console.error('Open DB error: ' + event.target.error.message);
	};

	dbRequest.onsuccess = function (event) {
		const db = event.target.result;

		function openGraphPage(state) {
			if (currentPage) {
				currentPage.destroy();
			}
			const storeName = state ? state.storeName : stores[0];
			currentPage = new App.GraphPage(db, storeName);
		}

		const router = new App.Router({
			'/': openGraphPage,
			'/temperature': openGraphPage,
			'/precipitation': openGraphPage
		});

		function buttonClicked(event) {
			const button = event.currentTarget;
			const storeName = button.dataset.graph;
			router.push({storeName: storeName}, button.textContent, '/' + storeName);
		}

		const buttons = menuBlock.querySelectorAll('button');
		for (let i = 0, len = buttons.length; i < len; i++) {
			buttons[i].addEventListener('click', buttonClicked);
		}
	};

	dbRequest.onupgradeneeded = function (event) {
		const db = event.target.result;

		if (event.oldVersion >= 1 && event.oldVersion < dbVersion) {
			for (let i = 0; i < stores.length; i++) {
				localStorage.removeItem(stores[i] + '-count');
				db.deleteObjectStore(stores[i]);
			}
		}

		for (let i = 0; i < stores.length; i++) {
			const objectStore = db.createObjectStore(stores[i], {keyPath: 'm'});
			objectStore.createIndex('year', 'y', {unique: false});
		}
	};
})();
