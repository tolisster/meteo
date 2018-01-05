const HttpRequest = (function () {
	function HttpRequest() {
		this.xhr = new XMLHttpRequest;
		this.xhr.addEventListener('load', load.bind(this));
	}

	HttpRequest.prototype.open = function (url) {
		this.xhr.open('GET', url);
		try {
			// some browsers throw when setting `responseType` to an unsupported value
			this.xhr.responseType = 'json';
		} catch (error) {
		}
		this.xhr.send();
	};

	function load() {
		if (this.xhr.status === 200) {
			const supportsJSON = 'response' in this.xhr && this.xhr.responseType === 'json';
			this.onload(supportsJSON ? this.xhr.response : JSON.parse(this.xhr.responseText));
		}
	}

	return HttpRequest;

})();

/*function HttpRequest (url) {
	return new Promise(function (resolve, reject) {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300) {
				resolve(xhr.response);
			} else {
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			}
		};
		xhr.onerror = function () {
			reject({
				status: this.status,
				statusText: xhr.statusText
			});
		};
		xhr.send();
	});
}*/