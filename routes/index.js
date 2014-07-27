var express = require('express');
var router = express.Router();
var request = require('request');
var five = require("johnny-five");
var board = new five.Board();

var low = 1500;
var mid = 700;
var high = 300;
var led = null;
var mapquestKey = "";

board.on('ready', function() {
  if (led == null) {
      led = new five.Led(13);
  }

  led.on();
});

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Nodebots Traffic' });
});

router.post('/', function(req,res){
  var address = req.param('address');
  var isError = false;

  if (board.isConnected) {
    console.log('connected');

    //geocode
    var geocodeUrl = "http://www.mapquestapi.com/geocoding/v1/address?key=" + mapquestKey + "&location=" + address;
    request(geocodeUrl, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        //console.log(response.body);
        var geocodeInfo = JSON.parse(response.body.toString().replace('handleGeocodeResponse(', ''));
        var latitude = null;
        var longitude = null;

        if (geocodeInfo && geocodeInfo.results && geocodeInfo.results.length > 0 &&
          geocodeInfo.results[0].locations && geocodeInfo.results[0].locations.length > 0) {
          var latLong = geocodeInfo.results[0].locations[0].latLng;
          console.log(latLong);

          latitude = parseFloat(latLong.lat);
          longitude = parseFloat(latLong.lng);
        } else{
          isError = true;
        }

        if (!isError) {
          //traffic
          var radius = 0.016666667 * parseFloat(req.param('radius'));
          var latitudeHigh = latitude + radius;
          var latitudeLow = latitude - radius;
          var longitudeHigh = longitude + radius;
          var longitudeLow = longitude - radius;

          var url = "http://www.mapquestapi.com/traffic/v2/incidents?key=" + mapquestKey + "&callback=handleIncidentsResponse&boundingBox=" + latitudeHigh + "," + longitudeHigh + "," + latitudeLow + "," + longitudeLow + "&filters=construction,incidents&inFormat=kvp&outFormat=json"
          var traffic = null;
          request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              var responseString = response.body.toString().replace('handleIncidentsResponse(', '');
              var trafficInfo = JSON.parse(responseString.slice(0, -2));
              var incidents = trafficInfo.incidents;
              var incidentNumber = incidents.length;
              console.log("incidentNumber: " + incidentNumber);

              var duration = incidentNumber * 2000;

              led.strobe(1000);
              board.wait(duration, function() {
                led.stop();
                led.on();
                console.log('Turning off');
              });
            } else {
              led.off();
              console.error('Error has occurred')
            }
          });
        } else {
          console.error("Problem geocoding: " + address);
          console.error(response)
        }
      } else {
        console.error("Problem geocoding: " + address);
        console.error(response)
      }
    });
  }

  res.render('index', { title: 'Nodebots Traffic' });
});

module.exports = router;
