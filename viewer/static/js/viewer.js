var map, store, gridWindow;
var mercator = new OpenLayers.Projection('EPSG:900913');
var epsg4326 = new OpenLayers.Projection('EPSG:4326');

Ext.onReady(function() {
   var mapPanel, gridPanel, mainPanel;

   // styles
   var style = new OpenLayers.Style({
      pointRadius: 10, 
      graphicYOffset: -10,
   }, {
      rules: [
         new OpenLayers.Rule({
            filter: new OpenLayers.Filter.Comparison({
               type: OpenLayers.Filter.Comparison.EQUAL_TO,
               property: "category",
               value: "Fire",
            }),
            symbolizer: {
               externalGraphic: "/incident/static/img/new_iconFire.png",
            }
         }),
         new OpenLayers.Rule({
            filter: new OpenLayers.Filter.Comparison({
               type: OpenLayers.Filter.Comparison.EQUAL_TO,
               property: "category",
               value: "Medical",
            }),
            symbolizer: {
               externalGraphic: "/incident/static/img/new_iconMedical.png",
            }
         }),
         new OpenLayers.Rule({
            filter: new OpenLayers.Filter.Comparison({
               type: OpenLayers.Filter.Comparison.EQUAL_TO,
               property: "category",
               value: "Hazard",
            }),
            symbolizer: {
               externalGraphic: "/incident/static/img/new_iconHazard.png",
            }
         }),
         new OpenLayers.Rule({
            filter: new OpenLayers.Filter.Comparison({
               type: OpenLayers.Filter.Comparison.EQUAL_TO,
               property: "category",
               value: "Public Assist",
            }),
            symbolizer: {
               externalGraphic: "/incident/static/img/new_iconPublicAssist.png",
            }
         }),
         new OpenLayers.Rule({
            filter: new OpenLayers.Filter.Comparison({
               type: OpenLayers.Filter.Comparison.EQUAL_TO,
               property: "category",
               value: "Law Enforcement",
            }),
            symbolizer: {
               externalGraphic: "/incident/static/img/new_iconLawEnforcement.png",
            }
         }),
      ]
   });

   var selectedStyle = new OpenLayers.Style({
      //pointRadius: 14,
      //graphicYOffset: -13,
   });

   map = new OpenLayers.Map({
      projection: mercator,
      panMethod: null,
      controls: [
         new OpenLayers.Control.Navigation(),   
         new OpenLayers.Control.PanZoom(),   
         new OpenLayers.Control.ScaleLine(),   
         new OpenLayers.Control.LayerSwitcher(),
      ]
   });

   // layers
   var gterrain = new OpenLayers.Layer.Google("Terrain", {
       type: google.maps.MapTypeId.TERRAIN,
   });
   var cloudmade = new OpenLayers.Layer.CloudMade("Street map", {
       key: '8b8b9ae9d2b140d2bf5c19a6f086f2de',
       styleId: 997,
   });
   var ghybrid = new OpenLayers.Layer.Google("Satellite", {
       type: google.maps.MapTypeId.HYBRID,
   });
   var vecLayer = new OpenLayers.Layer.Vector("Incidents", {
      styleMap: new OpenLayers.StyleMap({
         "default": style, 
         "select": selectedStyle, 
      }),
      "displayInLayerSwitcher": false,
   });

   /*
   cloudmade.setVisibility(false);
   ghybrid.setVisibility(false);
   */
   map.addLayers([gterrain, cloudmade, ghybrid, vecLayer]);

   var mapPanel = new GeoExt.MapPanel({
       region: "center",
       map: map,
       center: new OpenLayers.LonLat(-120.4, 35.307).transform(epsg4326, mercator),
       zoom: 10,
   });

   store = new GeoExt.data.FeatureStore({
       layer: vecLayer,
       fields: [
           {
              name: 'category', 
              type: 'string',
           }, {
              name: 'name', 
              type: 'string',
           }, {
              name: 'details', 
              type: 'string',
           }, {
              name: 'time', 
              type: 'date', 
              dateFormat: 'Y-m-d H:i:s'
           }, {
              name: 'address', 
              type: 'string', 
           }, {
              name: 'jrsdtn', 
              type: 'string', 
           },
       ],
       proxy: new GeoExt.data.ProtocolProxy({
           protocol: new OpenLayers.Protocol.HTTP({
               url: "/incident/json/100/",
               format: new OpenLayers.Format.GeoJSON({
                  internalProjection: mercator,
                  externalProjection: epsg4326,
               }),
           })
       }),
       autoLoad: true,
   });

   // create grid panel configured with feature store
   var gridPanel = new Ext.grid.GridPanel({
       store: store,
       columns: [{
           header: "Time",
           width: 80,
           dataIndex: "time",
           sortable: true,
           renderer: Ext.util.Format.dateRenderer('m/d - H:i'),
       }, {
           header: "Type",
           width: 130,
           dataIndex: "details",
           sortable: true,
           hidden: true,
       }, {
           header: "Name",
           width: 100,
           dataIndex: "name",
           sortable: true,
       }, {
           header: "Category",
           width: 90,
           dataIndex: "category",
           sortable: true,
           renderer: function(value, metaData, record, rowIndex, colIndex, store) {
               return '<img src="/incident/static/img/icon' + value.replace(' ','') + '.png" alt="" /> ' + value
           },
       }, {
           header: "Address",
           width: 130,
           dataIndex: "address",
           sortable: true,
           hidden: true,
       }, {
           header: "Jurisdiction",
           width: 80,
           dataIndex: "address",
           sortable: true,
           hidden: true,
       }],
       sm: new GeoExt.grid.FeatureSelectionModel(),
       stripeRows: true,
       columnLines: true,
       listeners: {
          'rowdblclick': centerPopup,
       },
   });

   viewport = new Ext.Viewport({
       renderTo: "mainpanel",
       layout: "border",
       items: [{
          region:'center',
          items: mapPanel,
       }]
   });

   var gridWindow = new Ext.Window({
      title: "Latest 100 Incidents",
      height: viewport.getHeight()-30, 
      width: 323,
      closable: false,
      collapsible: true,
      layout: "fit",
      items: gridPanel,
   }).show();
   gridWindow.setPosition(viewport.getWidth()-338,15);
});

/* centerPopup()
   centers the map and adds a popup */
function centerPopup(grid, index, e) {
    var data = store.getAt(index).data;
    var latlng = new OpenLayers.LonLat(data.feature.geometry.x, data.feature.geometry.y);
    var html = '';
    var popup;

    centerMap(latlng);
    //latlng.transform(mercator, epsg4326);

    if (data.name)
        html += 'Name: ' + data.name + '<br />';
    if (data.jrsdtn)
        html += 'Date/Time: ' + data.time + '<br />';
    if (data.address)
        html += 'Address: ' + data.address + '<br />';
    if (data.jrsdtn)
        html += 'Jurisdiction: ' + data.jrsdtn + '<br />';
    if (data.details)
        html += 'Details: ' + data.details + '<br />';
    html += 'Lat/Lng: ' + latlng;

    popup = new OpenLayers.Popup("popup", latlng, new OpenLayers.Size(300,100), html, true);
    map.addPopup(popup);
}

/* centerMap()
   centers map, taking into account grid */
function centerMap(latlng) {
    map.setCenter(latlng);
    map.pan(viewport.getWidth()/4,viewport.getHeight()/8);
}
