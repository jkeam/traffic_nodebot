var request = require('request');
var config = require('../config');
var mapquestKey = config.MAPQUEST_KEY;
var highDensityThreshold = 9;
var lowDensityThreshold = 2;
var debug = true;

function getGeocodeUrl(address) {
  return "http://www.mapquestapi.com/geocoding/v1/address?key=" + mapquestKey + "&location=" + address;
}
function getGeocodeInfo(responseString) {
  return JSON.parse(responseString.replace('handleGeocodeResponse(', ''));
}

function getTrafficUrl(mileRadius, latitude, longitude) {
  var radius = 0.016666667 * mileRadius;
  var latitudeHigh = latitude + radius;
  var latitudeLow = latitude - radius;
  var longitudeHigh = longitude + radius;
  var longitudeLow = longitude - radius;
  var url = "http://www.mapquestapi.com/traffic/v2/incidents?key=" + mapquestKey + "&callback=handleIncidentsResponse&boundingBox=" + latitudeHigh + "," + longitudeHigh + "," + latitudeLow + "," + longitudeLow + "&filters=construction,incidents&inFormat=kvp&outFormat=json";

  if (debug) {
    console.log("url: " + url);
    console.log('mileRadius: ' + mileRadius);
    console.log('radius: ' + radius);
  }
  return url
}
function getTrafficInfo(responseString) {
  var partial = responseString.replace('handleIncidentsResponse(', '');
  return JSON.parse(partial.slice(0, -2));
}

function geocode(socket, address, mileRadius, callback) {
  var geocodeUrl = getGeocodeUrl(mapquestKey, address);
  request(geocodeUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var geocodeInfo = getGeocodeInfo(response.body.toString());
      var latitude = null;
      var longitude = null;

      if (geocodeInfo && geocodeInfo.results && geocodeInfo.results.length > 0 &&
        geocodeInfo.results[0].locations && geocodeInfo.results[0].locations.length > 0) {
        var latLong = geocodeInfo.results[0].locations[0].latLng;
        if (debug) {
          console.log(latLong);
        }

        latitude = parseFloat(latLong.lat);
        longitude = parseFloat(latLong.lng);
        callback(socket, mileRadius, latitude, longitude);
      } else {
        console.error("Problem geocoding: " + address);
        console.error(response);
        socket.emit('error', "Problem geocoding: " + address);
      }
    } else {
      console.error("Problem geocoding: " + address);
      console.error(response)
      socket.emit('error', "Problem geocoding: " + address);
    }
  });
}

function traffic(socket, mileRadius, latitude, longitude) {
  if (debug) {
    console.log("mileRadius: " + mileRadius);
    console.log("latitude: " + latitude);
    console.log("longitude: " + longitude);
  }
  //traffic
  //var mileRadius = parseFloat(req.param('radius'));
  var url = getTrafficUrl(mileRadius, latitude, longitude);
  var traffic = null;
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var trafficInfo = getTrafficInfo(response.body.toString());
      var incidents = trafficInfo.incidents;
      var incidentNumber = incidents.length;
      var incidentDensity = incidentNumber / Math.pow(mileRadius * 2, 2);

      if (debug) {
        console.log("trafficInfoString: " + response.body.toString());
        console.log("trafficInfo: " + trafficInfo);
        console.log("incidents: " + incidents);
        console.log("incidentNumber: " + incidentNumber);
        console.log("incidentDensity: " + incidentDensity);
        console.log("statuscode: " + trafficInfo.info.statuscode);
      }
      if (trafficInfo.info.statuscode === 0) {
        for(var i =0; i< incidents.length; i++) {
          socket.emit('results', incidents[i].fullDesc);
        }
      } else {
        console.error('Problem getting traffic: ' + response);
        var messages = trafficInfo.info.messages;
        for(var i =0; i< messages.length; i++) {
          socket.emit('error', messages[i]);
        }
      }
    } else {
      socket.emit('error', "Problem getting traffic: " + response);
      console.error('Problem getting traffic: ' + response);
    }
  });
}

function process(socket, address, mileRadius) {
  geocode(socket, address, mileRadius, traffic);
}

var app = {};
app.process = process;
module.exports = app;
