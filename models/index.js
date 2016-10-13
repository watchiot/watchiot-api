'use strict';

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var helper = require('../helper');

/** obtain config env **/
var config = helper.config();

/** initialize Sequelize **/
config.define = {underscored: true};
var sequelize = config.use_env_variable ?
    new Sequelize(process.env[config.database_url], config) :
    new Sequelize(config.database, config.username, config.password, config);

var db = {};

/** this modules are using mongodb **/
var ignoreModels = ['metric.js', 'notif.js'];

var basename = path.basename(module.filename);
fs.readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf('.') !== 0) &&
            (file !== basename) &&
            (file.slice(-3) === '.js') &&
            (ignoreModels.indexOf(file) === -1);
    })
    .forEach(function (file) {
        var model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function (modelName) {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
