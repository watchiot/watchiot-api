var client = require('redis');
var express = require('express')

var env = process.env.NODE_ENV || 'development';
if(env === 'production') {
    db = client.createClient(process.env.REDIS_URL);
}
else{
    db = client.createClient();
}

var app = express();

module.exports = function() {
    return function (opts) {
        //db.flushdb();
        var middleware = function (req, res, next, callback) {
            if (opts.whitelist && opts.whitelist(req)) return next()
            opts.lookup = Array.isArray(opts.lookup) ? opts.lookup : [opts.lookup]
            opts.onRateLimited = typeof opts.onRateLimited === 'function' ? opts.onRateLimited : function (req, res, next) {
                res.status(429).json(JSON.stringify(new Error(429, 'Rate limit exceeded')));
                console.log(res._headers);
            }
            var lookups = opts.lookup.map(function (item) {
                return item + ':' + item.split('.').reduce(function (prev, cur) {
                        return prev[cur]
                    }, req)
            }).join(':')
            var path = opts.path || req.path
            var method = (opts.method || req.method).toLowerCase()
            var key = 'ratelimit:' + path + ':' + method + ':' + lookups
            db.get(key, function (err, limit) {
                if (err && opts.ignoreErrors) return next()
                var now = Date.now()
                limit = limit ? JSON.parse(limit) : {
                    total: opts.total,
                    remaining: opts.total,
                    reset: now + opts.expire
                }

                if (now > limit.reset) {
                    limit.reset = now + opts.expire
                    limit.remaining = opts.total
                }

                // do not allow negative remaining
                limit.remaining = Math.max(Number(limit.remaining) - 1, -1)
                db.set(key, JSON.stringify(limit), 'PX', opts.expire, function (e) {
                    if (!opts.skipHeaders) {
                        res.set('X-RateLimit-Limit', limit.total)
                        res.set('X-RateLimit-Reset', Math.ceil(limit.reset / 1000)) // UTC epoch seconds
                        res.set('X-RateLimit-Remaining', Math.max(limit.remaining, 0))
                    }

                    if (limit.remaining >= 0)
                    {
                        return callback();
                    }

                    var after = (limit.reset - Date.now()) / 1000

                    if (!opts.skipHeaders) res.set('Retry-After', after)

                    opts.onRateLimited(req, res, next)
                })

            })
        }
        if (typeof(opts.lookup) === 'function') {
            middleware = function (middleware, req, res, next) {
                return opts.lookup(req, res, opts, function () {
                    return middleware(req, res, next)
                })
            }.bind(this, middleware)
        }
        if (opts.method && opts.path) app[opts.method](opts.path, middleware)
        return middleware
    }
}
