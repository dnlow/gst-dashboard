from django.conf.urls.defaults import *
from django.contrib import admin
from django.contrib.syndication.views import feed
from incidents.feeds import feed_dict
from incidents.views import json_incident
from dashboard.views import dashboard

admin.autodiscover()

urlpatterns = patterns('',
    #(r'^incident/(?P<incident_id>\w+)/$', 'incidents.views.incidentInfo'),
    (r'^viewer/$', 'viewer.views.viewer'),
    (r'^dashboard/', dashboard),
    (r'^feed/geojson$', json_incident),
    (r'^feed/geojson/(?P<number>\d+)$', json_incident),
    (r'^feed/(?P<url>.*)$', feed, {'feed_dict': feed_dict}),
    (r'^admin/', include(admin.site.urls)),
)
