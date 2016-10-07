
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var NotifSchema   = new Schema({
    notif: {},
    metrics: {},
    status: String,
    processed: { type: Boolean, default: false },
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notif', NotifSchema);