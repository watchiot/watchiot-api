var express = require('express');
var router = express.Router();
var models = require('../models/index');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.post('/', function (req, res, next) {
    // the principal email object
    var email = req.user.emails[0];

    var payload =
        "{" +
        "\"hello\": \"Hi " + req.user.username + " your principal email is " + email.email +
        "\"}";

    res.json(payload);
});

module.exports = router;
