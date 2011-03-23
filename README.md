DjangoCAD
=========

A Django project dedicated to displaying CAD (computer aided dispatch) data online

Setup
-----

1. `git clone git@github.com:frewsxcv/DjangoCAD.git`
2. Create a PostGIS database
3. Update 'settings\_template.py' to update database information and rename to 'settings.py'
4. Run `python manage.py import` on the data in DjangoCAD/data/
5. Start the Django server: `python manage.py runserver`

Commands
--------

Commands implemented to help manage CAD data

+ **manage.py import** - Import CAD logs in DjangoCAD/data/
