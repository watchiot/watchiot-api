var express = require('express');
var router = express.Router();
var models = require('../models/index');

/* GET home page. */
router.get('/', function(req, res, next) {

  models.users.findAll({}).then(function(users) {
    res.json(users);
  });

});

router.post('/', function(req, res, next) {
  var auth = req.header("Authorization")

  res.json({'auth': auth})
});

module.exports = router;
