var express = require('express');
var router = express.Router();
var models = require('../models/index');
var Ok = require('../data/ok');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.post('/', function (req, res, next) {
    // the principal email object
    var principalEmail = req.user.emails[0];
    var msg = 'Hi ' + req.user.username + ' your principal email is ' + principalEmail.email;
    res.json(JSON.stringify(new Ok({}, msg)));
});

module.exports = router;
