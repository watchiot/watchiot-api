'use strict';

var YAML = require('yamljs');

module.exports =  function(yamlString) {
    return YAML.parse(yamlString);
}
