from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from incidents.models import Incident
from fnmatch import fnmatch
from datetime import datetime
from incidents.types import types
import csv
import os


class Command(BaseCommand):
    args = ''
    help = 'Imports CAD logs into the PostGIS database'

    def handle(self, *args, **options):
        incidents = get_incidents()
        #save_incidents(incidents)


def lines():
    '''
    Yields lines from the stripped logs
    '''
    stripped = 'data/stripped/'
    for log in os.listdir(stripped):
        if fnmatch(log, '*_Log.txt'):
            with open(stripped + log, 'r') as f:
                for line in f:
                    yield(line)


def get_incidents():
    tmp, incidents = {}, {}
    for line in lines():
        fields = line.split('|')
        id = fields[1]
        category, inc_type = types.get(fields[5], ('Unknown', 'Unknown'))
        # If incident is already created, just append log with line.
        if id in incidents:
            incidents[id].log += line
        # Only creates an incident if there is non-'other' data.
        elif category != "Other":
            incidents[id] = Incident(name=id, type=fields[5], 
                details=fields[6], category=category, address=fields[9],
                time=datetime.strptime(fields[4],'%Y%m%d%H%M%S'), 
                latlng=Point(float(fields[7]),float(fields[8])),
                jrsdtn=fields[10])
            if id in tmp:
                incidents[id].log = tmp[id] + line
                del tmp[id]
            else:
                incidents[id].log = line
        else:
            tmp[id] = tmp.get(id, '') + line
    for i in tmp:
        print(tmp[i])
        # add the rest in tmp?
    return incidents


def save_incidents():
    '''
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
            '''
