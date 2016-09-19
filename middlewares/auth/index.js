var Response = require('../../data/response');
var models = require('../../models/index');

/**
 * find user with username = arrUserAndApikey[0] and api_key = arrUserAndApikey[1]
 * and with a primary email
 */
function findUser(userAndApikey, callbackUser) {
    var username = userAndApikey[0];
    var apiKey   = userAndApikey[1];

    models.users.findOne({
        include: [
            {
                model: models.api_keys,
                where: { api_key: apiKey}
            },{
                model: models.emails,
                where: { primary: true }
            }],
        where: {username: username}
    })
    .then(callbackUser);
}

function getUserAndApiKey(authHeader) {
    // format: {USERNAME} {API_KEY}
    if(authHeader === undefined) return "";
    return authHeader.split(" ");
}

module.exports = {
    auth: function (req, res, next) {
        if(req.url === '/' && req.method === 'GET') return next();
        var userAndApikey = getUserAndApiKey(req.header("Authorization"));

        if (userAndApikey.length !== 2) {
            res.status(400).json(JSON.stringify(new Response(400, 'BAD REQUEST', {
                description: 'Header authentication bad format. It has to be Authorization: {USERNAME} {API_KEY}'
            })));
            return;
        }

        findUser(userAndApikey, function (user) {
            req.user = user;
            next();
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