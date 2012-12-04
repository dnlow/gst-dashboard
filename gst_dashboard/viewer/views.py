from django.shortcuts import render

from gst_dashboard.incidents.models import Incident


def viewer(request):
   incidents = Incident.objects.order_by('-time')[:100]
   return render(request, 'viewer.html', {"incidents": incidents})
