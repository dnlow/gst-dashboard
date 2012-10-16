from django.contrib.gis import admin as gis_admin
from django.contrib import admin
from models import Incident
from models import LogFile

class IncidentAdmin(gis_admin.OSMGeoAdmin):
    list_display = ('event_id', 'incident_id', 'category', 'details', 'jrsdtn', 'time')
    list_filter = ('category', 'jrsdtn', 'time')


class LogFileAdmin(admin.ModelAdmin):
    list_display = ('name', 'size')


gis_admin.site.register(Incident, IncidentAdmin)
admin.site.register(LogFile, LogFileAdmin)
