from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from incidents.models import Incident
from datetime import datetime
from incidents.types import types
from fnmatch import fnmatch
import os


class Command(BaseCommand):
    args = ''
    help = ''

    def handle(self, *args, **options):
        incdnts = get_incdnts()
        save_incdnts(incdnts)


def filter_incdnts():
    for log in os.listdir('data/raw/'):
        if fnmatch(log, '*_Log.txt'):
            with open('data/raw/' + log, 'r') as raw:
                for line in raw:
                    fields = line.split('|')
                    if len(fields) > 9 and fields[7] and fields[8]:
                        yield line


def get_incdnts():
    '''
    Returns a dictionary of Incidents 
    '''
    tmp, incidents = {}, {}
    for line in filter_incdnts():
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


def save_incdnts(incidents):
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
