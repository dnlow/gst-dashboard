DjangoCAD
=========

A Django project dedicated to displaying CAD (computer aided dispatch) data online

Setup
-----

1. `git clone git@github.com:frewsxcv/DjangoCAD.git`
2. Create a PostGIS database
3. Update 'settings\_template.py' to update database information and rename to 'settings.py'
4. Run `python manage.py importLogs` on the data in DjangoCAD/data/
5. Start the Django server: `python manage.py runserver`

Commands
--------

Commands implemented to help manage CAD data

+ **python manage.py strip** - Strip bad lines from CAD logs in data/raw/ and put them in data/stripped/
+ **python manage.py importall** - Import all CAD logs from data/stripped/

CAD Data Format
---------------

+ "?|Event Number|?|?|?|Longitude|Latitude|Address|?|?|?|?|?|?|?|?|?|?"
+ Sample: "CAD\_E|CASBY10010862|CASLU2010009640|EMS3CDF/|20101215075927|MED|MEDICAL AID CODE 3|-120.842218|35.320365|MORRO SHORES MHP @ 633 RAMONA AVE |LOS\_OSOS|1700 BLK BRODERSON AVE| UNNAMED ST|631\_G\_5/18\_T30S\_R11E\_M||||ME15,MR15//12/15/2010 8:00:34 AM"
