var mapPanel, store, gridPanel, mainPanel;

Ext.onReady(function() {
    // create map instance
    var map = new OpenLayers.Map();
    var bluemarble = new OpenLayers.Layer.WMS(
       "Global Imagery",
       "http://maps.opengeo.org/geowebcache/service/wms",
       {layers: "bluemarble"}
    );
    var cloudmade = new OpenLayers.Layer.CloudMade("CloudMade", {
        key: '8b8b9ae9d2b140d2bf5c19a6f086f2de',
        styleId: 36256,
    });

    // create vector layer
    var vecLayer = new OpenLayers.Layer.Vector("vector");
    map.addLayers([bluemarble, vecLayer]);

    // create map panel
    mapPanel = new GeoExt.MapPanel({
        region: "center",
        map: map,
        center: new OpenLayers.LonLat(-120.651, 35.347),
        zoom: 10,
    });

    // create feature store, binding it to the vector layer
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
               name: 'time', 
               type: 'date', 
               dateFormat: 'Y-m-d H:i:s'
            },
        ],
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: "/json",
                format: new OpenLayers.Format.GeoJSON()
            })
        }),
        autoLoad: true
    });

    // create grid panel configured with feature store
    gridPanel = new Ext.grid.GridPanel({
        store: store,
        columns: [{
            header: "Time",
            width: 95,
            dataIndex: "time",
            sortable: true,
            renderer: Ext.util.Format.dateRenderer('m/d/y - H:i'),
        }, {
            header: "Category",
            width: 83,
            dataIndex: "category",
            sortable: true,
        }, {
            header: "Name",
            width: 100,
            dataIndex: "name",
            sortable: true,
        }],
        sm: new GeoExt.grid.FeatureSelectionModel(),
        autoHeight: true,
        stripeRows: true,
        columnLines: true,
    });

   var viewport = new Ext.Viewport({
       renderTo: "mainpanel",
       layout: "border",
       items: [{
          region:'center',
          items: mapPanel,
       }, {
          title: 'Newest 100 Inicidents',
          region: 'east',
          width: 280,
          items: gridPanel,
       }]
   });
      
});

