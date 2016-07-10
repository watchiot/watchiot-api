var express = require('express');
var router = express.Router();
var models = require('../models/index');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.post('/', function (req, res, next) {
    var email = req.user.emails[0]; // the principal email object
    res.json("{\"hello\": \"Hi " + req.user.username + " your principal email is " + email.email + "\"}");
});

module.exports = router;
