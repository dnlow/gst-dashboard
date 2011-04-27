from django.contrib.gis.db import models

class Incident(models.Model):
    name = models.CharField(max_length=20)
    type = models.CharField(max_length=6)
    details = models.CharField(max_length=50)
    category = models.CharField(max_length=15)
    time = models.DateTimeField()
    latlng = models.PointField(srid=4269)
    address = models.CharField(max_length=100)
    jrsdtn = models.CharField(max_length=10)
    log = models.TextField()

    def __eq__(self, other):
        return (self.log == other.log and
                self.type == other.type and
                self.latlng == other.latlng and
                self.details == other.details and
                self.category == other.category and
                self.time == other.time and
                self.latlng == other.latlng and
                self.address == other.address and
                self.jrsdtn == other.jrsdtn and
                self.name == other.name)
