var models = require('../../models');
var Error = require('../../data/error');

var findProject = function(userId, nameSpace, nameProject, fProject){
    models.projects.findOne({
        include: [
            {
                model: models.spaces,
                where: { name: nameSpace}
            }],
        where: {name: nameProject, user_id: userId}
    })
    .then(fProject);
};

module.exports = {

    project: function (req, res, next) {
        var userId = req.user.id;

        findProject(userId, req.params.space, req.params.project, function (project) {
            if(project) {
                req.project = project;
                return next();
            }

            res.status(404).json(JSON.stringify(new Error(404, 'NOT FOUND', {
                description: 'The Namespace or Project name does not exist.'
            })));
        });
    }
};