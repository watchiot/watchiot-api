var models = require('../models/index');

function findUser(usernameApikey, fUserOk, fUserBad, fManyUserBad) {
    /*
     * find user with username = usernameApikey[0] and api_key = usernameApikey[1]
     * and with an email like primary
     */
    models.users.findOne({
        include: [
            {
                model: models.api_keys,
                where: {api_key: usernameApikey[1]}
            },
            {
                model: models.emails,
                where: {primary: true}
            }],
        where: {username: usernameApikey[0]}
    })
        .then(function (user) {
            if (user) {
                fUserOk(user);
            }
            else {
                fUserBad();
            }
        });
};

module.exports = function(req, res, next) {
    var auth = req.header("Authorization")
    var usernameApikey = auth.split(" ");

    /* Authorization format: {USERNAME API_KEY}*/
    if (usernameApikey.length !== 2) {
        res.status(400).send('BAD REQUEST');
        return;
    }

    findUser(usernameApikey, function (user) {
        req.user = user;
        next();
    }, function () {
        res.status(401).send('UNAUTHORIZED');
    }, function () {
        res.status(429).send('TOO MANY REQUESTS');
    });      
}