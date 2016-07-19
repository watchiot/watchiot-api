var models = require('../../models/index');
var client = require('redis');

var env = process.env.NODE_ENV || 'development';
if(env === 'production') {
    client = client.createClient(process.env.REDIS_URL);
}
else{
    client = client.createClient();
}

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
    return authHeader.split(" ");
}

module.exports = {
    auth: function (req, res, next) {
        var arrUserAndApikey = authSplit(req.header("Authorization"));

        if (arrUserAndApikey.length !== 2) {
            res.status(400).send('BAD REQUEST');
            return;
        }

        findUser(arrUserAndApikey, function (user) {
                req.user = user;
                next();
            });
    },
    isAuth: function (req, res, next) {
        if(req.user){
            next();
        } else {
            res.status(401).send('UNAUTHORIZED');
        }
    }
}