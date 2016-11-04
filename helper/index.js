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
    }
};