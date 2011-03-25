from django.conf.urls.defaults import *
from django.contrib import admin
from logs.feeds import CADGeoRSS

admin.autodiscover()

urlpatterns = patterns('',
    #(r'^logs/', 'logs.views.test'),
    #(r'^feed/', CADGeoRSS()),
    (r'^admin/$', include(admin.site.urls)),
    (r'^feed/$', CADGeoRSS()),
)
