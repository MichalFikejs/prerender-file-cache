var Cache = require('async-disk-cache');

module.exports = {
	init: function() {
		this.cache = new Cache('prerender', {
      compression: 'gzip',
    });
	},

	requestReceived: function(req, res, next) {
		this.cache.get(req.prerender.url, function (result) {
			if (result.isCached) {
				req.prerender.cacheHit = true;
				res.send(200, result.value);
			} else {
				next();
			}
		});
	},

	beforeSend: function(req, res, next) {
		if (!req.prerender.cacheHit && req.prerender.statusCode == 200) {
			this.cache.set(req.prerender.url, req.prerender.content);
		}
		next();
	}
};
