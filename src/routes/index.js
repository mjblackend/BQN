var queueCommandManager = require("../qm/logic/queueCommandManager");
var logger = require("../common/logger");
var express = require('express');
var router = express.Router();
var notificationHub=require('../notificationHub');

/* GET home page. */
/*eslint-disable no-unused-vars*/
router.post('/processCommand', function (req, res, next) {
  try {
    let apiMessage = req.body;
    queueCommandManager.processCommand(apiMessage);
    let tbody = 'Ticket Number=' + apiMessage.payload.displayTicketNumber + " " + ' Counter State =' + apiMessage.payload.CurrentStateType
    console.log(tbody)
    notificationHub.broadcastMessage('Ticket Number=' + apiMessage.payload.displayTicketNumber);
    res.body=apiMessage;
    res.end(JSON.stringify(apiMessage.payload));
  }
  catch (error) {
    logger.log(error);
    res.end('end');
  }

});

router.get('/', function (req, res, next) {
  try {
    res.render('index', { title: 'Test APIs page', message: 'Hello there!' });
  }
  catch (error) {
    logger.log(error);
    res.end('end');
  }

});




module.exports = router;
