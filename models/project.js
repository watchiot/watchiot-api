'use strict';

var YAML = require('yamljs');

module.exports = function(sequelize, DataTypes) {
    var Projects = sequelize.define('projects', {
        id: { type: DataTypes.INTEGER, primaryKey: true },
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        configuration: DataTypes.TEXT,
        has_errors: DataTypes.BOOLEAN,
        status: DataTypes.BOOLEAN,
        user_owner_id: DataTypes.INTEGER,
        repo_name: DataTypes.STRING
    }, {
        instanceMethods: {
            parse: function() {
                return YAML.parse(this.configuration);
            }
        },
        classMethods: {
            associate: function(models) {
                Projects.belongsTo(models.users);
                Projects.belongsTo(models.spaces)
            }
        }
    });
    return Projects;
};