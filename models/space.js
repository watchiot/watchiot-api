'use strict';
module.exports = function(sequelize, DataTypes) {
    var Spaces = sequelize.define('spaces', {
        id: { type: DataTypes.INTEGER, primaryKey: true },
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        user_owner_id: DataTypes.INTEGER
    }, {
        classMethods: {
            associate: function(models) {
                Spaces.belongsTo(models.users)
            }
        }
    });
    return Spaces;
};