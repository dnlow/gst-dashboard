from django.http import HttpResponse

def test(request):
    return HttpResponse("Hell, world. You're on my test page!");
