from django.core.management.base import BaseCommand
from fnmatch import fnmatch
import os

class Command(BaseCommand):
    args = ''
    help = 'Removes unhelpful entries from the logs'

    def handle(self, *args, **options):
        for log in os.listdir('data/raw/'):
            if fnmatch(log, '*.txt'):
                raw = open('data/raw/' + log, 'r+')
                stripped = open('data/stripped/' + log, 'w')
                for line in raw.readlines():
                    fields = line.split('|')
                    if len(fields) > 9 and fields[7] and fields[8]:
                        stripped.write(line)
                raw.close()
                stripped.close()
