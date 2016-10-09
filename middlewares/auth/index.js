'use strict';

var Response = require('../../data/response');
var models = require('../../models/index');
var helper = require('../../helper');

module.exports = {
    auth: function (req, res, next) {
        if (req.url === '/' && req.method === 'GET') return next();
        var userAndApikey = helper.parseAuthHeader(req.header("Authorization"));

        if (userAndApikey.length !== 2) {
            return res.status(400).json(JSON.stringify(new Response(400, 'BAD REQUEST', {
                description: 'Header authentication bad format. ' +
                'It has to be a header Authorization: {USERNAME} {API_KEY}'
            })));
        }

        var username = userAndApikey[0];
        var apiKey = userAndApikey[1];

        models.users.findUser(models, username, apiKey, function (user) {
            req.user = user;

            /** define the limit request options **/
            var limitOpts = {
                path: '*',
                method: 'all',
                lookup: ['connection.remoteAddress'],
                total: 10, // 10 requests per 10 minutes
                expire: 1000 * 60 * 10, //expire in 10s minute
                validUser: true
            };

            next(limitOpts);
        });
    },
    isAuth: function (req, res, next) {
        if ((req.url === '/' && req.method === 'GET') || req.user) {
            return next();
        }

        res.status(401).json(JSON.stringify(new Response(401, 'UNAUTHORIZED', {
            description: 'USERNAME or API_KEY incorrect'
        })));
    }
};