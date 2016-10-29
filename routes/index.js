
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

    res.json(JSON.stringify(new Response(200, msg, {})));
});

/** custom middlewares **/
var project = require('../middlewares/project');
var limit = require('../middlewares/limit');

var middlewares = [
    project.project,        //
    project.isStatus,       //
    project.isReady,        //
    project.validIp,        //
    project.reqPerhour,     //
    limit.limit,            //
    project.hasMetric,      //
    project.validMetrics,   //
    project.evalMetrics,    //
    project.saveMetrics,    //
    project.saveNotif       //
];

/** POST api request **/
router.post('/:space/:project', middlewares,
    function (req, res) {
        var msg = 'The request was OK. Your metrics will be processed.';
        res.json(JSON.stringify(new Response(200, msg, {})));
    });

module.exports = router;
