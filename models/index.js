'use strict';

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var mongoose   = require('mongoose');
var basename = path.basename(module.filename);
var env = process.env.NODE_ENV || 'development';

var db = {};
var ignoreModels = [''];

var config = env === 'production' ?
    require(__dirname + '/../config/production.json')[env] :
    require(__dirname + '/../config/development.json')[env];

config.define = {underscored: true};
var sequelize = config.use_env_variable ?
    new Sequelize(process.env[config.use_env_variable], config) :
    new Sequelize(config.database, config.username, config.password, config);

config.mongodb_url ?
    mongoose.connect(process.env[config.mongodb_url]) :// connect to our database
    mongoose.connect('mongodb://127.0.0.1/' + config.database);

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
