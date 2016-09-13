var models = require('../../models/index');
var Error = require('../../data/error');

var findProject = function(nameSpace, nameProject){
    return;
};

module.exports = {

    findSpaceAndProject: function (req, res, next) {
        var nameSpace = req.params.space;
        var nameProject = req.params.project;

        var project = findProject(nameSpace, nameProject);
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