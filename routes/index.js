var express = require('express');
var router = express.Router();
var models = require('../models/index');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/', function(req, res, next) {
  var auth = req.header("Authorization")
  var username_apikey = auth.split(" ");

  if(username_apikey.length !== 2)
  {
    res.status(400).send('Bad request!');
    return;
  }

  models.users.findOne({
    where: {username: username_apikey[0]}
  })
  .then(function(user) {
    user.getApi_key().then(function(apiKey) {
      if(apiKey.api_key !== username_apikey[1])
      {
        res.status(400).send('Bad request!');
        return;
      }

      var email = "";
      var response = "{\"hello\": \"Hello " + user.username + " your principal email is " + email + "\"}";
      res.json(response);
    });
  });
});

module.exports = router;
