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
    var IncModal = function (inc) {
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

    IncModal.prototype.show = function () {
        $("#inc-modal").modal({
            "backdrop": false,
            "keyboard": false,
        });
    };


    var FilterModal = function (list) {
        this.list = list;

        $("#incident-id").val("");
        $("filter-datepicker").val("");
        $("#filter-categories input:checkbox:not(:checked)").each(function () {
            $(this).prop('checked', true);
        });
    };

    FilterModal.prototype.show = function () {
        var that = this;
        $("#filter-modal").modal({
            "backdrop": false,
            "keyboard": false,
        });
        $("#filter-datepicker").datepicker();
        $("#filter-save-btn").click(function () {
            that.list.loadIncidents(0, function () {
                that.list.updateView();
            });
        });
    };

    FilterModal.prototype.urlParams = function () {
        var ret = "";

        var incidentid = $("#incident-id").val();
        if (incidentid.length > 0) {
            ret += "&incidentid=" + window.encodeURIComponent(incidentid);
        }

        var $categories = $("#filter-categories input:checkbox:not(:checked)");
        if ($categories.length > 0) {
            var categories = [];
            $categories.each(function () {
                categories.push($(this).data("category"));
            });$
            ret += "&categories=" + window.encodeURIComponent(categories.join(","));
        }

        var date = $("#filter-datepicker").val();
        if (date.length > 0) {
            ret += "&date=" + window.encodeURIComponent(date);
        }

        return ret;
    };

//---------------------------------------------------------------------------//

    var Map = function () {
        var that = this;

        this.markers = [];
        this.map = L.map('map', {
            'center': [35.37, -120.6],
            'zoom': 10,
            'attributionControl': false,
            'maxZoom': 18,
        });

        this.addControls();
        this.addLayers();
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

        var mbOutdoor = "slugis.map-ioviud0r";
        var mbSat = "slugis.da0a550c";
        var mbOsmbright2 = "slugis.bbd863d8";

        // Add 'Satellite' layer
        var satellite = L.mapbox.tileLayer(mbSat).addTo(this.map);
        that.control.addBaseLayer(satellite, "Satellite");

        // Add 'Terrain' layer
        var outdoor = L.mapbox.tileLayer(mbOutdoor).addTo(this.map);
        that.control.addBaseLayer(outdoor, "Terrain");

        // Add 'Streets' layer
        var street = L.mapbox.tileLayer(mbOsmbright2).addTo(this.map);
        this.control.addBaseLayer(mbOsmbright2, "Streets");

        // Add incidents
        this.incsLayer = L.layerGroup().addTo(this.map);
        this.control.addOverlay(this.incsLayer, "Incidents");
    };

    Map.prototype.setList = function (list) {
        var that = this;

        this.list = list;
        list.loadIncidents(0, function () {
            list.updateView();
        });

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
                iconPath = "/static/img/markers/marker-medical.png";
                break;
            case "Hazard":
                iconPath = "/static/img/markers/marker-hazard.png";
                break;
            case "Public Assist":
                iconPath = "/static/img/markers/marker-publicassist.png";
                break;
            case "Fire":
                iconPath = "/static/img/markers/marker-fire.png";
                break;
            //case "Law Enforcement":
            //    iconPath = "/static/img/markers/marker-lawenforcement.png";
            //    break;
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

        this.filterModal = new FilterModal(this);

        $("#filter-button").click(function () {
            that.filterModal.show();
        });

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
                $type.addClass("label-medical");
                break;
            case "Hazard":
                $type.addClass("label-hazard");
                break;
            case "Public Assist":
                $type.addClass("label-publicassist");
                break;
            case "Fire":
                $type.addClass("label-fire");
                break;
            //case "Law Enforcement":
            //    $type.addClass("label-lawenforcement");
            //    break;
            }
            $row.append($type);
            $type.wrap("<td>");
            $row.append("<td>" + inc.incidentId + "</td>");
            $row.append("<td>" + inc.jrsdtn + "</td>");

            $info = $("<td class='text-right'><button class='more-info btn btn-default btn-xs'><span class='glyphicon glyphicon-info-sign'></span></button></td>");
            $info.click(function () {
                var modal = new IncModal(inc);
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
        var url = this._getUrl();
        $.getJSON(url, function (geojson) {
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
        window.setInterval(function () { that.update(); }, 120000);
    };

    List.prototype._getUrl = function (offset) {
        offset = offset || 0;
        return "/incidents/json?offset=" + offset + this.filterModal.urlParams();
    };

    List.prototype.loadIncidents = function (offset, callback) {
        offset = offset || 0;
        var that = this;
        var url = this._getUrl(offset);
        $.getJSON(url, function (geojson) {
            that.numPages = Math.ceil(geojson.metadata.count / 10);
            that.incidents = [];
            $("#last-page").text(that.numPages);
            geojson.features.forEach(function (inc) {
                that.incidents.push(new Incident(inc));
            });
            if (callback) {
                callback();
            }
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
