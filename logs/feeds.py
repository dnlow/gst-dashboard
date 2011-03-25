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

    def item_link(self, item):
        return "/incident/%s" % item.name
 
    def item_geometry(self, item):
        return item.location
