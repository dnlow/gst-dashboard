from django.conf.urls.defaults import *
from django.contrib import admin
from django.contrib.syndication.views import feed
from incidents.feeds import feed_dict
from incidents.views import json_incident

admin.autodiscover()

urlpatterns = patterns('',
    #(r'^incident/(?P<incident_id>\w+)/$', 'incidents.views.incidentInfo'),
    #(r'^viewer/$', 'incidents.views.viewer'),
    (r'^feed/geojson$', json_incident),
    (r'^feed/geojson/(?P<number>\d+)$', json_incident),
    (r'^feed/(?P<url>.*)$', feed, {'feed_dict': feed_dict}),
    (r'^admin/', include(admin.site.urls)),
)
