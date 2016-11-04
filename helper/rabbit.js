var jackrabbit = require('jackrabbit');

var helper = require('../helper');

var rabbit = jackrabbit(helper.config("rabbit_url"));

module.exports = {
    publish: function (notifId, notif, metrics) {
        /** queue the notification **/

        var exchange = rabbit.default();
        exchange.queue({name: 'task_queue', durable: true});

        exchange.publish({
            id: notifId,
            notif: notif,
            metric: metrics
        }, {
            key: 'task_queue'
        });
    },
    consume: function (onNotif) {
        /** consume the notification **/

        var exchange = rabbit.default();
        var queue = exchange.queue({name: 'task_queue', durable: true});
        queue.consume(onNotif);
    }
}