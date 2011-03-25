from django.http import HttpResponse
from models import Incident

def incidentInfo(request, incident_id):
    incident = Incident.objects.get(name=incident_id)
    return HttpResponse(incident.name + " - " + str(incident.location))
