
var Response = require('../helper/response');

var express = require('express');
var router = express.Router();

var models = require('../models/index');

/** GET API HomePage. **/
router.get('/', function (req, res) { res.render('index'); });

/** POST API request for test API_KEY **/
router.post('/', function (req, res) {

    /** the principal email **/
    var principalEmail = req.user.emails[0];

    var msg  = 'The USERNAME and API KEY are corrects. Welcome ' + req.user.username
        msg += ' your principal email is ' + principalEmail.email;

    res.json(JSON.stringify(new Response(200, msg)));
});

/** custom middlewares **/
var project = require('../middlewares/project');
var limit = require('../middlewares/limit');

var middlewares = [
    project.project,        // obtain the Project bundle
    project.isStatus,       // verify is the project has status (active to receive request) on true
    project.isReady,        // verify is the project has ready (configuration is correct) on true
    project.validIp,        // verify is the configuration has defined an IP and if the IP of request is permitted
    project.reqPerhour,     // obtain the request per hour defined in the user plan
    limit.limit,            // verify the request per hour and how many request the project has in this hour
    project.hasMetric,      // verify if the request has metrics
    project.validMetrics,   // verify if the metrics sending in the request match with the metrics defined in the project
    project.evalMetrics,    // evaluate the metrics and inject the notification if it has to send one
    project.saveMetrics,    // save the metrics with his values
    project.saveNotif       // save the notification if apply
];

/** POST api request **/
router.post('/:space/:project', middlewares,
    function (req, res) {
        var msg = 'The request was OK. Your metrics will be processed';
        res.json(JSON.stringify(new Response(200, msg)));
    });

module.exports = router;
