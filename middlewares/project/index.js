var Response = require('../../data/response');
var models = require('../../models');

var findProject = function(userId, nameSpace, nameProject, callbackProject){
    models.projects.findOne({
        include: [
            {
                model: models.spaces,
                where: { name: nameSpace}
            }],
        where: {name: nameProject, user_id: userId}
    })
    .then(callbackProject);
};

module.exports = {
    project: function (req, res, next) {
        var userId = req.user.id;

        findProject(userId, req.params.space, req.params.project, function (project) {
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
        return next();
    },
    metric: function(req, res, next) {
        return next();
    },
    notif: function(req, res, next) {
        return next();
    }
};