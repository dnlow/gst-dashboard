from django.contrib.gis.feeds import Feed
from models import Incident

class CADGeoRSS(Feed):
    title = "CAD GeoRSS"
    link = "lol"
    description = "Latest CAD incidents"

    def items(self):
        return Incident.objects.all()

    def item_link(self, item):
        return "http://google.com"

    def item_geometry(self, item):
        return item.location

feed_dict = {
    'georss' : CADGeoRSS,
}
