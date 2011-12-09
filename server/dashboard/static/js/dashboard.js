$(document).ready(function () {
    "use strict";

    var map = new L.Map('map', {
        center: new L.LatLng(35.2819, -120.6617),
        zoom: 11
    }),

        incidentListItem = function (evt) {
            // Loads a single incident to the list
            var div = document.createElement("div");
            if (evt.properties.category === "Medical") {
                div.className = 'incdnt med';
            } else if (evt.properties.category === "Fire") {
                div.className = 'incdnt fire';
            } else if (evt.properties.category === "Hazard") {
                div.className = 'incdnt hazard';
            } else if (evt.properties.category === "Public Assist") {
                div.className = 'incdnt pubassist';
            } else if (evt.properties.category === "Law Enforcement") {
                div.className = 'incdnt lawenf';
            } else {
                div.className = 'incdnt';
            }
            div.innerHTML = evt.properties.time + '<br />' +
                evt.properties.details + '<br />' + evt.properties.address;
            div.onclick = function () {
                map.panTo(evt.layer.getLatLng());
                evt.layer.openPopup();
            };
            return div;
        },

        incidentMap = function (evt) {
            // Loads a single incident to the map
            var base = "http://cfslo.no-ip.org:8000/incident/static/img/";
            evt.layer.bindPopup(evt.properties.time + '<br />' +
                evt.properties.details + '<br />' + evt.properties.address);
            if (evt.properties.category === "Medical") {
                evt.layer.options.icon = new L.Icon(base + "m-marker.png");
            } else if (evt.properties.category === "Fire") {
                evt.layer.options.icon = new L.Icon(base + "f-marker.png");
            } else if (evt.properties.category === "Hazard") {
                evt.layer.options.icon = new L.Icon(base + "h-marker.png");
            } else if (evt.properties.category === "Public Assist") {
                evt.layer.options.icon = new L.Icon(base + "pa-marker.png");
            } else if (evt.properties.category === "Law Enforcement") {
                evt.layer.options.icon = new L.Icon(base + "le-marker.png");
            } else {
                evt.layer.options.icon = new L.Icon(base + "o-marker.png");
            }
        },

        baselayer = function () {
            // Adds a base layer to the map
            var url, cloudmade;
            url = 'http://{s}.tile.cloudmade.com/8b8b9ae9d2b140d2bf5c19a6f086f2de/1/256/{z}/{x}/{y}.png';
            cloudmade = new L.TileLayer(url, {maxZoom: 18});
            map.addLayer(cloudmade);
        },

        incidents = function () {
            // Loads the GeoJSON data and adds to the map
            var geojson,
                incidentList;
            incidentList = document.getElementById("incdnts");
            microAjax("/feed/geojson", function (res) {
                geojson = new L.GeoJSON();
                geojson.on('featureparse', function (evt) {
                    incidentList.appendChild(incidentListItem(evt));
                    incidentMap(evt);
                });
                geojson.addGeoJSON(JSON.parse(res));
                map.addLayer(geojson);
            });
        };

    // Load the layers
    baselayer();
    incidents();
});

/*function raphaelCharts() {
  "use strict";
  var fire = [{% for incident in incidents %}{{ incident.fire }}{% if not forloop.last%},{% endif %}{% endfor %}], 
  med = [{% for incident in incidents %}{{ incident.med }}{% if not forloop.last%},{% endif %}{% endfor %}],
  haz = [{% for incident in incidents %}{{ incident.haz }}{% if not forloop.last%},{% endif %}{% endfor %}],
  pa = [{% for incident in incidents %}{{ incident.pa }}{% if not forloop.last%},{% endif %}{% endfor %}];

  var rp = Raphael("pie");
  rp.g.txtattr.font = "13px 'Fontin Sans', Fontin-Sans, sans-serif";
  rp.g.text(320, 70, "CALFIRE Incident Distribution").attr({"font-size": 20});
  rp.g.piechart(400, 200, 100, [
  eval(fire.join('+')),
  eval(med.join('+')),
  eval(haz.join('+')),
  eval(pa.join('+'))
  ], { legend: ["%%.%% - Fire", '%%.%% - Med', '%%.%% - Haz', '%%.%% - Public Assist'], legendpos: "west"});

  var rl = Raphael("line");
  var x = [];
  for (var j = 0; j < {{ days }}; j++) {
  x[j] = j;
  }

  rl.g.linechart(0, 0, 1000, 300, x, [fire, med, haz, pa], {smooth: true});
  }
*/
