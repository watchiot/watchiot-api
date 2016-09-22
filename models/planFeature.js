'use strict';

module.exports = function (sequelize, DataTypes) {
    var PlanFeatures = sequelize.define('plan_features', {
        id: {type: DataTypes.INTEGER, primaryKey: true},
        value: DataTypes.STRING
    }, {
        timestamps: false,
        scopes: {
            findPlanFeature: function (models, planId, feature) {
                return {
                    include: [
                        {
                            model: models.features,
                            where: {name: feature}
                        }
                    ],
                    where: {plan_id: planId}
                }
            }
        },
        classMethods: {
            associate: function (models) {
                PlanFeatures.belongsTo(models.features);
                PlanFeatures.belongsTo(models.plans);
            },
            findReqPerHour: function (models, planId, callbackReqPerHour) {
                models.plan_features.scope({method: ['findPlanFeature', models, planId, "Request per hours for each project"]})
                    .findOne().then(callbackReqPerHour);
            }
        }
    });

    return PlanFeatures;
};