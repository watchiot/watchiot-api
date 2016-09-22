var Response = require('../../data/response');
var models = require('../../models');
var limit = require('../../models/limit');

var findProject = function(userId, nameSpace, nameProject, callbackProject){
    models.projects.scope({ method: ['findProject', models, userId, nameSpace, nameProject]})
        .findOne().then(callbackProject);
};

var findReqPerHour = function(planId, callbackReqPerHour){
    models.plan_features.scope({ method: ['findPlanFeature', models, planId, "Request per hours for each project"]})
        .findOne().then(callbackReqPerHour);
};

module.exports = {
    project: function (req, res, next) {
        var userId = req.user.id;
        var namespace = req.params.space;
        var nameproject = req.params.project;

        findProject(userId, namespace, nameproject, function (project) {
            if(project) {
                req.project = project;
                return next();
            }

            res.status(404).json(JSON.stringify(new Response(404, 'NOT FOUND', {
                description: 'The Namespace or Project name does not exist.'
            })));
        });
    },
    reqPerhour: function(req, res, next) {
        var planId = req.user.plan_id;

        // find max amount of request per project
        findReqPerHour(planId, function(planFeatures){
            if(planFeatures && planFeatures.value){
                req.reqPerHour = planFeatures.value;
                return next();
            }

            res.status(500).json(JSON.stringify(new Response(500, 'EXCEPTION', {})));
        });
    },
    limit: function(req, res, next) {
        var reqPerHour = req.reqPerHour;

        limit(req, res, next, {
            lookup: [req.user.id, 'connection.remoteAddress'],
            total: reqPerHour, // reqPerHour requests per one hour
            expire: 1000 * 60 * 60, //expire in one hour
            onRateLimited: function (req, res) {
                res.status(429).json(JSON.stringify(new Response(429, 'RATE LIMIT EXCEEDED', {
                    description: "You limit of request per project is " + reqPerHour + "/hr. " +
                    "You have to wait for " + res.get('X-Retry-After') + " sec"
                })));
            }
        });
    },
    metric: function(req, res, next) {
        return next();
    },
    notif: function(req, res, next) {
        return next();
    }
};