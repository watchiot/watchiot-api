var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'WatchIoT API' });
});

router.post('/', function(req, res, next) {
  var auth = req.header("Authorization")

  res.json({'auth': auth})
});

module.exports = router;
