'use strict';

var Response = require('../../data/response');
var models = require('../../models/index');
var helper = require('../../helper');

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
        helper.limit(req, res, next, {
            path: '*',
            method: 'all',
            lookup: ['connection.remoteAddress'],
            total: 10, // 10 requests per 10 minutes
            expire: 1000 * 60 * 10, //expire in 10s minute
            validUser: true
        });
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