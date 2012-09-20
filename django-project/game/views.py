import base64
import json
import platform
import urllib2

from django.http import HttpResponse
from django.core import serializers
from django.template import RequestContext
from django.shortcuts import render_to_response
from game.models import PeliNode
from game.models import Peli,Pelaaja
from game.models import Piirros,Muutos

def index(request):
    """For HTTP GETting the index page of the application."""
    return render_to_response('piirra_ja_arvaa.html',{})

def newgame(request, nodename= platform.node()+".local"):
    """ Request new game to be started """
    uus_peli = Peli()
    canvas = Piirros()
    canvas.save()
    uus_peli.canvas = canvas
    pelinode = PeliNode.objects.get(hostname=nodename)
    uus_peli.pelinode = pelinode
    uus_peli.save()
    if nodename == platform.node()+".local":
       for node in PeliNode.objects.exclude(hostname=platform.node()+".local"):
         try:
           newplayer = urllib2.urlopen("http://"+node.hostname+":"+node.port+node.path+"/games/new/"+platform.node()+".local").read()
         except:
           pass
    return HttpResponse(serializers.serialize("json", [uus_peli] ) )

def joingame( request, playerid, gameid ):
    peli = Peli.objects.get(pk=gameid)
    pelaaja = Pelaaja.objects.get(pk=playerid)
    pelaaja.peli=peli
    peli.pelaajat.add(pelaaja)
    peli.save()
    pelaaja.save()
    return HttpResponse(serializers.serialize("json", [pelaaja] ) )

def listgames( request ):
    return HttpResponse( serializers.serialize("json", Peli.objects.all() ) )

def endgame( request, gameid ):
    peli = Peli.objects.get(pk=gameid)
    peli.canvas.delete()
    peli.delete()
    return HttpResponse(serializers.serialize("json", Peli.objects.all() ) )


def newplayer(request,playername,nodename=platform.node()+".local"):
    pelaaja = Pelaaja(nimi=playername)
    pelinode = PeliNode.objects.get(hostname=nodename)
    pelaaja.pelinode = pelinode
    pelaaja.save()
    if nodename == platform.node()+".local":
       for node in PeliNode.objects.exclude(hostname=platform.node()+".local"):
         try:
           newplayer = urllib2.urlopen("http://"+node.hostname+":"+node.port+node.path+"/player/create/"+playername+"/"+platform.node()+".local").read()
         except:
           pass
    return HttpResponse(serializers.serialize("json", [pelaaja] ) )

def players(request):
    """For HTTP GETting the data of the current players, JSON encoded."""
    return HttpResponse(serializers.serialize("json", Pelaaja.objects.all() ) )

def canvasall(request):
    """For HTTP GETting the current canvas data, base 64 encoded, JSON encoded."""
    return HttpResponse(serializers.serialize("json", Piirros.objects.all() ))

def canvas( request, canvas_id ):
    if request.method == "POST":
     canvas = Piirros.objects.get(pk=canvas_id)
     canvas.muutos_set.clear()
     canvas.muutos_set.delete()
     for canvas in serializers.deserialize("json", request.POST ):
       canvas.save()
    else:
     return HttpResponse( serializers.serialize("json", [ Piirros.objects.get(pk=canvas_id ) ] ) )

def canvasdiff( request, canvas_id ):
    canvas = Piirros.objects.get(pk=canvas_id)
    if requests.method == "POST":
     for muutos in serializers.deserialize("json", request.POST ):
        canvas.add(muutos)
        muutos.save()
     canvas.save()
    else:
     return HttpResponse( serializers.serialize("json", canvas.muutos_set) )

def guesses(request):
    """For HTTP GETting the guesses made on the current game, JSON encoded."""
    pass

def guess(request):
    """For HTTP POSTing a guess to the current game, JSON encoded(?)."""
    pass


def nodes(request):
    all_the_nodes = PeliNode.objects.all()
    return HttpResponse( serializers.serialize("json", all_the_nodes ) )
