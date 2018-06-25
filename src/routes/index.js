var queueCommandManager = require("../qm/logic/queueCommandManager");
var externalDataRequestService = require("../qm/logic/externalDataRequestService");
var logger = require("../common/logger");
var express = require('express');
var router = express.Router();
var notificationHub=require('../notificationHub');


/* GET home page. */
/*eslint-disable no-unused-vars*/
router.post('/processCommand', async function (req, res, next) {
  try {

    let apiMessage = req.body;
    await queueCommandManager.processCommand(apiMessage);

   
    console.log(apiMessage.payload);
    if (apiMessage)
    {
      notificationHub.broadcastMessage(apiMessage);
    }    
    res.body=apiMessage;
    res.end(JSON.stringify(apiMessage.payload));
  }
  catch (error) {
    logger.log(error);
    res.end('end');
  }

});



router.post('/getData', async function (req, res, next) {
  try {
    let apiMessage = req.body;
    await externalDataRequestService.getData(apiMessage);
    console.log(apiMessage.payload);
    if (apiMessage)
    {
      notificationHub.broadcastMessage(apiMessage);
    }
    
    res.body=apiMessage;
    res.end(JSON.stringify(apiMessage.payload));
  }
  catch (error) {
    logger.log(error);
    res.end('end');
  }

});





router.get('/', async function (req, res, next) {
  try {
    res.render('index', { title: 'Test APIs page', message: 'Hello there!'});
  }
  catch (error) {
    logger.log(error);
    res.end('end');
  }

});




module.exports = router;
