window.FeiraRouter = (function () {
  var routes = [];
  var currentPath = "";
  var guard = null;

  function add(pattern, handler) {
    routes.push({ pattern: pattern, handler: handler, keys: [] });
    return this;
  }

  function match(route, path) {
    var pattern = route.pattern;
    var keys = [];
    var regexStr = pattern.replace(/:(\w+)/g, function (_, key) {
      keys.push(key);
      return "([^/]+)";
    });
    var regex = new RegExp("^" + regexStr + "$");
    var match = path.match(regex);
    if (!match) return null;
    var params = {};
    keys.forEach(function (key, i) {
      params[key] = decodeURIComponent(match[i + 1]);
    });
    return params;
  }

  function handleRoute() {
    var path = window.location.pathname;
    if (path === currentPath) return;
    currentPath = path;

    for (var i = 0; i < routes.length; i++) {
      var params = match(routes[i], path);
      if (params !== null) {
        if (guard && !guard(path, params)) {
          return;
        }
        routes[i].handler(params);
        return;
      }
    }
  }

  function navigate(path, replace) {
    if (replace) {
      history.replaceState(null, "", path);
    } else {
      history.pushState(null, "", path);
    }
    currentPath = "";
    handleRoute();
  }

  function start() {
    window.addEventListener("popstate", function () {
      currentPath = "";
      handleRoute();
    });

    document.addEventListener("click", function (e) {
      var link = e.target.closest("[data-router-link]");
      if (link) {
        e.preventDefault();
        navigate(link.getAttribute("href"));
      }
    });

    handleRoute();
  }

  function setGuard(fn) {
    guard = fn;
  }

  function path() {
    return window.location.pathname;
  }

  return {
    add: add,
    start: start,
    navigate: navigate,
    setGuard: setGuard,
    path: path,
    match: match,
  };
})();
