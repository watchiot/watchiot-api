'use strict';

module.exports = {
    parseAuthHeader: function(authHeader){
        /** {USERNAME} {API_KEY} **/
        return authHeader === undefined ? "" : authHeader.split(" ");
    },
    isEmpty: function(obj) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                return false;
        }

        return JSON.stringify(obj) === JSON.stringify({});
    },
    int: function (str) {
        if (!str) return 0;
        return parseInt(str, 10);
    },
    config: function() {
        var env = process.env.NODE_ENV || 'development';
        return env === 'production' ?
            require(__dirname + '../../config/production.json')[env] :
            require(__dirname + '../../config/development.json')[env];
    }
};