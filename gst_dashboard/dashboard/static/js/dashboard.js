var dashboard = (function () {

    var incidents = [];
    var geojson = new L.GeoJSON();
    var firstIncdnt;

    var incidentListItem = function (evt) {
        // Loads a single incident to the list
        var props = evt.properties;
        var div = document.createElement("div");
        if (props.category === "Medical") {
            div.className = 'incdnt med';
        } else if (props.category === "Fire") {
            div.className = 'incdnt fire';
        } else if (props.category === "Hazard") {
            div.className = 'incdnt hazard';
        } else if (props.category === "Public Assist") {
            div.className = 'incdnt pubassist';
        } else if (props.category === "Law Enforcement") {
            div.className = 'incdnt lawenf';
        } else {
            div.className = 'incdnt';
        }
        div.innerHTML = [props.time, props.incident_id, props.jrsdtn, props.details].join('<br />');
        div.onclick = function () {
            map.panTo(evt.layer.getLatLng());
            evt.layer.openPopup();
        };
        return div;
    };

    var initPopup = function (i) {
        var fields = [i.properties.time, i.properties.details, i.properties.address, i.properties.jrsdtn];
        i.layer.bindPopup(fields.join('<br>'));
    };

    var setIcon = function (evt) {
        var base = "/static/img/";
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
    };

    var incidentMap = function (evt) {
        // Loads a single incident to the map
        initPopup(evt);
        setIcon(evt);
    };

    var addBaselayer = function () {
        // Adds a base layer to the map
        var url, baselayer, aerials;
        url = 'http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png';
        baselayer = new L.TileLayer(url, {maxZoom: 18});

        url = 'http://mapproxy.slocountyfire.org/service';
        aerials = new L.TileLayer.WMS(url, {
            layers: 'slocounty-12in',
            format: 'image/png',
            transparent: true
        }),
        roads = new L.TileLayer.WMS(url, {
            layers: 'slocounty-roads',
            format: 'image/png',
            transparent: true
        });

        var baseMaps = {
            "Road map": baselayer
        }

        var overlayMaps = {
            "Aerials": aerials,
            "Roads (beta)": roads
        }

        var layersControl = new L.Control.Layers(baseMaps, overlayMaps);

        map.addLayer(baselayer);
        map.addControl(layersControl);
    };

    var addIncidentsLayer = function () {
        // Loads the GeoJSON data and adds to the map
        var incidentList = document.getElementById("incdnts");
        microAjax("/feed/geojson", function (res) {   
            geojson.on('featureparse', function (evt) {
		incidentList.insertBefore(incidentListItem(evt), firstIncdnt);
                incidentMap(evt);
		incidents.push(evt.properties.event_id);
            });
	    firstIncdnt = incidentList.firstChild;
            geojson.addData(JSON.parse(res));
            map.addLayer(geojson);
        });
    };

    var updateIncidentsLayer = function () {
        var incidentList = document.getElementById("incdnts");
        microAjax("/feed/geojson", function (res) {
            var i, jsonRes = JSON.parse(res), newFeatures = [];
            for (i = 0; i < jsonRes.features.length; i++) {
                if (incidents.indexOf(jsonRes.features[i].properties.event_id) < 0) {
                    newFeatures.push(jsonRes.features[i]);
                    incidents.push(jsonRes.features[i].properties.event_id);
                }
            }
            if (newFeatures.length > 0) {
            jsonRes.features = newFeatures;
            firstIncdnt = incidentList.firstChild;
            geojson.addData(jsonRes);
            }
        });
    };

    var map = new L.Map('map', {
        center: new L.LatLng(35.2819, -120.6617),
        zoom: 11
    });

    var fullscreen = function () {

        $("#fullscreen").toggle(function () {
            center = map.getCenter();
            $("#wrapper").css("max-width", "100%");
            $("#main-panel").attr('id', 'main-panel-full');
            map.invalidateSize();
            map.panTo(center);
            $("#fullscreen").html("Dashboard mode");
        }, function() {
            center = map.getCenter();
            $("#wrapper").css("max-width", "1000px");
            $("#main-panel-full").attr('id', 'main-panel');
            map.invalidateSize();
            map.panTo(center);
            $("#fullscreen").html("Fullscreen mode");
        });
    }
    
    var center;

    return {
        init: function () {
            // Load map layers
            addBaselayer();
            addIncidentsLayer();

            // Init fullscreen
            fullscreen();

            window.setInterval(updateIncidentsLayer, 120000);
        }
    };

}());
