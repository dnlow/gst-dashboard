// TODO: phase out jquery 'document ready'

var dashboard = (function () {
    // Incident list functions ////////////////////////////////////////////////////

    var incidentListItem = function (evt) {
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
            div.innerHTML = evt.properties.time + '<br />' + evt.properties.incident_id + '<br />' +
                evt.properties.jrsdtn + '<br />' + evt.properties.details;
            div.onclick = function () {
                map.panTo(evt.layer.getLatLng());
                evt.layer.openPopup();
            };
            return div;
        },

    // Incident map functions /////////////////////////////////////////////////////

        initPopup = function (i) {
            var fields = [i.properties.time, i.properties.details, i.properties.address, i.properties.jrsdtn];
            i.layer.bindPopup(fields.join('<br>'));
        },

        setIcon = function (evt) {
            var base = "http://cfslo.no-ip.org:8000/incident/static/img/";
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

        incidentMap = function (evt) {
            // Loads a single incident to the map
            initPopup(evt);
            setIcon(evt);
        },

    ///////////////////////////////////////////////////////////////////////////////

        baselayer = function () {
            // Adds a base layer to the map
            var url, cloudmade, aerials;
            url = 'http://{s}.tile.cloudmade.com/8b8b9ae9d2b140d2bf5c19a6f086f2de/1/256/{z}/{x}/{y}.png';
            cloudmade = new L.TileLayer(url, {maxZoom: 18});

            url = 'http://cfslo.no-ip.org:9000/service';
            aerials = new L.TileLayer.WMS(url, {
                layers: 'slocounty-12in',
                format: 'image/png',
                transparent: true
            });

            var baseMaps = {
                "Road map": cloudmade
            }

            var overlayMaps = {
                "Aerials": aerials
            }

            var layersControl = new L.Control.Layers(baseMaps, overlayMaps);

            map.addLayer(cloudmade);
            map.addControl(layersControl);
        },

        incidents = function () {
            // Loads the GeoJSON data and adds to the map
            var geojson,
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
        },

        map = new L.Map('map', {
            center: new L.LatLng(35.2819, -120.6617),
            zoom: 11
        }),
        
        center;

    return {
        init: function () {
            // Load map layers
            baselayer();
            incidents();

            $("#fullscreen").toggle(function () {
                center = map.getCenter();
                $("#wrapper").css("max-width", "100%");
                $("#main-panel").css("position", "absolute");
                $("#main-panel").css("border-top-width", "0");
                $("#main-panel").css("border-bottom-width", "0");
                $("#main-panel").css("border-left-width", "0");
                $("#main-panel").css("border-right-width", "0");
                $("#main-panel").css("margin-top", "0");
                $("#main-panel").css("height", "100%");
                map.invalidateSize();
                map.panTo(center);
            }, function() {
                center = map.getCenter();
                $("#wrapper").css("max-width", "1000px");
                $("#main-panel").css("position", "static");
                $("#main-panel").css("border-top-width", "5px");
                $("#main-panel").css("border-bottom-width", "5px");
                $("#main-panel").css("border-left-width", "5px");
                $("#main-panel").css("border-right-width", "5px");
                $("#main-panel").css("margin-top", "50px");
                $("#main-panel").css("height", "450px");
                map.invalidateSize();
                map.panTo(center);
            });
        }
    };

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
