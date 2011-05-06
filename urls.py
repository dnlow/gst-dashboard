from django.conf.urls.defaults import *
from django.contrib import admin
from logs.feeds import feed_dict

admin.autodiscover()

urlpatterns = patterns('',
    (r'^incident/(?P<incident_id>\w+)/$', 'logs.views.incidentInfo'),
    (r'^viewer/$', 'logs.views.viewer'),
    (r'^feed/(?P<url>.*)/$', 'django.contrib.syndication.views.feed', {'feed_dict': feed_dict}),
    (r'^json/$', 'logs.views.json_incident'),
    (r'^json/(?P<number>\d+)/$', 'logs.views.json_incident'),
    (r'^admin/', include(admin.site.urls)),
)
