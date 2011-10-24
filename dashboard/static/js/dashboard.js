function leafletMap() {
    "use strict";

    var incdnts = document.getElementById('incdnts');
    var map = new L.Map('map', {
        center: new L.LatLng(35.2819, -120.6617), 
        zoom: 13
    });
    microAjax("/feed/geojson", function(res) {
        var geojson = new L.GeoJSON();
        geojson.on('featureparse', function(e) {
            var incdnt = document.createElement("div");
            incdnt.className = 'incdnt';
            incdnt.innerHTML = e.properties.time + '<br />' + e.properties.details + '<br />' + e.properties.address;
            incdnts.appendChild(incdnt);
            console.log(e);
        });
        geojson.addGeoJSON(JSON.parse(res));
        map.addLayer(geojson);
    });
    var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/8b8b9ae9d2b140d2bf5c19a6f086f2de/997/256/{z}/{x}/{y}.png', 
    cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18});
    map.addLayer(cloudmade);
}

/*function raphaelCharts() {
  "use strict";
  var fire = [{% for incident in incidents %}{{ incident.fire }}{% if not forloop.last%},{% endif %}{% endfor %}], 
  med = [{% for incident in incidents %}{{ incident.med }}{% if not forloop.last%},{% endif %}{% endfor %}],
  haz = [{% for incident in incidents %}{{ incident.haz }}{% if not forloop.last%},{% endif %}{% endfor %}],
  pa = [{% for incident in incidents %}{{ incident.pa }}{% if not forloop.last%},{% endif %}{% endfor %}];

  var rp = Raphael("pie");
  rp.g.txtattr.font = "12px 'Fontin Sans', Fontin-Sans, sans-serif";
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
  }*/
window.onload = function () {
    "use strict";
    //raphaelCharts();
    leafletMap();
}
