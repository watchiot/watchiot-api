var models = require('../../models/index');
var Error = require('../../data/error');
var limiter = require('../../middlewares/limit')();

var limit = limiter({
    path: '*',
    method: 'all',
    lookup: ['connection.remoteAddress'],
    total: 10, // 10 requests per 10 minutes
    expire: 1000 * 60 * 10 //expire in 10s minute
});

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
}

function authSplit(authHeader) {
    // format: {USERNAME} {API_KEY}
    if(authHeader === undefined){
        return "";
    }
    return authHeader.split(" ");
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
            limit(req, res, next, user);
        });        
    },
    isAuth: function (req, res, next) {
        if((req.url === '/' && req.method === 'GET') || req.user){
            return next();
        }

        res.status(401).json(JSON.stringify(new Error(401, 'UNAUTHORIZED')));        
    }
};