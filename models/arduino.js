var five = require("johnny-five");
var board = new five.Board();

var low = 1500;
var mid = 700;
var high = 300;
var greenLed = null;
var redLed = null;
var blueLed = null;

//inits the board and turns off all the lights
function init() {
  board.on('ready', function() {
    greenLed = new five.Led(13);
    redLed = new five.Led(8);
    blueLed = new five.Led(4);

    greenLed.off();
    redLed.off();
    blueLed.off();
  });
}

function turnOffLeds() {
  greenLed.stop();
  redLef.stop();
  blueLed.stop();

  greenLed.off();
  redLef.off();
  blueLed.off();
}
function turnOnLeds() {
  greenLed.on();
  redLef.on();
  blueLed.on();
}
function turnOnAndOffLeds() {
  turnOnLeds();
  board.wait(3000, function() {
    turnOffLeds();
  });
}

function isReady() {
  return board.isConnected;
}

function displaySevere(incidentNumber) {
  pulse(incidentNumber, redLed);
}
function displayMedium(incidentNumber) {
  pulse(incidentNumber, blueLed);
}
function displayLow(incidentNumber) {
  pulse(incidentNumber, greenLed);
}

function pulse(incidentNumber, activeLed) {
  //show color
  var duration = incidentNumber * 2000;
  activeLed.strobe(1000);
  board.wait(duration, function() {
    activeLed.stop();
    activeLed.off();
    console.log('Turning off');
  });
}

var app = {};
app.init = init;
app.turnOffLeds = turnOffLeds;
app.turnOnLeds = turnOnLeds;
app.turnOnAndOffLeds = turnOnAndOffLeds;

app.isReady = isReady;
app.displaySevere = displaySevere;
app.displayMedium = displayMedium;
app.displaySevere = displaySevere;

module.exports = app;
