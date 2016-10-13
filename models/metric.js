
var mongoose = require('mongoose');

var helper = require('../helper');
var config = helper.config();

/** initialize mongoDB **/
if (mongoose.connection.readyState == 0) {
    mongoose.Promise = global.Promise;
    config.use_env_variable ?
        mongoose.connect(process.env[config.mongodb_url]) :
        mongoose.connect(config.mongodb_url);
}

var Schema       = mongoose.Schema;

var MetricSchema   = new Schema({
    user_id: String,
    space_id: String,
    project_id: String,
    metrics: {},
    status: String,
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Metric', MetricSchema);