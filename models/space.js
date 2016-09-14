'use strict';
module.exports = function(sequelize, DataTypes) {
    var Spaces = sequelize.define('spaces', {
        id: { type: DataTypes.INTEGER, primaryKey: true }
    }, {
        classMethods: {
            associate: function(models) {
                Spaces.belongsTo(models.users)
            }
        }
    });
    return Spaces;
};