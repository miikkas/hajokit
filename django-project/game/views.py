import base64
import json
import platform
import urllib2
import urllib
import uuid
import time


from django.http import HttpResponse
from django.core import serializers
from django.template import RequestContext
from django.shortcuts import render_to_response
from game.models import PeliNode
from game.models import Peli,Pelaaja
from game.models import Piirros,Muutos

#Remove all the data related to given node
def remove(request,nodename):
    for game in Peli.objects.filter(pelinode=nodename):
        game.delete()
    for player in Pelaaja.objects.filter(pelinode=nodename):
        player.delete()
    return HttpResponse("ok")

#Refresh new node with our data
def refresh(request,nodename):
    node = PeliNode.objects.get(pk=nodename)
    if nodename == platform.node()+".local":
       return HttpResponse(serializers.serialize("json", [node], ensure_ascii=False ) )
    #create all the players we have
    for player in Pelaaja.objects.filter(pelinode=platform.node()+".local"):
        print("Replicating player %s to node %s"%(player,nodename))
        newplayer = urllib2.urlopen("http://%s:%d%s/player/create/%s/%s/%s" %(node.hostname,node.port,node.path,urllib.quote(player.name),player.uuid,platform.node()+".local")).read()
    for game in Peli.objects.filter(pelinode=platform.node()+".local"):
        print("Replicating game %s to node %s"%(game.uuid,nodename))
        newplayer = urllib2.urlopen("http://%s:%d%s/game/new/%s/%s" %(node.hostname,node.port,node.path,urllib.quote(game_uuid.name),platform.node()+".local")).read()
    return HttpResponse(serializers.serialize("json", [node], ensure_ascii=False ) )

#Replicates request to all the other nodes if needed
def replicate(request, nodename, uuid=""):
    if nodename != platform.node()+".local":
       return
    print("Replicatin request %s"%(request.path_info))
    for node in PeliNode.objects.exclude(hostname=platform.node()+".local"):
      print("Replicating data to host %s" %(node.hostname))
      try:
        newplayer = urllib2.urlopen("http://%s:%d%s%s/%s/%s" %(node.hostname,node.port,node.path,urllib.quote(request.path_info),uuid,platform.node()+".local")).read()
      except urllib2.HTTPError as e:
        print("HTTPError from %s: %s" % (node.hostname,e.reason))
        

def index(request):
    """For HTTP GETting the index page of the application."""
    return render_to_response('piirra_ja_arvaa.html',{})

def newgame(request, nodename=platform.node()+".local", game_uuid=None):
    """ Request new game to be started """
    canvas = Piirros()
    canvas.save()
    pelinode = PeliNode.objects.get(hostname=nodename)
    if game_uuid is None:
       game_uuid = uuid.uuid4()
       print("UUID created as %s" %(game_uuid))
    else:
       print("UUID given as %s" %(game_uuid))
    uus_peli = Peli(canvas=canvas,pelinode=pelinode,uuid=game_uuid)
    uus_peli.save()
    replicate(request,nodename, game_uuid)
    return HttpResponse(serializers.serialize("json", [uus_peli], ensure_ascii=False ) )

def joingame( request, playerid, gameid, nodename=platform.node()+".local" ):
    peli = Peli.objects.get(pk=gameid)
    pelaaja = Pelaaja.objects.get(pk=playerid)
    pelaaja.peli=peli
    peli.pelaajat.add(pelaaja)
    peli.save()
    pelaaja.save()
    replicate(request,nodename)
    return HttpResponse(serializers.serialize("json", [pelaaja], ensure_ascii=False ) )

def listgames( request ):
    return HttpResponse( serializers.serialize("json", Peli.objects.all(), ensure_ascii=False ) )

def endgame( request, gameid, nodename=platform.node()+".local"):
    peli = Peli.objects.get(pk=gameid)
    peli.canvas.delete()
    peli.delete()
    replicate(request,nodename)
    return HttpResponse(serializers.serialize("json", Peli.objects.all(), ensure_ascii=False ) )


def newplayer(request,playername,player_uuid=None,nodename=platform.node()+".local"):
    if player_uuid is None:
       player_uuid = uuid.uuid4()
    pelaaja = Pelaaja(nimi=playername,uuid=player_uuid)
    print("Creating player %s uuid %s" %(playername,player_uuid))
    pelinode = PeliNode.objects.get(hostname=nodename)
    pelaaja.pelinode = pelinode
    pelaaja.save()
    replicate(request,nodename, player_uuid)
    return HttpResponse(serializers.serialize("json", [pelaaja], ensure_ascii=False ) )

def players(request):
    """For HTTP GETting the data of the current players, JSON encoded."""
    return HttpResponse(serializers.serialize("json", Pelaaja.objects.all(), ensure_ascii=False ) )

def canvasall(request):
    """For HTTP GETting the current canvas data, base 64 encoded, JSON encoded."""
    return HttpResponse(serializers.serialize("json", Piirros.objects.all(), ensure_ascii=False ))

def canvas( request, canvas_id ):
    if request.method == "POST":
     canvas = Piirros.objects.get(pk=canvas_id)
     canvas.muutos_set.clear()
     canvas.muutos_set.delete()
     for canvas in serializers.deserialize("json", request.POST ):
       canvas.save()
    else:
     return HttpResponse( serializers.serialize("json", [ Piirros.objects.get(pk=canvas_id ) ], ensure_ascii=False ) )

def canvasdiff( request, canvas_id ):
    canvas = Piirros.objects.get(pk=canvas_id)
    if requests.method == "POST":
     for muutos in serializers.deserialize("json", request.POST ):
        canvas.add(muutos)
        muutos.save()
     canvas.save()
    else:
     return HttpResponse( serializers.serialize("json",  canvas.muutos_set, ensure_ascii=False) )

def guesses(request, timestamp = 0):
    """For HTTP GETting the guesses made on the current game, JSON encoded.
       If timestamp is given, give guesses that are younger than timestamp
       or block until such guess is made"""
    while Guess.objects.filter(timestamp>timestamp) is None:
          time.sleep(0.2)
    return HttpResponse( serializers.serialize("json", Guess.objects.filter(timestamp>timestamp), ensure_ascii=False))

def guess(request):
    """For HTTP POSTing a guess to the current game, JSON encoded(?)."""
    if requests.method == "POST":
      for guess in serializers.deserialize("json",request.POST ):
          guess.save()
      return HttpResponse("ok")
    return HttpResponse("not ok, use POST")

def nodes(request):
    all_the_nodes = PeliNode.objects.all()
    return HttpResponse( serializers.serialize("json", all_the_nodes, ensure_ascii=False ) )
