
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var NotifSchema   = new Schema({
    user_id: String,
    space_id: String,
    project_id: String,
    notif: {},
    metrics: {},
    status: String,
    processed: { type: Boolean, default: false },
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notif', NotifSchema);