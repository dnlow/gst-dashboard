from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from logs.models import Incident
import os
import datetime

class Command(BaseCommand):
    args = ''
    help = 'Imports CAD logs into the PostGIS database'

    def handle(self, *args, **options):
        logs = os.listdir('data/')
        for log in logs:
            f = open('data/' + log, 'r')
            for line in f.readlines():
                line = line.rstrip()
                fields = line.split('|') 
                if len(fields) > 9 and fields[7] and fields[8]:
                    if 'SLU' in fields[2] and 'OOA' not in fields[5]:
                        if not Incident.objects.filter(id=fields[1]):
                            name = fields[1]
                            pnt = Point(float(fields[7]),float(fields[8]))
                            eventType = fields[5]
                            time = datetime.datetime.strptime(fields[4], '%Y%m%d%H%M%S')
                            Incident(name=id, eventType=type, location=pnt, time=time).save()
