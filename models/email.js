'use strict';
module.exports = function(sequelize, DataTypes) {
  var Emails = sequelize.define('emails', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    email: DataTypes.STRING,
    primary: { type: DataTypes.BOOLEAN, defaultValue: true},
    checked: { type: DataTypes.BOOLEAN, defaultValue: true}
  }, {
    underscored: true
  }, {
    classMethods: {
      associate: function(models) {
        Emails.belongsTo(models.users)
      }
    }
  });
  return Emails;
};