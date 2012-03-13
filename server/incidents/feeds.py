from django.contrib.gis.feeds import Feed
from models import Incident

class CADGeoRSS(Feed):
    title = "San Luis Obispo Incident Data"
    link = "http://dashboard.slocountyfire.org/"
    description = "Latest 100 incidents"
    
    def items(self):
        return Incident.objects.order_by('-time')[:100]
        
    def item_title(self, item):
        return item.event_id

    def item_description(self, item):
        return "%s @ %s(%s)" % (item.details, item.jrsdtn, item.time)

    def item_link(self, item):
        return "http://dashboard.slocountyfire.org/incident/%s" % item.event_id
 
    def item_geometry(self, item):
        return item.latlng

feed_dict = {
    'georss' : CADGeoRSS,
}
