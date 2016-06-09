var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {

    auth = req.get("Authorization");
    res.json({ hello: req.body})
});

module.exports = router;