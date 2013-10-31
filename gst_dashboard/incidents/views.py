from datetime import date
import json
import time

from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.http import require_GET

from models import Incident


@require_GET
def json_incident(request):
    offset = int(request.GET.get("offset", 0))

    incidents = Incident.objects

    incidentid = request.GET.get("incidentid", False)
    if incidentid:
        incidents = incidents.filter(incident_id__icontains=incidentid)

    filterdate = request.GET.get("date", False)
    if filterdate:
        month, date, year = filterdate.split("/")
        incidents = incidents.filter(time__year=year, time__month=month,
                                     time__day=date)

    ignore_categories = request.GET.get("categories", False)
    if ignore_categories:
        ignore_categories = ignore_categories.split(",")
        incidents = incidents.exclude(category__in=ignore_categories)

    incidents = incidents.geojson().order_by('-time')

    features = []
    for incident in incidents[offset:(offset+10)]:
        features.append({
            'type': 'Feature',
            'geometry': json.loads(incident.latlng.geojson),
            'properties': {
                'event_id': incident.event_id,
                'incident_id': incident.incident_id,
                'jrsdtn': incident.jrsdtn,
                'category': incident.category,
                'details': incident.details.title(),
                'address': incident.address.title(),
                'time': time.mktime(incident.time.timetuple()) * 1000
            }
        })
    ret = json.dumps({
        "type": "FeatureCollection",
        "features": features,
        "metadata": {
            "count": incidents.count(),
            "offset": offset
        }
    })
    return HttpResponse(ret, mimetype='application/json')
