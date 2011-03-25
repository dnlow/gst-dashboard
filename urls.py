from django.conf.urls.defaults import *
from django.contrib import admin
from logs.feeds import CADGeoRSS

admin.autodiscover()

urlpatterns = patterns('',
    (r'^incident/(?P<incident_id>\w+)/$', 'logs.views.incidentInfo'),
    # (r'^feed/$', CADGeoRSS()),
    (r'^admin/', include(admin.site.urls)),
)
