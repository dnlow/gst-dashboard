from django.conf.urls.defaults import *
from django.contrib import admin

from gst_dashboard.incidents.feeds import IncidentFeed
from gst_dashboard.incidents.views import json_incident
from gst_dashboard.dashboard.views import dashboard
from gst_dashboard.viewer.views import viewer


admin.autodiscover()

urlpatterns = patterns('',
    # legacy
    (r'^feed/geojson$', json_incident),
    (r'^feed/geojson/(?P<number>\d+)$', json_incident),
    (r'^feed/rss$', IncidentFeed()),

    (r'^$', dashboard),
    (r'^oldviewer/$', viewer),  # old viewer that is no longer used
    (r'^dashboard/', dashboard),
    (r'^incidents/json$', json_incident),
    (r'^incidents/json/(?P<number>\d+)$', json_incident),
    url(r'^incidents/rss$', IncidentFeed(), name='incident-rss'),
    (r'^admin/', include(admin.site.urls)),
)
