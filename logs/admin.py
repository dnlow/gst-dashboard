from django.contrib.gis import admin
from models import Incident

class IncidentAdmin(admin.OSMGeoAdmin):
    list_display = ('name', 'category', 'details', 'jrsdtn', 'time')
    list_filter = ('category', 'jrsdtn', 'time')

admin.site.register(Incident, IncidentAdmin)
