from models import Incident
from django.shortcuts import render
from django.http import HttpResponse
import json


def incidentInfo(request, incident_id):
    incident = Incident.objects.get(name=incident_id)
    return render(request, 'incident.html', {"incident": incident})


def json_incident(request, number=None):
    features = []
    root = {}
    incidents = Incident.objects.geojson().order_by('-time')
    incidents = incidents[:100] if not number else incidents[:number]
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
        properties['details'] = incident.details
        properties['address'] = incident.address
        properties['time'] = str(incident.time)
        features.append(feature)
    return HttpResponse(json.dumps(root), mimetype='application/json')
