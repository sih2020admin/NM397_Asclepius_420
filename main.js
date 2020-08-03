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

var zoomLevels = {
  delhi: 13,
  nagpur: 13,
  bhopal: 13,
  indore: 13,
  goa: 13,
};

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent =
  SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var micButton = document.getElementById("mic-button");
var langButton = document.getElementById("lang-button");

micButton.onclick = activateMic;
langButton.onclick = toggleLanguage;

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

var currentRecognitionModel = englishRecognition;

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
  } else if (result.includes("delhi")) {
    panAnimate(locations["delhi"], zoomLevels["delhi"]);
  } else if (result.includes("nagpur")) {
    panAnimate(locations["nagpur"], zoomLevels["nagpur"]);
  } else if (result.includes("bhopal")) {
    panAnimate(locations["bhopal"], zoomLevels["bhopal"]);
  } else if (result.includes("indore")) {
    panAnimate(locations["indore"], zoomLevels["indore"]);
  } else if (result.includes("goa")) {
    panAnimate(locations["goa"], zoomLevels["goa"]);
  } else if (result.includes("up")) {
    panUp();
  } else if (result.includes("down")) {
    panDown();
  } else if (result.includes("left")) {
    panLeft();
  } else if (result.includes("right")) {
    panRight();
  }
  onChange();
  deactivateMic();
};

hindiRecognition.onresult = function (event) {
  var result = event.results[0][0].transcript;
  console.log(result);

  if (result.includes("बड़ा") && result.includes("करो")) {
    zoomIn();
  } else if (result.includes("छोटा") && result.includes("करो")) {
    zoomOut();
  } else if (result.includes("दिल्ली")) {
    panAnimate(locations["delhi"], zoomLevels["delhi"]);
  } else if (result.includes("नागपुर")) {
    panAnimate(locations["nagpur"], zoomLevels["nagpur"]);
  } else if (result.includes("भोपाल")) {
    panAnimate(locations["bhopal"], zoomLevels["bhopal"]);
  } else if (result.includes("इंदौर")) {
    panAnimate(locations["indore"], zoomLevels["indore"]);
  } else if (result.includes("गोवा")) {
    panAnimate(locations["goa"], zoomLevels["goa"]);
  } else if (result.includes("ऊपर")) {
    panUp();
  } else if (result.includes("नीचे")) {
    panDown();
  } else if (result.includes("बाएं") || result.includes("बाय") || result.includes("बाए")) {
    panLeft();
  } else if (result.includes("दाएं") || result.includes("दाय") || result.includes("दाए")) {
    panRight();
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

function panAnimate(location, zoom) {
  var view = map.getView();
  view.animate({
    zoom: zoom ? zoom : view.getZoom(),
    center: location,
    duration: 1000,
  });
}

function activateMic() {
  micButton.parentElement.className = "breathe invert-filter mic-button-holder";
  currentRecognitionModel.start();
}

function deactivateMic() {
  micButton.parentElement.className = "mic-button-holder";
}

function toggleLanguage() {
  if (langButton.innerText == "English") {
    langButton.innerText = "Hindi";
    currentRecognitionModel = hindiRecognition;
  } else if (langButton.innerText == "Hindi") {
    langButton.innerText = "English";
    currentRecognitionModel = englishRecognition;
  }
}
