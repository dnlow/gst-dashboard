import datetime

from django.http import HttpResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET

from gst_dashboard.incidents.models import Incident


@require_GET
def dashboard(request):
    incidents = Incident.objects.order_by('-time')[0:10]
    return render(request, 'tmp.html', {"incidents": incidents})
