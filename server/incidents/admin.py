from django.contrib.gis import admin
from models import Incident

class IncidentAdmin(admin.OSMGeoAdmin):
    list_display = ('event_id', 'incident_id', 'category', 'details', 'jrsdtn', 'time')
    list_filter = ('category', 'jrsdtn', 'time')

admin.site.register(Incident, IncidentAdmin)
