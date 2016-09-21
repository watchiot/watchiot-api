
var Response = require('../../data/response');

var models = require('../../models/index');
var client = require('redis');

var env = process.env.NODE_ENV || 'development';
db = env === 'production' ? client.createClient(process.env.REDIS_URL)
                          : client.createClient();

function findUser(userAndApikey, callbackUser) {
    var username = userAndApikey[0];
    var apiKey   = userAndApikey[1];

    models.users.scope({ method: ['findUser', models, username, apiKey]})
        .findOne().then(callbackUser);
}

function parseAuthHeader(authHeader) {
    // {USERNAME} {API_KEY}
    return authHeader === undefined ? "" : authHeader.split(" ");
}

module.exports = {
    auth: function (req, res, next) {
        if(req.url === '/' && req.method === 'GET') return next();
        var userAndApikey = parseAuthHeader(req.header("Authorization"));

        if (userAndApikey.length !== 2) {
            res.status(400).json(JSON.stringify(new Response(400, 'BAD REQUEST', {
                description: 'Header authentication bad format. ' +
                'It has to be a header Authorization: {USERNAME} {API_KEY}'
            })));

            return;
        }

        findUser(userAndApikey, function (user) {
            req.user = user;
            next();
        });        
    },
    limit: function (req, res, next) {
        //TODO: set by configuration
        opts = {
            path: '*',
            method: 'all',
            lookup: ['connection.remoteAddress'],
            total: 10, // 10 requests per 10 minutes
            expire: 1000 * 60 * 10 //expire in 10s minute
        };

        if (opts.whitelist && opts.whitelist(req)) {
            return next();
        }
        opts.lookup = Array.isArray(opts.lookup) ? opts.lookup : [opts.lookup];
        opts.onRateLimited = typeof opts.onRateLimited === 'function' ? opts.onRateLimited : function (req, res) {
            res.status(429).json(JSON.stringify(new Response(429, 'RATE LIMIT EXCEEDED', {
                description: "You have to wait for " + res.get('Retry-After') + " sec"
            })));
        };

        var lookups = opts.lookup.map(function (item) {
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
            if (req.user && limit.remaining >= 0) {
                return next();
            }

            db.set(key, JSON.stringify(limit), 'PX', opts.expire, function (e) {
                if (!opts.skipHeaders) {
                    res.set('X-RateLimit-Limit', limit.total);
                    res.set('X-RateLimit-Reset', Math.ceil(limit.reset / 1000)); // UTC epoch seconds
                    res.set('X-RateLimit-Remaining', Math.max(limit.remaining, 0));
                }

                if (limit.remaining >= 0) {
                    return next();
                }

                var after = (limit.reset - Date.now()) / 1000;
                if (!opts.skipHeaders) res.set('Retry-After', after);

                opts.onRateLimited(req, res, next);
            })
        })
    },
    isAuth: function (req, res, next) {
        if((req.url === '/' && req.method === 'GET') || req.user){
            return next();
        }

        res.status(401).json(JSON.stringify(new Response(401, 'UNAUTHORIZED', {
            description: 'USERNAME or API_KEY incorrect'
        })));
    }
};