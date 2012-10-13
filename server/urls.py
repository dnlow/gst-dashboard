from django.conf.urls.defaults import *
from django.contrib import admin
from incidents.feeds import CADGeoRSS
from incidents.views import json_incident
from dashboard.views import dashboard
from viewer.views import viewer

admin.autodiscover()

urlpatterns = patterns('',
    (r'^$', dashboard),
    (r'^oldviewer/$', viewer),  # old viewer that is no longer used
    (r'^dashboard/', dashboard),
    (r'^feed/geojson$', json_incident),
    (r'^feed/geojson/(?P<number>\d+)$', json_incident),
    (r'^feed/rss$', CADGeoRSS()),
    (r'^admin/', include(admin.site.urls)),
)
