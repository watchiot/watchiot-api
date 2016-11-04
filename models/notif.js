
var mongoose = require('mongoose');

/** initialize mongoDB **/
if (mongoose.connection.readyState == 0) {

    mongoose.Promise = global.Promise;
    mongoose.connect(process.env.MONGODB_URI);
}

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

// assign a function to the "statics" object of our NotifSchema
NotifSchema.statics.saveProcessed = function(id, callback) {
    this.findById(id, function (err, notif) {
        notif.processed = true;
        notif.save(function(err) {
            err ? callback(false) : callback(true);
        });
    });
};

module.exports = mongoose.model('Notif', NotifSchema);
