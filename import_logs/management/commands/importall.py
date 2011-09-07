from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from logs.models import Incident
from fnmatch import fnmatch
from datetime import datetime
import csv
import os


class Command(BaseCommand):
    args = ''
    help = 'Imports CAD logs into the PostGIS database'

    def handle(self, *args, **options):
        kwargs = dict()
        tmp = dict()
        it = dict()
        incidents = dict()

        # Populate incident types
        types = csv.reader(open('etc/incidentTypes.csv', 'r'))
        it = dict((line[1], line[0]) for line in types)

        # Populate incidents from logs
        for log in os.listdir('data/stripped/'):
            if fnmatch(log, '*_Log.txt'):
                f = open('data/stripped/' + log, 'r')
                for line in f.readlines():
                    fields = line.split('|') 
                    name = fields[1]
                    category = it.get(fields[5], 'Other')
                    if name in incidents:
                        incidents[name].log += line 
                    elif category != "Other":
                        kwargs['name'] = name
                        kwargs['type'] = fields[5]
                        kwargs['details'] = fields[6]
                        kwargs['category'] = category
                        kwargs['time'] = datetime.strptime(fields[4], '%Y%m%d%H%M%S')
                        kwargs['latlng'] = Point(float(fields[7]),float(fields[8]))
                        kwargs['address'] = fields[9]
                        kwargs['jrsdtn'] = fields[10]
                        line = tmp.get(name, '') + line
                        kwargs['log'] = line 
                        incidents[name] = Incident(**kwargs)
                    else:
                        tmp[name] = tmp.get(name, '') + line
                f.close()

        # Save incidents to database
        for name in incidents:
            curr = incidents[name]
            try:
                prev = Incident.objects.get(name=name)
                if prev != curr:
                    prev.delete()
                    curr.save()
            except Incident.DoesNotExist:
                curr.save()