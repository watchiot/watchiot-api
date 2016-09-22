'use strict';
module.exports = function (sequelize, DataTypes) {
    var Users = sequelize.define('users', {
        id: {type: DataTypes.INTEGER, primaryKey: true},
        username: DataTypes.STRING,
        first_name: DataTypes.STRING,
        last_name: DataTypes.STRING,
        phone: DataTypes.STRING,
        status: DataTypes.BOOLEAN
    }, {
        scopes: {
            findUser: function (models, username, apiKey) {
                return {
                    include: [
                        {
                            model: models.api_keys,
                            where: {api_key: apiKey}
                        }, {
                            model: models.emails,
                            where: {primary: true}
                        }],
                    where: {username: username}
                }
            }
        },
        classMethods: {
            associate: function (models) {
                Users.hasMany(models.emails);
                Users.belongsTo(models.api_keys);
                Users.belongsTo(models.plans);
            },
            findUser: function(models, username, apiKey, callbackUser) {
                models.users.scope({method: ['findUser', models, username, apiKey]})
                    .findOne().then(callbackUser);
            }
        }
    });

    return Users;
};