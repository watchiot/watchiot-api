

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MetricSchema   = new Schema({
    name: String
});

module.exports = mongoose.model('Metric', MetricSchema);