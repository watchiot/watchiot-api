var express = require('express');
var router = express.Router();
var models = require('../models/index');
var Ok = require('../data/ok');
var project = require('../middlewares/project');

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index');
});

router.post('/', function (req, res) {
    // the principal email object
    var principalEmail = req.user.emails[0];
    var msg = 'Hi ' + req.user.username + ' your principal email is ' + principalEmail.email;
    res.json(JSON.stringify(new Ok(msg, {})));
});

// middleware to search the project
router.use('/:space/:project', project.project);

router.post('/:space/:project', function (req, res) {

    var user    = req.user;
    var project = req.project;

    console.log(project.name + '-' + user.username);
    res.json(JSON.stringify(new Ok('all is fine', {})));
});

module.exports = router;
