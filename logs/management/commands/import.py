from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from logs.models import Incident
import csv
import os
import datetime

class Command(BaseCommand):
    args = ''
    help = 'Imports CAD logs into the PostGIS database'

    def handle(self, *args, **options):
        # Load incident types
        it = dict()
        types = csv.reader(open('etc/incidentTypes.csv', 'r'))
        for line in types:
            it[line[1]] = [line[0], line[2]]

        # Populate database
        tmp= dict()
        kwargs = dict()
        logs = os.listdir('data/')
        for log in logs:
            f = open('data/' + log, 'r')
            for line in f.readlines():
                fields = line.split('|') 
                if len(fields) > 9 and fields[7] and fields[8]:  # filter bad logs
                    name = fields[1]
                    if not Incident.objects.filter(name=name):
                        category = it[fields[5]][0]
                        if category != "Other":
                            kwargs['type'] = fields[5]
                            kwargs['details'] = fields[6]
                            kwargs['category'] = it[fields[5]][0]
                            kwargs['time'] = datetime.datetime.strptime(fields[4], '%Y%m%d%H%M%S')
                            kwargs['latlng'] = Point(float(fields[7]),float(fields[8]), srid=4269)
                            kwargs['latlng'].transform(900913)
                            kwargs['address'] = fields[9]
                            kwargs['jrsdtn'] = fields[10]
                            line = tmp.get(name, '') + line
                            kwargs['log'] = line 
                            kwargs['fromFile'] = log
                            Incident(name = name, **kwargs).save()
                        else:
                            tmp[name] = tmp.get(name, '') + line
                    else:
                        incident = Incident.objects.get(name=name)
                        incident.log += line
                        incident.save()
