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

// middleware to search the space and the project
router.use('/:space/:project', project.findSpaceAndProject);

router.post('/:space/:project', function (req, res) {

    var user    = req.user;
    var space   = req.space;
    var project = req.project;

    console.log(space + '-' + project + '-' + user.username);
    res.json(JSON.stringify(new Ok('all is fine', {})));
});

module.exports = router;
