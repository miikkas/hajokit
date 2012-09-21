import base64
import json
import platform
import urllib2
import urllib
import uuid

import logging

from django.http import HttpResponse
from django.core import serializers
from django.template import RequestContext
from django.shortcuts import render_to_response
from game.models import PeliNode
from game.models import Peli,Pelaaja
from game.models import Piirros,Muutos

#Replicates request to all the other nodes if needed
def replicate(request, nodename):
    if nodename != platform.node()+".local":
       return
    logger.debug("Replicatin request %s"%(request.path_info))
    for node in PeliNode.objects.exclude(hostname=platform.node()+".local"):
      logger.debug("Replicating data to host %s" %(node.hostname))
      try:
        newplayer = urllib2.urlopen("http://%s:%d%s%s/%s" %(node.hostname,node.port,node.path,request.path_info,platform.node()+".local")).read()
      except urllib2.HTTPError as e:
        logger.error("HTTPError: %s" % (e.reason))
        

def index(request):
    """For HTTP GETting the index page of the application."""
    return render_to_response('piirra_ja_arvaa.html',{})

def newgame(request, nodename=platform.node()+".local", uuid=None):
    """ Request new game to be started """
    canvas = Piirros()
    canvas.save()
    pelinode = PeliNode.objects.get(hostname=nodename)
    if uuid is None:
       uuid = uuid.uuid4()
       logger.debug("UUID created as %s" %(uuid))
    else:
       logger.debug("UUID given as %s" %(uuid))
    uus_peli = Peli(canvas=canvas,pelinode=pelinode,uuid=uuid)
    uus_peli.save()
    replicate(request,nodename)
    return HttpResponse(serializers.serialize("json", [uus_peli] ) )

def joingame( request, playerid, gameid, nodename=platform.node()+".local" ):
    peli = Peli.objects.get(pk=gameid)
    pelaaja = Pelaaja.objects.get(pk=playerid)
    pelaaja.peli=peli
    peli.pelaajat.add(pelaaja)
    peli.save()
    pelaaja.save()
    replicate(request,nodename)
    return HttpResponse(serializers.serialize("json", [pelaaja] ) )

def listgames( request ):
    return HttpResponse( serializers.serialize("json", Peli.objects.all() ) )

def endgame( request, gameid, nodename=platform.node()+".local"):
    peli = Peli.objects.get(pk=gameid)
    peli.canvas.delete()
    peli.delete()
    replicate(request,nodename)
    return HttpResponse(serializers.serialize("json", Peli.objects.all() ) )


def newplayer(request,playername,uuid=None,nodename=platform.node()+".local"):
    if uuid is None:
       uuid = uuid.uuid4()
    pelaaja = Pelaaja(nimi=playername,uuid=uuid)
    logger.debug("Creating player %s uuid %s" %(playername,uuid))
    pelinode = PeliNode.objects.get(hostname=nodename)
    pelaaja.pelinode = pelinode
    pelaaja.save()
    replicate(request,nodename)
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
