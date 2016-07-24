var models = require('../../models/index');
var Error = require('../../data/error');
var client = require('redis');
var express = require('express')

var env = process.env.NODE_ENV || 'development';
if(env === 'production') {
    client = client.createClient(process.env.REDIS_URL);
}
else{
    client = client.createClient();
}

var app = express();

function findUser(arrUserAndApikey, fUserAuth) {

     // find user with username = arrUserAndApikey[0] and api_key = arrUserAndApikey[1]
     // and with a primary email
    models.users.findOne({
            include: [
                {
                    model: models.api_keys,
                    where: {api_key: arrUserAndApikey[1]}
                },
                {
                    model: models.emails,
                    where: {primary: true}
                }],
            where: {username: arrUserAndApikey[0]}
        })
        .then(function (user) {
            fUserAuth(user);
        });
};

function authSplit(authHeader) {
    // format: {USERNAME} {API_KEY}
    if(authHeader === undefined){
        return "";
    }
    return authHeader.split(" ");
}

function limit(app, db) {
    return function (opts) {
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

module.exports = {

auth: function (req, res, next) {
        if(req.url === '/' && req.method === 'GET') return next();
        var arrUserAndApikey = authSplit(req.header("Authorization"));

        if (arrUserAndApikey.length !== 2) {
            res.status(400).json(JSON.stringify(new Error(400, 'BAD REQUEST')));
            return;
        }

        findUser(arrUserAndApikey, function (user) {
                req.user = user;
                next();
            });
    },
    isAuth: function (req, res, next) {
        if(req.url === '/' && req.method === 'GET') return next();
        //client.flushdb();
        if(req.user){
            next();
        } else {
            var limiter = limit(app, client);
            var middleware = limiter({
                path: '*',
                method: 'all',
                lookup: ['connection.remoteAddress'],
                // 150 requests per hour
                total: 10,
                expire: 1000 * 60 * 60
            });
            middleware(req, res, next, function(){
                if(res.statusCode !== 429)
                {
                    res.status(401).json(JSON.stringify(new Error(401, 'UNAUTHORIZED')));
                }
            });
        }
    }
}