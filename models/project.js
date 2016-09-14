'use strict';
module.exports = function(sequelize, DataTypes) {
    var Projects = sequelize.define('projects', {
        id: { type: DataTypes.INTEGER, primaryKey: true }
    }, {
        classMethods: {
            associate: function(models) {
                Projects.belongsTo(models.users);
                Projects.belongsTo(models.spaces)
            }
        }
    });
    return Projects;
};