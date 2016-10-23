
var Response = require('../helper/response');

var express = require('express');
var router = express.Router();

var models = require('../models/index');

/** custom middlewares **/
var project = require('../middlewares/project');
var limit = require('../middlewares/limit');

/** GET home page. **/
router.get('/', function (req, res) {
    res.render('index');
});

/** POST test request **/
router.post('/', function (req, res) {
    /** the principal email **/
    var principalEmail = req.user.emails[0];
    var msg = 'Hi ' + req.user.username + ' your principal email is ' + principalEmail.email;
    res.json(JSON.stringify(new Response(200, msg, {})));
});

/** POST api request **/
router.post('/:space/:project',
    project.project, project.isStatus,
    project.isReady, project.validIp,
    project.reqPerhour, limit.limit,
    project.hasMetric, project.validMetrics,
    project.evalMetrics, project.saveMetrics,
    project.saveNotif,
    function (req, res) {
        res.json(JSON.stringify(new Response(200, 'all is fine', {})));
    });

module.exports = router;
