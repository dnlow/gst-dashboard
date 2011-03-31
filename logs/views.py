from django.http import HttpResponse
from models import Incident

def incidentInfo(request, incident_id):
    incident = Incident.objects.get(name=incident_id)
    response = incident.name + " - " + str(incident.latlng)
    response += "<br /><hr /><br />" + incident.log
    return HttpResponse(response)
