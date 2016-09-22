'use strict';
module.exports = function (sequelize, DataTypes) {
    var Plans = sequelize.define('plans', {
        id: {type: DataTypes.INTEGER, primaryKey: true},
        name: DataTypes.STRING,
        amount_per_month: DataTypes.DECIMAL
    }, {
        timestamps: false,
        classMethods: {
            associate: function (models) {
                Plans.hasOne(models.users);
                Plans.hasMany(models.plan_features);
            }
        }
    });

    return Plans;
};