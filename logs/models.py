from django.contrib.gis.db import models

class Incident(models.Model):
    name = models.CharField(max_length=20)
    type = models.CharField(max_length=6)
    details = models.CharField(max_length=50)
    category = models.CharField(max_length=15)
    time = models.DateTimeField()
    latlng = models.PointField()
    address = models.CharField(max_length=100)
    jrsdtn = models.CharField(max_length=10)
    log = models.TextField()
    fromFile = models.CharField(max_length=20)
