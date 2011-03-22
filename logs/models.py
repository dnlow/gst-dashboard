from django.contrib.gis.db import models

class Incident(models.Model):
    name = models.CharField(max_length=20)
    eventType = models.CharField(max_length=6)
    location = models.PointField()
    time = models.DateTimeField()
