from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from incidents.models import Incident
from datetime import datetime
from incidents.types import types
from fnmatch import fnmatch
import os

LOG_DIR = 'data/raw/'

class Command(BaseCommand):
    args = ''
    help = ''

    def handle(self, *args, **options):
        incidents = parse_lines(get_lines())
        for event_id in incidents:
            incidents[event_id].save()


def is_log(log):
    return fnmatch(log, '*_Log.txt')


def get_lines():
    logs = (LOG_DIR + log for log in os.listdir(LOG_DIR) if is_log(log))
    for log in logs: 
        with open(log, 'r') as raw:
            for line in raw:
                fields = line.split('|')
                if len(fields) > 9 and fields[7] and fields[8]:
                    yield line


def parse_lines(lines):
    '''
    Returns a dictionary of Incidents 
    '''
    tmp, incidents = {}, {}
    for line in lines:
        fields = line.split('|')
        event_id = fields[1]
        incident_id = fields[2]
        category, inc_type = types.get(fields[5], ('Unknown', 'Unknown'))
        # If incident is already created, just append log with line.
        if event_id in incidents:
            if len(incident_id) > len(incidents[event_id].incident_id):
                incidents[event_id].incident_id = incident_id
            incidents[event_id].log += line
        # Only creates an incident if there is non-'other' data.
        elif category != "Other":    
            try:
                incidents[event_id] = Incident(event_id=event_id, type=fields[5],
                    details=fields[6], category=category, address=fields[9],
                    time=datetime.strptime(fields[4], '%Y%m%d%H%M%S'),
                    latlng=Point(float(fields[7]), float(fields[8])),
                    jrsdtn=fields[10], incident_id=incident_id)
            except:
                # incorrectly formatted incidents
                # print(line)
                pass
            else:
                # If there are previous, add them before the current line
                if event_id in tmp:
                    incidents[event_id].log = tmp[event_id] + line
                    del tmp[event_id]
                else:
                    incidents[event_id].log = line
        # If 'other', just save log in temporary dictionary
        else:
            tmp[event_id] = tmp.get(event_id, '') + line
    #for i in tmp:
        # add the rest in tmp?
    return incidents
