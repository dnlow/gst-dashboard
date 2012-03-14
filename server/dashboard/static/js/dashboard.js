var dashboard = (function () {

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
    };

    var initPopup = function (i) {
        var fields = [i.properties.time, i.properties.details, i.properties.address, i.properties.jrsdtn];
        i.layer.bindPopup(fields.join('<br>'));
    };

    var setIcon = function (evt) {
        var base = "http://incidents.slocountyfire.org/static/img/";
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

    var baselayer = function () {
        // Adds a base layer to the map
        var url, cloudmade, aerials;
        url = 'http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png';
        cloudmade = new L.TileLayer(url, {maxZoom: 18});

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
            "Road map": cloudmade
        }

        var overlayMaps = {
            "Aerials": aerials,
            "Roads (beta)": roads
        }

        var layersControl = new L.Control.Layers(baseMaps, overlayMaps);

        map.addLayer(cloudmade);
        map.addControl(layersControl);
    };

    var incidents = function () {
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
    };

    var map = new L.Map('map', {
        center: new L.LatLng(35.2819, -120.6617),
        zoom: 11
    });

    var fullscreen = function () {

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
            $("#fullscreen").html("Dashboard mode");
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
            $("#fullscreen").html("Fullscreen mode");
        });
    }
    
    var center;

    return {
        init: function () {
            // Load map layers
            baselayer();
            incidents();

            // Init fullscreen
            fullscreen();
        }
    };

}());
