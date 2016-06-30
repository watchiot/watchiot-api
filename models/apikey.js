'use strict';
module.exports = function(sequelize, DataTypes) {
  var ApiKeys = sequelize.define('api_keys', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    api_key: DataTypes.STRING
  }, {
    underscored: true
  }, {
    classMethods: {
      associate: function(models) {
        
      }
    }
  });
  return ApiKeys;
};