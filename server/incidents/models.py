from django.contrib.gis.db import models as gis_models
from django.db import models


class Incident(gis_models.Model):
    incident_id = gis_models.CharField(max_length=20)
    event_id = gis_models.CharField(max_length=20)
    type = gis_models.CharField(max_length=6)
    details = gis_models.CharField(max_length=50)
    category = gis_models.CharField(max_length=15)
    time = gis_models.DateTimeField()
    latlng = gis_models.PointField(srid=4269)
    address = gis_models.CharField(max_length=100)
    jrsdtn = gis_models.CharField(max_length=20)
    log = gis_models.TextField()
    objects = gis_models.GeoManager()

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
                self.incident_id == other.incident_id and
                self.event_id == other.event_id)

    def save(self, *args, **kwargs):
        try:
            prev = Incident.objects.get(event_id=self.event_id)
            if prev != self:
                prev.delete()
                super(Incident, self).save(*args, **kwargs)
        except Incident.DoesNotExist:
                super(Incident, self).save(*args, **kwargs)


class LogFile(models.Model):
    name = models.CharField(max_length=20)
    size = models.PositiveIntegerField()
