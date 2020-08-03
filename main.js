import "ol/ol.css";
import BingMaps from "ol/source/BingMaps";
import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import View from "ol/View";
import { Geolocation } from "ol";
import { useGeographic } from "ol/proj";

useGeographic();

var locations = {
  delhi: [77.1025, 28.7041],
  nagpur: [79.0882, 21.1458],
  bhopal: [77.4126, 23.2599],
  indore: [75.8577, 22.7196],
  goa: [74.124, 15.2993],
};

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent =
  SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
var mic = document.getElementById("mic-button");

mic.onclick = activateMic;

var englishRecognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();
englishRecognition.grammars = speechRecognitionList;
englishRecognition.continuous = false;
englishRecognition.lang = "en-in";
englishRecognition.interimResults = false;
englishRecognition.maxAlternatives = 1;

var hindiRecognition = new SpeechRecognition();
speechRecognitionList = new SpeechGrammarList();
hindiRecognition.grammars = speechRecognitionList;
hindiRecognition.continuous = false;
hindiRecognition.lang = "hi";
hindiRecognition.interimResults = false;
hindiRecognition.maxAlternatives = 1;

var styles = [
  "RoadOnDemand",
  "Aerial",
  "AerialWithLabelsOnDemand",
  "CanvasDark",
  "OrdnanceSurvey",
];
var layers = [];
var i, ii;
for (i = 0, ii = styles.length; i < ii; ++i) {
  layers.push(
    new TileLayer({
      visible: false,
      preload: Infinity,
      source: new BingMaps({
        key: "Ajf6VD2-jFe_15FOEWawzh6Sk0hKFL1ti30sUX76vz0g11BE8PrcLpLKU6He4_N3",
        imagerySet: styles[i],
      }),
    })
  );
}

var map = new Map({
  layers: layers,
  target: "map",
  view: new View({
    center: [77.1025, 28.7041],
    zoom: 13,
  }),
});

var select = document.getElementById("layer-select");
function onChange() {
  var style = select.value;
  for (var i = 0, ii = layers.length; i < ii; ++i) {
    layers[i].setVisible(styles[i] === style);
  }
}
select.addEventListener("change", onChange);
onChange();

englishRecognition.onerror = deactivateMic;

englishRecognition.onresult = function (event) {
  var result = event.results[0][0].transcript;
  result = result.toLowerCase();
  console.log(result);

  if (result.includes("in") && result.includes("zoom")) {
    zoomIn();
  } else if (result.includes("out") && result.includes("zoom")) {
    zoomOut();
  } else if (result.includes("up")) {
    panUp();
  } else if (result.includes("down")) {
    panDown();
  } else if (result.includes("left")) {
    panLeft();
  } else if (result.includes("right")) {
    panRight();
  } else if (result.includes("delhi")) {
    panAnimate(locations["delhi"]);
  } else if (result.includes("nagpur")) {
    panAnimate(locations["nagpur"]);
  } else if (result.includes("bhopal")) {
    panAnimate(locations["bhopal"]);
  } else if (result.includes("indore")) {
    panAnimate(locations["indore"]);
  } else if (result.includes("goa")) {
    panAnimate(locations["goa"]);
  }
  onChange();
  deactivateMic();
};

function zoomIn() {
  var view = map.getView();
  var zoom = view.getZoom();
  view.animate({
    zoom: zoom + 1,
  });
}

function zoomOut() {
  var view = map.getView();
  var zoom = view.getZoom();
  view.animate({
    zoom: zoom - 1,
  });
}

function getMoveAmount() {
  var view = map.getView();
  var zoomLevel = view.getZoom();
  return 1000 * Math.pow(2, -zoomLevel);
}

function panLeft() {
  var view = map.getView();
  var center = view.getCenter();
  center[0] -= getMoveAmount();
  panAnimate(center);
}

function panRight() {
  var view = map.getView();
  var center = view.getCenter();
  center[0] += getMoveAmount();
  panAnimate(center);
}

function panUp() {
  var view = map.getView();
  var center = view.getCenter();
  center[1] += getMoveAmount() / 1.5;
  panAnimate(center);
}

function panDown() {
  var view = map.getView();
  var center = view.getCenter();
  center[1] -= getMoveAmount() / 1.5;
  panAnimate(center);
}

function panAnimate(location) {
  var view = map.getView();
  view.animate({
    center: location,
    duration: 1000,
  });
}

function activateMic() {
  mic.parentElement.className = "breathe invert-filter mic-button-holder";
  englishRecognition.start();
}

function deactivateMic() {
  mic.parentElement.className = "mic-button-holder";
}
