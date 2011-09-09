from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from incidents.models import Incident
from fnmatch import fnmatch
from datetime import datetime
from incidents.types import types
import os


class Command(BaseCommand):
    args = ''
    help = 'Imports CAD logs into the PostGIS database'
    def handle(self, *args, **options):
        incidents = get_incidents()
        save_incidents(incidents)


def log_lines():
    '''
    Gets all the lines from the stripped logs
    
    Arguments:
    None
    
    Yields lines of stripped logs 
    '''
    stripped = 'data/stripped/'
    for log in os.listdir(stripped):
        if fnmatch(log, '*_Log.txt'):
            with open(stripped + log, 'r') as f:
                for line in f:
                    yield(line)


def get_incidents():
    '''
    Parses the stripped logs and returns a dictionary of Incidents
    
    Arguments:
    None
    
    Returns a dictionary of Incidents 
    '''
    tmp, incidents = {}, {}
    for line in log_lines():
        fields = line.split('|')
        uid = fields[1]
        category, inc_type = types.get(fields[5], ('Unknown', 'Unknown'))
        # If incident is already created, just append log with line.
        if uid in incidents:
            incidents[uid].log += line
        # Only creates an incident if there is non-'other' data.
        elif category != "Other":    
            incidents[uid] = Incident(name=uid, type=fields[5],
                details=fields[6], category=category, address=fields[9],
                time=datetime.strptime(fields[4], '%Y%m%d%H%M%S'),
                latlng=Point(float(fields[7]), float(fields[8])),
                jrsdtn=fields[10])
            # If there are previous, add them before the current line
            if uid in tmp:
                incidents[uid].log = tmp[uid] + line
                del tmp[uid]
            else:
                incidents[uid].log = line
        # If 'other', just save log in temporary dictionary
        else:
            tmp[uid] = tmp.get(uid, '') + line
    #for i in tmp:
        # add the rest in tmp?
    return incidents


def save_incidents(incidents):
    '''
    Save incidents to a spatial database
    
    Arguments:
    incidents -- a dictionary of Incidents to be saved
    '''
    for uid in incidents:
        curr = incidents[uid]
        try:
            prev = Incident.objects.get(name=uid)
            if prev != curr:
                prev.delete()
                curr.save()
        except Incident.DoesNotExist:
            curr.save()