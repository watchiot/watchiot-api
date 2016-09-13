var models = require('../../models/index');
var Error = require('../../data/error');

var findProject = function(userId, nameSpace, nameProject){
    /*models.users.findOne({
        include: [
            {
                model: models.api_keys,
                where: { api_key: apiKey}
            },{
                model: models.emails,
                where: { primary: true }
            }],
        where: {username: username}
    })
    .then(function (user) {
        fUserAuth(user);
    });*/
};

module.exports = {

    findSpaceAndProject: function (req, res, next) {
        var userId      = req.user.id;
        var nameSpace   = req.params.space;
        var nameProject = req.params.project;

        var project = findProject(userId, nameSpace, nameProject);
        if(project === undefined) {
            res.status(404).json(JSON.stringify(new Error(404, 'NOT FOUND', {
                description: 'The Space name or Project name does not exist.'
            })));
            return;
        }

        req.project = project;
        next();
    }
};