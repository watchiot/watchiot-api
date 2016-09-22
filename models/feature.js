'use strict';
module.exports = function (sequelize, DataTypes) {
    var Features = sequelize.define('features', {
        id: {type: DataTypes.INTEGER, primaryKey: true},
        name: DataTypes.STRING
    }, {
        timestamps: false,
        classMethods: {
            associate: function (models) {
                Features.hasMany(models.plan_features);
            }
        }
    });

    return Features;
};