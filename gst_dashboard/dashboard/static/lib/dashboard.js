(function () {

    var DT = function (epoch) {
        this.date = new Date(epoch);
    };

    DT.prototype.getHours = function () {
        var hours = this.date.getHours();
        return hours < 10 ? "0" + hours : hours;
    };

    DT.prototype.getMinutes = function () {
        var minutes = this.date.getMinutes();
        return minutes < 10 ? "0" + minutes : minutes;
    };

    DT.prototype.getTime = function () {
        return this.getHours() + ":" + this.getMinutes();
    };

    DT.prototype.getDate = function () {
        var month = this.date.getMonth() + 1,
            date = this.date.getDate(),
            year = this.date.getFullYear() % 100;
        return month + "/" + date + "/" + year;
    };

//---------------------------------------------------------------------------//

    var Incident = function (geojson) {
        this.datetime = new DT(geojson.properties.time);
        this.details = geojson.properties.details;
        this.jrsdtn = geojson.properties.jrsdtn;
        this.address = geojson.properties.address;
        this.category = geojson.properties.category;
        this.incidentId = geojson.properties.incident_id;
        this.eventId = geojson.properties.event_id;
        this.lnglat = geojson.geometry.coordinates;
        this._categorySafe = this.category.toLowerCase().split(" ").join("-");
    };

//---------------------------------------------------------------------------//

    // TODO: This really needs to use templating instead of dynamically generating html each time
    var Modal = function (inc) {
        var html = "";

        html += "<tr><td>Location</td>";
        html += "<td>" + inc.address + "</td></tr>";

        html += "<tr><td>Longitude</td>";
        html += "<td>" + inc.lnglat[0] + "</td></tr>";

        html += "<tr><td>Latitude</td>";
        html += "<td>" + inc.lnglat[1] + "</td></tr>";

        html += "<tr><td>Jurisdiction</td>";
        html += "<td>" + inc.jrsdtn + "</td></tr>";

        html += "<tr><td>Category</td>";
        html += "<td>" + inc.category + "</td></tr>";

        html += "<tr><td>Details</td>";
        html += "<td>" + inc.details + "</td></tr>";

        html += "<tr><td>Event Id</td>";
        html += "<td>" + inc.eventId + "</td></tr>";

        html += "<tr><td>Incident Id</td>";
        html += "<td>" + inc.incidentId + "</td></tr>";

        html += "<tr><td>Time</td>";
        html += "<td>" + inc.datetime.getTime() + "</td></tr>";

        html += "<tr><td>Date</td>";
        html += "<td>" + inc.datetime.getDate() + "</td></tr>";

        $("#inc-modal-title").text(inc.incidentId);
        $("#inc-modal-body").html(html);
    };

    Modal.prototype.show = function () {
        $("#inc-modal").modal();
    };

//---------------------------------------------------------------------------//

    var Map = function () {
        var that = this;

        this.markers = [];
        this.map = L.map('map', {
            'center': [35.37, -120.6],
            'zoom': 10,
            'attributionControl': false
        });

        this.addControls();
        this.addLayers();

        $("#map-expand").toggle(function () {
            that.expand();
        }, function () {
            that.shrink();
        });
    };

    Map.prototype.addControls = function () {
        this.control = L.control.layers().addTo(this.map);
    };

    Map.prototype.addLayers = function () {
        // other layers to consider
        // http://wiki.openstreetmap.org/wiki/TopOSM
        // http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
        // http://developer.mapquest.com/web/products/open/map give credit/attribution to mapquest
        // http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers

        var that = this;

        var mbStreetsUrl = "http://api.tiles.mapbox.com/v3/frewsxcv.map-aag75ha5.jsonp";
        var mbTerrainUrl = "http://api.tiles.mapbox.com/v3/frewsxcv.map-evj4te62.jsonp";

        var mqSat = L.tileLayer('http://gis.slocounty.ca.gov/arcgis/rest/services/Aerials/2011_1_FT_AERIAL/MapServer/tile/{z}/{y}/{x}');
        var mqOsm = L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg');

        // Add 'Satellite' layer
        wax.tilejson(mbStreetsUrl, function (tilejson) {
            var mbStreets = new wax.leaf.connector(tilejson),
                aerial = L.layerGroup([mqSat, mbStreets]);
            that.control.addBaseLayer(aerial, "Satellite");
        });

        // Add 'Terrain' layer
        wax.tilejson(mbTerrainUrl, function (tilejson) {
            var mbTerrain = new wax.leaf.connector(tilejson);
            that.control.addBaseLayer(mbTerrain, "Terrain");

            // Make this the default layer
            that.map.addLayer(mbTerrain);
        });

        // Add 'Streets' layer
        this.control.addBaseLayer(mqOsm, "Streets");

        // Add incidents
        this.incsLayer = L.layerGroup().addTo(this.map);
        this.control.addOverlay(this.incsLayer, "Incidents");
    };

    Map.prototype.setList = function (list) {
        var that = this;

        this.list = list;
        this.list.loadIncidents(0, function () {
            that.list.updateView();
        });

    };

    Map.prototype.expand = function () {
        $("#map-span").removeClass("span5").addClass("span12");
        $("#incident-span").detach().appendTo("#second-row");
        $("#map-expand > span").text("Shrink");
        this.map.invalidateSize(true);
    };

    Map.prototype.shrink = function () {
        $("#map-span").removeClass("span12").addClass("span5");
        $("#incident-span").detach().prependTo("#first-row");
        $("#map-expand > span").text("Expand");
        this.map.invalidateSize(true);
    };

    Map.prototype.openInc = function (eventId) {
        if (this.activeIncs.hasOwnProperty(eventId)) {
            this.map.panTo(this.activeIncs[eventId].getLatLng());
            this.activeIncs[eventId].openPopup();
        } else {
            console.log(eventId + " not found in map.activeIncs");
        }
    };

    Map.prototype.addIncs = function (incs) {
        var that = this;

        this.activeIncs = {};
        incs.forEach(function (inc) {
            var latLng = L.latLng(inc.lnglat[1], inc.lnglat[0]),
                marker,
                iconPath = "/static/img/markers/marker-default.png";

            switch (inc.category) {
            case "Medical":
                iconPath = "/static/img/markers/marker-info.png";
                break;
            case "Hazard":
                iconPath = "/static/img/markers/marker-warning.png";
                break;
            case "Public Assist":
                iconPath = "/static/img/markers/marker-success.png";
                break;
            case "Fire":
                iconPath = "/static/img/markers/marker-important.png";
                break;
            case "Law Enforcement":
                iconPath = "/static/img/markers/marker-inverse.png";
                break;
            }

            marker = L.marker(latLng, {
                "icon": L.icon({
                    "iconUrl": iconPath,
                    "iconSize": [25, 41],
                    "iconAnchor": [12, 41],
                    "popupAnchor": [1, -34],
                    "shadowSize": [41, 41],
                    "shadowUrl": "/static/img/markers/marker-shadow.png"
                })
            });

            marker.bindPopup([inc.address, inc.details].join("<br>"));
            that.incsLayer.addLayer(marker);
            that.activeIncs[inc.eventId] = marker;
        });
    };

    Map.prototype.clearIncs = function () {
        this.incsLayer.clearLayers();
        delete this.activeIncs;
    };

//---------------------------------------------------------------------------//

    var List = function () {
        var that = this;

        this.page = 0;
        this.numPages = 0;
        this.incidents = [];
        this.enableUpdates();

        $("#prev-button").click(function () {
            that.prevPage();
        });

        $("#next-button").click(function () {
            that.nextPage();
        });
    };

    List.prototype.setMap = function (map) {
        this.map = map;
    };

    List.prototype.updateView = function () {
        var that = this,
            $incList = $("#incident-list").empty();

        $("#cur-page").text(this.page + 1);

        if (this.page === 0) {
            $("#prev-button").addClass("disabled");
        } else {
            $("#prev-button").removeClass("disabled");
        }

        if (this.page === this.numPages - 1) {
            $("#next-button").addClass("disabled");
        } else {
            $("#next-button").removeClass("disabled");
        }

        this.incidents.forEach(function (inc) {
            var $row = $("<tr>"), $type, $info;
            $row.append("<td>" + inc.datetime.getDate() + "</td>");
            $row.append("<td>" + inc.datetime.getTime() + "</td>");
            $type = $("<span class='label'>" + inc.details + "</span>");
            switch (inc.category) {
            case "Medical":
                $type.addClass("label-info");
                break;
            case "Hazard":
                $type.addClass("label-warning");
                break;
            case "Public Assist":
                $type.addClass("label-success");
                break;
            case "Fire":
                $type.addClass("label-important");
                break;
            case "Law Enforcement":
                $type.addClass("label-inverse");
                break;
            }
            $row.append($type);
            $type.wrap("<td>");
            $row.append("<td>" + inc.incidentId + "</td>");
            $row.append("<td>" + inc.jrsdtn + "</td>");

            $info = $("<td><i class='more-info icon-info-sign'></i></td>");
            $info.click(function () {
                var modal = new Modal(inc);
                modal.show();
            });
            $row.append($info);

            $row.click(function () {
                that.map.openInc(inc.eventId);
            });
            $incList.append($row);
        });
        this.map.clearIncs();
        this.map.addIncs(this.incidents);
    };

    // Check for new incidents, updating the dashboard
    List.prototype.update = function () {
        var that = this;
        $.getJSON("/incidents/json?offset=" + this.page * 10, function (geojson) {
            if (geojson.features[0].properties.event_id !== that.incidents[0].eventId) {
                that.numPages = Math.ceil(geojson.metadata.count / 10);
                $("#last-page").text(that.numPages);
                that.incidents = geojson.features.map(function (inc) {
                    return new Incident(inc);
                });
                that.updateView();
            }
        });
    };

    List.prototype.enableUpdates = function () {
        var that = this;
        this.updateId = window.setInterval(function () {
            that.update();
        }, 120000);
    };

    List.prototype.disableUpdates = function () {
        window.clearInterval(this.updateId);
    };

    List.prototype.loadIncidents = function (offset, callback) {
        var that = this;
        $.getJSON("/incidents/json?offset=" + offset, function (geojson) {
            that.numPages = Math.ceil(geojson.metadata.count / 10);
            that.incidents = [];
            $("#last-page").text(that.numPages);
            geojson.features.forEach(function (inc) {
                that.incidents.push(new Incident(inc));
            });
            callback();
        });
    };

    List.prototype.nextPage = function () {
        var that = this;
        if (this.page / 10 < this.numPages) {
            this.page += 1;
            $("#next-button").addClass("disabled");
            this.loadIncidents(this.page * 10, function () {
                if ($("#prev-button").hasClass("disabled")) {
                    $("#prev-button").removeClass("disabled");
                }
                that.updateView();
            });
        }
    };

    List.prototype.prevPage = function () {
        var that = this;
        if (this.page / 10 > 0) {
            this.page -= 1;
            $("#prev-button").addClass("disabled");
            this.loadIncidents(this.page * 10, function () {
                if ($("#next-button").hasClass("disabled")) {
                    $("#next-button").removeClass("disabled");
                }
                that.updateView();
            });
        }
    };

//---------------------------------------------------------------------------//

    $(function () {
        var list = new List();
        var map = new Map();

        list.setMap(map);
        map.setList(list);
    });
}());
