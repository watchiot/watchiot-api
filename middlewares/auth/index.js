var models = require('../../models/index');
var Error = require('../../data/error');
var limiter = require('../../middlewares/limit')();

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

        if(req.user){
            next();
        } else {            
            var middleware = limiter({
                path: '*',
                method: 'all',
                lookup: ['connection.remoteAddress'],                
                total: 10, // 10 requests per minutes                
                expire: 1000 * 60 //expire in one minute
            });

            middleware(req, res, next, function(){
                if(res.statusCode !== 429){
                    res.status(401).json(JSON.stringify(new Error(401, 'UNAUTHORIZED')));
                }
            });
        }
    }
}