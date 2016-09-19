
var Response = require('../data/response');

var express = require('express');
var router = express.Router();
var models = require('../models/index');
var project = require('../middlewares/project');

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index');
});

router.post('/', function (req, res) {
    // the principal email object
    var principalEmail = req.user.emails[0];
    var msg = 'Hi ' + req.user.username + ' your principal email is ' + principalEmail.email;
    res.json(JSON.stringify(new Response(200, msg, {})));
});

router.post('/:space/:project',
    project.project,
    project.limit,
    project.metric,
    project.notif,
    function (req, res) {

    var user    = req.user;
    var project = req.project;

    console.log(project.name + '-' + user.username);
    res.json(JSON.stringify(new Response(200, 'all is fine', {})));
});

module.exports = router;
