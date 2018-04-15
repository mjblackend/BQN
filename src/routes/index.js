var queueCommandManager = require("../qm/logic/queueCommandManager");
var logger = require("../common/logger");
var express = require('express');
var router = express.Router();


/* GET home page. */
/*eslint-disable no-unused-vars*/
router.post('/processCommand', function (req, res, next) {
  try {
    let apiMessage = req.body;
    queueCommandManager.processCommand(apiMessage);
    console.log('Ticket Number=' + apiMessage.payload.displayTicketNumber);
    res.body=apiMessage;
    res.end('Ticket Number=' + apiMessage.payload.displayTicketNumber);
  }
  catch (error) {
    logger.log(error);
    res.end('end');
  }

});

/*
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
*/


module.exports = router;
