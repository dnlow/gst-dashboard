from datetime import datetime
from fnmatch import fnmatch
import os
import os.path

from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point

from gst_dashboard.incidents.models import Incident, LogFile
from gst_dashboard.incidents.types import types
from gst_dashboard.incidents.jurisdictions import jrsdtns

LOG_DIR = 'data/'


class Command(BaseCommand):
    args = ''
    help = ''

    def handle(self, *args, **options):
        incidents = parse_lines(get_lines())
        for event_id in incidents:
            incidents[event_id].save()


def get_valid_logs():
    all_logs = (l for l in os.listdir(LOG_DIR) if fnmatch(l, '*_Log.txt'))
    for log_name in all_logs:
        log_size = os.path.getsize(LOG_DIR + log_name)
        try:
            lf = LogFile.objects.get(name=log_name)
        except LogFile.DoesNotExist:
            lf = LogFile(name=log_name, size=log_size)
            lf.save()
            yield LOG_DIR + log_name
        else:
            if lf.size != log_size:
                lf.size = log_size
                lf.save()
                yield LOG_DIR + log_name


def get_lines():
    for log in get_valid_logs():
        with open(log, 'r') as raw:
            for line in raw:
                fields = line.split('|')
                if len(fields) > 9 and fields[7] and fields[8]:
                    yield line


def parse_fields(fields):
    category, inc_type = types.get(fields[5], ('Unknown', 'Unknown'))
    try:
        parsed = {
            "event_id": fields[1],
            "incident_id": fields[2],
            "type": fields[5],
            "details": fields[6],
            "address": fields[9],
            "jrsdtn": jrsdtns.get(fields[10], ""),
            "latlng": Point(float(fields[7]), float(fields[8])),
            "category": category,
            "time": datetime.strptime(fields[4], "%Y%m%d%H%M%S")
        }
    except:
        raise Exception("Invalid fields")
    return parsed


def parse_lines(lines):
    '''
    Returns a dictionary of Incidents
    '''
    tmp, incidents = {}, {}
    for line in lines:
        fields = line.split('|')
        try:
            data = parse_fields(fields)
        except:
            continue
        event_id = data["event_id"]
        incident_id = data["incident_id"]
        category = data["category"]

        # If incident is already created, just append log with line.
        if event_id in incidents:
            if len(incident_id) > len(incidents[event_id].incident_id):
                incidents[event_id].incident_id = incident_id
            incidents[event_id].log += line
        # Only creates an incident if there is non-'other' data.
        elif category != "Other":
            try:
                incidents[event_id] = Incident(**data)
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
