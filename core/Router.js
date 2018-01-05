window.App = window.App || {};

window.App.Router = (function () {
	function Router(routes) {
		this.routes = routes;
		routes[location.pathname](history.state);
		window.addEventListener('popstate', popstate.bind(this));
	}

	Router.prototype.push = function (state, title, pathname) {
		this.routes[pathname](state);
		history.pushState(state, title, pathname);
	};

	function popstate(event) {
		this.routes[location.pathname](event.state);
	}

	return Router;

})();
