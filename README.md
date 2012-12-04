# GST Dashboard

A web application used to analyze [computer aided dispatch](http://en.wikipedia.org/wiki/Computer-aided_dispatch) logs from [GeoSpatial Technologies, Inc](http://www.geospatialtech.com/).

## Setup

1. Clone the repository: `git clone git@github.com:frewsxcv/gst-dashboard.git`
2. Install the requirements: `pip install -r requirements.txt`
3. [Create a PostGIS database](http://postgis.refractions.net/documentation/manual-1.5/ch02.html#id2661925)
4. Create a new PostgreSQL user that has read/write privileges on the new database
5. Copy the file `settings\_template.py` in the `server` directory and name it `settings.py`
6. Modify the database fields in `settings.py` to match the PostgreSQL + PostGIS database that was set up in Step 2
7. Create the database tables: `python server/manage.py syncdb`
8. Import the incident logs: `python server/manage.py import`

## Running

Start the Django server: `python server/manage.py runserver`

## Commands

Commands implemented to help manage CAD data

+ **python manage.py import** - Imports all the useful CAD data into the database

## CAD Data Format

+ "?|Event Number|?|?|?|Longitude|Latitude|Address|?|?|?|?|?|?|?|?|?|?"
+ Sample: "CAD\_E|CASBY10010862|CASLU2010009640|EMS3CDF/|20101215075927|MED|MEDICAL AID CODE 3|-120.842218|35.320365|MORRO SHORES MHP @ 633 RAMONA AVE |LOS\_OSOS|1700 BLK BRODERSON AVE| UNNAMED ST|631\_G\_5/18\_T30S\_R11E\_M||||ME15,MR15//12/15/2010 8:00:34 AM"
