'use strict';

var YAML = require('yamljs');

module.exports = function (sequelize, DataTypes) {
    var Projects = sequelize.define('projects', {
        id: {type: DataTypes.INTEGER, primaryKey: true},
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        configuration: DataTypes.TEXT,
        ready: DataTypes.BOOLEAN,
        status: DataTypes.BOOLEAN,
        user_owner_id: DataTypes.INTEGER,
        repo_name: DataTypes.STRING
    }, {
        scopes: {
            findProject: function (models, userId, nameSpace, nameProject) {
                return {
                    include: [
                        {
                            model: models.spaces,
                            where: {name: nameSpace}
                        }],
                    where: {name: nameProject, user_id: userId }
                }
            }
        },
        classMethods: {
            associate: function (models) {
                Projects.belongsTo(models.users);
                Projects.belongsTo(models.spaces)
            },
            findProject: function (models, userId, nameSpace, nameProject, callbackProject) {
                models.projects.scope({method: ['findProject', models, userId, nameSpace, nameProject]})
                    .findOne()
                    .then(callbackProject);
            }
        },
        instanceMethods: {
            parse: function () {
                return YAML.parse(this.configuration);
            },
            validMetrics: function (metrics) {
                var config = this.parse();
                var configMetrics = config.metrics;

                var errors = {};
                for(var metric in metrics) {
                    if(configMetrics.hasOwnProperty(metric)) {
                        var metricType = configMetrics[metric];
                        var metricValue = metrics[metric];

                        if (typeof metricValue !== metricType) {
                            errors[metric] = "The value type of metric " + metric + " has to be " + metricType;
                        }
                    }
                    else {
                        errors[metric] = "The metric " + metric + " does not exist into the configuration yml project.";
                    }
                }

                return errors;
            }
        }
    });
    return Projects;
};