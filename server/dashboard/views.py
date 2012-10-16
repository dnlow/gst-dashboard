from incidents.models import Incident
from django.http import HttpResponse
from django.shortcuts import render
import datetime

def dashboard(request):
    return render(request, 'tmp.html')
