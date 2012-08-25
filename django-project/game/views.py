import base64
import json

from django.http import HttpResponse
from django.template import RequestContext

def index(request):
    """For HTTP GETting the index page of the application."""
    pass

def players(request):
    """For HTTP GETting the data of the current players, JSON encoded."""
    pass

def canvas(request):
    """For HTTP GETting the current canvas data, base 64 encoded, JSON encoded."""
    pass

def guesses(request):
    """For HTTP GETting the guesses made on the current game, JSON encoded."""
    pass

def guess(request):
    """For HTTP POSTing a guess to the current game, JSON encoded(?)."""
    pass

