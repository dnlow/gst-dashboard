from models import Incident
from django.shortcuts import render
from django.utils import simplejson
from django.http import HttpResponse

def incidentInfo(request, incident_id):
    incident = Incident.objects.get(name=incident_id)
    return render(request, 'incident.html', {"incident": incident})

def viewer(request):
    incidents = Incident.objects.order_by('-time')[:100]
    return render(request, 'viewer.html', {"incidents": incidents})

def json_incident(request):
    incidents = Incident.objects.all()
    return HttpResponse(incidents.geojson().all()[0].latlng.geojson, mimetype='application/json')
    '''
    result = []
    incidents = Incident.objects.order_by('-time')[:100]
    for i in incidents:
        result.append({'id':i.name, 'jrsdtn':i.jrsdtn, 'category':i.category})
    return HttpResponse(simplejson.dumps(result), mimetype='application/json')
    '''
