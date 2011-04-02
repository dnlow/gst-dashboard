from django.conf.urls.defaults import *
from django.contrib import admin
from logs.feeds import feed_dict

admin.autodiscover()

urlpatterns = patterns('',
    (r'^incident/(?P<incident_id>\w+)/$', 'logs.views.incidentInfo'),
    (r'^feed/(?P<url>.*)/$', 'django.contrib.syndication.views.feed', {'feed_dict': feed_dict}),
    (r'^admin/', include(admin.site.urls)),
)
