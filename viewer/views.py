from incidents.models import Incident
from django.shortcuts import render

def viewer(request):
   incidents = Incident.objects.order_by('-time')[:100]
   return render(request, 'viewer.html', {"incidents": incidents})
