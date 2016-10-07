
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MetricSchema   = new Schema({
    metrics: {},
    status: String,
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Metric', MetricSchema);