'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('users', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    username: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    status: DataTypes.BOOLEAN
  }, {
    timestamps: false
  },{
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return User;
};