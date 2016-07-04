'use strict';
module.exports = function(sequelize, DataTypes) {
  var PlanFeatures = sequelize.define('plan_features', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    value: DataTypes.STRING
  } ,{
    timestamps: false,
    classMethods: {
      associate: function(models) {
        PlanFeatures.belongsTo(models.features);
        PlanFeatures.belongsTo(models.plans);
      }
    }
  });

  return PlanFeatures;
};