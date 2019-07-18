var Cache = require('file-system-cache');

const ttl = process.env.CACHE_PAGE_TTL || 86400000;

module.exports = {
	init: function() {
		this.cache = Cache.default();
	},

	requestReceived: function(req, res, next) {
		this.cache.get(req.prerender.url).then(function (result) {
			if (result && Date.now() - result.time < ttl) {
				req.prerender.cacheHit = true;
				res.send(200, result.content);
			} else {
				next();
			}
		}).catch((error) => console.error(error));
	},

	beforeSend: function(req, res, next) {
		if (!req.prerender.cacheHit && req.prerender.statusCode == 200) {
			this.cache.set(req.prerender.url, {
                time: Date.now(),
                content: req.prerender.content,
            });
		}
		next();
	}
};
