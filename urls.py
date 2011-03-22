from django.conf.urls.defaults import *
from django.contrib import admin
from logs.feeds import feed_dict

admin.autodiscover()

urlpatterns = patterns('',
    #(r'^logs/', 'logs.views.test'),
    #(r'^feed/', CADGeoRSS()),
    (r'^admin/', include(admin.site.urls)),
    (r'^feed/', 'django.contrib.syndication.views.feed', {'feed_dict': feed_dict}),
)
