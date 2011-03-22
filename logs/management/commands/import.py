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
                        if not Incident.objects.filter(name=fields[1]):
                            name = fields[1]
                            pnt = Point(float(fields[7]),float(fields[8]))
                            eventType = fields[5]
                            time = datetime.datetime.strptime(fields[4], '%Y%m%d%H%M%S')
                            Incident(name=name, eventType=eventType, location=pnt, time=time).save()

# CAD_E|CASLU10011300|CASLU2010010037|EMS3CDF/|20101228080349|MED|MEDICAL AID CODE 3|-120.539555|35.078137|1690 LOS BERROS RD |SLO_CO|1 BLK CALLE DEBRON|100 BLK AVIS ST|735_E_4/35_T12N_R35W_S||||ME20//12/28/2010 8:16:15 AM
