var express = require('express');
var router = express.Router();
//var arduino = require('./models/arduino');
var traffic = require('../models/traffic');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Nodebots Traffic' });
});

router.post('/', function(req,res){
  var address = req.param('address');
  var mileRadius = parseFloat(req.param('radius'));
  traffic.process(address, mileRadius);

  res.render('index', { title: 'Nodebots Traffic' });
});

module.exports = router;
