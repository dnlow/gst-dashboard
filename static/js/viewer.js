var centerPoint = function() {
   alert('in the future this will center map on point');      
}

Ext.onReady(function() {
   var mapPanel, store, gridPanel, mainPanel;

   var mercator = new OpenLayers.Projection('EPSG:900913');
   var epsg4326 = new OpenLayers.Projection('EPSG:4326');

   var style = new OpenLayers.Style({
      pointRadius: 5, // sized according to type attribute
      fillColor: "#ffcc66",
      strokeColor: "#ff9933",
      strokeWidth: 2,
   }, {
      rules: [
         new OpenLayers.Rule({
            filter: new OpenLayers.Filter.Comparison({
               type: OpenLayers.Filter.Comparison.EQUAL_TO,
               property: "category",
               value: "Fire",
            }),
            symbolizer: {
               fillColor: "#ff9073",
               strokeColor: "#ff3500",
            }
         }),
         new OpenLayers.Rule({
            filter: new OpenLayers.Filter.Comparison({
               type: OpenLayers.Filter.Comparison.EQUAL_TO,
               property: "category",
               value: "Medical",
            }),
            symbolizer: {
               fillColor: "#7279d8",
               strokeColor: "#1924b1",
            }
         }),
         new OpenLayers.Rule({
            filter: new OpenLayers.Filter.Comparison({
               type: OpenLayers.Filter.Comparison.EQUAL_TO,
               property: "category",
               value: "Hazard",
            }),
            symbolizer: {
               fillColor: "#ffbc73",
               strokeColor: "#ff8500",
            }
         }),
         new OpenLayers.Rule({
            filter: new OpenLayers.Filter.Comparison({
               type: OpenLayers.Filter.Comparison.EQUAL_TO,
               property: "category",
               value: "Public Assist",
            }),
            symbolizer: {
               fillColor: "#c062d3",
               strokeColor: "#6e227e",
            }
         }),
      ]
   });

   var selectedStyle = new OpenLayers.Style({
      pointRadius: 9, // sized according to type attribute
      fillOpacity: 0.8,
      strokeColor: "#000",
      strokeWidth: 3,
   });

   // create map instance
   var map = new OpenLayers.Map({
      projection: mercator,
      controls: [
         new OpenLayers.Control.Navigation(),   
         new OpenLayers.Control.PanZoom(),   
         new OpenLayers.Control.ScaleLine(),   
      ]
   });

   var cloudmade = new OpenLayers.Layer.CloudMade("CloudMade", {
       key: '8b8b9ae9d2b140d2bf5c19a6f086f2de',
       styleId: 36256,
   });

   // create vector layer
   var vecLayer = new OpenLayers.Layer.Vector("vector", {
      styleMap: new OpenLayers.StyleMap({
         "default": style, 
         "select": selectedStyle, 
      })
   });
   map.addLayers([cloudmade, vecLayer]);

   // create map panel
   var mapPanel = new GeoExt.MapPanel({
       region: "center",
       map: map,
       center: new OpenLayers.LonLat(-120.651, 35.347).transform(epsg4326, mercator),
       zoom: 10,
   });

   // create feature store, binding it to the vector layer
   var store = new GeoExt.data.FeatureStore({
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
           },
       ],
       proxy: new GeoExt.data.ProtocolProxy({
           protocol: new OpenLayers.Protocol.HTTP({
               url: "/json",
               format: new OpenLayers.Format.GeoJSON({
                  internalProjection: mercator,
                  externalProjection: epsg4326,
               })
           })
       }),
       autoLoad: true
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
       }, {
           header: "Category",
           width: 80,
           dataIndex: "category",
           sortable: true,
           hidden: true,
       }, {
           header: "Name",
           width: 100,
           dataIndex: "name",
           sortable: true,
       }],
       sm: new GeoExt.grid.FeatureSelectionModel(),
       stripeRows: true,
       columnLines: true,
       listeners: {
          'rowdblclick': centerPoint,
       },
   });

   var viewport = new Ext.Viewport({
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
      width: 343,
      closable: false,
      collapsible: true,
      layout: "fit",
      items: gridPanel,
   }).show();
   gridWindow.setPosition(viewport.getWidth()-358,15);
});
