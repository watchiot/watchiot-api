'use strict';

var ipaddr = require('ipaddr.js');
var YAML = require('yamljs');
var evaluate = require('static-eval');
var parse = require('esprima').parse;

var Metric = require('./metric');

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
            validIp: function(ip, callback) {
                var ips = this.parse()['ip'];

                ip = ipaddr.IPv6.parse(ip).toIPv4Address();
                if(ips) {
                    if(ips.indexOf(ip) === -1) {
                        return callback(false);
                    }
                }

                callback(true);
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
            },
            evalMetrics: function(metrics, callback) {
                var config = this.parse();
                for(var status in config) {
                    if(status !== "metrics" && status !== "default") {
                        try {
                            var src = config[status].when;
                            if(src) {
                                var ast = parse(src).body[0].expression;
                                if (evaluate(ast, metrics)) {
                                    return callback(status);
                                }
                            }
                        } catch(err) {
                            return callback();
                        }
                    }
                }

                callback(config["default"]);
            },
            saveMetrics: function(status, metrics) {
                var metric = new Metric();

                metric.name = status;
                metric.save(function(err) {
                    if (err)
                        console.log(err);

                    console.log('Bear created!');
                });
            }
        }
    });
    return Projects;
};