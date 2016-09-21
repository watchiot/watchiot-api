var Response = require('../../data/response');
var models = require('../../models');

var findProject = function(userId, nameSpace, nameProject, callbackProject){
    models.projects.scope({ method: ['findProject', models, userId, nameSpace, nameProject]})
        .findOne().then(callbackProject);
};

var findAmountOfReqPerHour = function(userId, callbackReqPerHour){
    callbackReqPerHour(60);
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
    limit: function(req, res, next) {
        var userId = req.user.id;

        // find max amount of request per project
        findAmountOfReqPerHour(userId, function(reqPerHour){
            if(reqPerHour) return next();

            res.status(429).json(JSON.stringify(new Response(429, 'RATE LIMIT EXCEEDED', {
                description: 'You have to wait for ' + res.get('Retry-After') + " sec"
            })));
        });
    },
    metric: function(req, res, next) {
        return next();
    },
    notif: function(req, res, next) {
        return next();
    }
};