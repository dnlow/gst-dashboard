var store;

Ext.require([
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.state.*'
]);

// add new data: store.add({company: "hello", lastChange: "10/4 12:00am"})

Ext.onReady(function() {

    // setup the state provider, all state information will be saved to a cookie
    Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));

    var myData = [
        // ['CASLU1103439', 'SLO_CO', 'FIRE, WILDLAND', '2011-04-26 12:53:21'],
    ];

    store = Ext.create('Ext.data.ArrayStore', {
        fields: [
            {name: 'id'},
            {name: 'jrsdtn'},
            {name: 'category'},
            {name: 'date', type: 'date', dateFormat: 'Y-m-d h:i:s'}
        ],
        data: myData
    });

    var grid = Ext.create('Ext.grid.Panel', {
        store: store,
        stateful: true,
        stateId: 'stateGrid',
        columns: [
            { text: 'Incident ID',
              width: 90,
              sortable: false,
              dataIndex: 'id' },
            { text: 'Jurisdiction',
              width: 75,
              sortable: true,
              dataIndex: 'jrsdtn' },
            { text: 'Category',
              width: 100,
              sortable: true,
              dataIndex: 'category' },
            { text: 'Date',
              width: 115,
              sortable: true,
              renderer: Ext.util.Format.dateRenderer('m/d/Y h:i:s'),
              dataIndex: 'date' },
        ],
        height: 350,
        width: 380,
        title: 'Last 100 Incidents',
        renderTo: 'grid-example',
        viewConfig: {
            stripeRows: true
        }
    });
});
