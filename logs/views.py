from models import Incident
from django.shortcuts import render
from django.http import HttpResponse
import json

def incidentInfo(request, incident_id):
    incident = Incident.objects.get(name=incident_id)
    return render(request, 'incident.html', {"incident": incident})

def viewer(request):
    incidents = Incident.objects.order_by('-time')[:100]
    return render(request, 'viewer.html', {"incidents": incidents})

def json_incident(request):
    features = []
    root = {}
    incidents = Incident.objects.geojson().order_by('-time')[:100]
    root['type'] = "FeatureCollection"
    root['features'] = features
    for incident in incidents:
       feature = {}
       properties = {}
       feature['type'] = "Feature"
       feature['geometry'] = json.loads(incident.latlng.geojson)
       feature['properties'] = properties
       properties['name'] = incident.name
       properties['jrsdtn'] = incident.jrsdtn
       properties['category'] = incident.category
       properties['time'] = str(incident.time)
       features.append(feature)
    return HttpResponse(json.dumps(root), mimetype='application/json')
