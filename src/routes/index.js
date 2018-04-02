var express = require('express');
var router = express.Router();

/* GET home page. */
/*eslint-disable no-unused-vars*/
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
