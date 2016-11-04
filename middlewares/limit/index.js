'use strict';

var Response = require('../../helper/response');
var client = require('redis');

var db = client.createClient(process.env.REDIS_URL);

module.exports = {
    limit: function (opts, req, res, next) {
        opts.onRateLimited = typeof opts.onRateLimited === 'function' ? opts.onRateLimited : function (req, res) {
            res.status(429).json(JSON.stringify(new Response(429, 'RATE LIMIT EXCEEDED', {
                description: "Many unauthorized request. You have to wait for " + res.get('X-Retry-After') + " sec"
            })));
        };

        var lookups = opts.lookup.map(function (item) {
            if (typeof item == "number") return item;
            return item + ':' + item.split('.').reduce(function (prev, cur) {
                    return prev[cur]
                }, req)
        }).join(':');

        var path = opts.path || req.path;
        var method = (opts.method || req.method).toLowerCase();
        var key = 'ratelimit:' + path + ':' + method + ':' + lookups;
        db.get(key, function (err, limit) {
            if (err && opts.ignoreErrors) return next();
            var now = Date.now();

            limit = limit ? JSON.parse(limit) : {
                total: opts.total,
                remaining: opts.total,
                reset: now + opts.expire
            };

            if (now > limit.reset) {
                limit.reset = now + opts.expire;
                limit.remaining = opts.total;
            }

            // do not allow negative remaining
            limit.remaining = Math.max(Number(limit.remaining) - 1, -1);

            if (opts.validUser && req.user && limit.remaining >= 0) {
                return next();
            }

            db.set(key, JSON.stringify(limit), 'PX', opts.expire, function () {
                if (!opts.skipHeaders) {
                    res.set('X-RateLimit-Limit', limit.total);
                    res.set('X-RateLimit-Reset', Math.ceil(limit.reset / 1000)); // UTC epoch seconds
                    res.set('X-RateLimit-Remaining', Math.max(limit.remaining, 0));
                }

                if (limit.remaining >= 0) {
                    return next();
                }

                var after = (limit.reset - Date.now()) / 1000;
                if (!opts.skipHeaders) res.set('X-Retry-After', after);

                opts.onRateLimited(req, res);
            })
        })
    }
};

