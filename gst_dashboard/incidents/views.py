import json

from django.shortcuts import render
from django.http import HttpResponse

from models import Incident


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
        features.append({
            'type': 'Feature',
            'geometry': json.loads(incident.latlng.geojson),
            'properties': {
                'event_id': incident.event_id,
                'incident_id': incident.incident_id,
                'jrsdtn': incident.jrsdtn,
                'category': incident.category,
                'details': incident.details,
                'address': incident.address,
                'time': str(incident.time)
            }
        })
    return HttpResponse(json.dumps(root), mimetype='application/json')
