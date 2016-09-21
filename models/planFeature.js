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
    }, scopes: {
      findPlanFeature: function (models, planId, feature) {
        return {
          include: [
            {
              model: models.features,
              where: { name: feature }
            }
          ],
          where: {plan_id: planId}
        }
      }
    }
  });

  return PlanFeatures;
};