import os

import django.core.handlers.wsgi
import djcelery


os.environ['DJANGO_SETTINGS_MODULE'] = 'gst_dashboard.settings'
djcelery.setup_loader()
application = django.core.handlers.wsgi.WSGIHandler()
