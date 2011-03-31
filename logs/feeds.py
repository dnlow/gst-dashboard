from django.contrib.gis.feeds import Feed
from models import Incident

class CADGeoRSS(Feed):
    title = "CAD GeoRSS"
    link = "http://cfslo.selfip.org/"
    description = "Latest CAD incidents"
    
    def items(self):
        return Incident.objects.all()
        
    def item_title(self, item):
        return item.name

    def item_description(self, item):
        return "%s @ %s(%s)" % (item.details, item.jrsdtn, item.time)

    def item_link(self, item):
        return "http://cfslo.selfip.org:9000/incident/%s" % item.name
 
    def item_geometry(self, item):
        return item.latlng

feed_dict = {
    'georss' : CADGeoRSS,
}
