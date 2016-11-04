
var mongoose = require('mongoose');

var helper = require('../helper');

/** initialize mongoDB **/
if (mongoose.connection.readyState == 0) {
    mongoose.Promise = global.Promise;
    mongoose.connect(helper.config("mongodb_url"));
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