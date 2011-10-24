from incidents.models import Incident
from django.http import HttpResponse
from django.shortcuts import render
import datetime

def dashboard(request):
    day = datetime.timedelta(days=3)
    sample = datetime.date(2011, 4, 20)
    incidents = []
    days = 0

    while sample <= datetime.date.today()-day:
        incidents.append({
           'fire': len(Incident.objects.filter(time__range=(sample, sample+day)).filter(category='Fire')),
           'med': len(Incident.objects.filter(time__range=(sample, sample+day)).filter(category='Medical')),
           'haz': len(Incident.objects.filter(time__range=(sample, sample+day)).filter(category='Hazard')),
           'pa': len(Incident.objects.filter(time__range=(sample, sample+day)).filter(category='Public Assist')),
        })
        sample += day
        days += 1

    return render(request, 'tmp.html', {"days": days, "incidents": incidents})
    #return render(request, 'tmp.html', {"days": days, "incidents": incidents, "fire": fire, "med": med, "haz": haz, "pa": pa})
