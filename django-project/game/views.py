import base64
import json
import platform
import urllib2
import urllib
import uuid
import time,datetime


from django.http import HttpResponse,Http404
from django.core import serializers
from django.template import RequestContext
from django.shortcuts import render_to_response,get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils import simplejson
from django.db import transaction

from django.utils.timezone import utc

from game.models import HostNode
from game.models import Game,Player,Guess
from game.models import Canvas,Path

#Remove all the data related to given node
def remove(request,nodename):
    for game in Game.objects.filter(pelinode=nodename):
        game.canvas.delete()
        game.delete()
    for player in Player.objects.filter(pelinode=nodename):
        player.delete()
    Hostnode.objects.get(pk=nodename).delete()
    return HttpResponse("ok")

#Refresh new node with our data
def refresh(request,nodename):
    node = HostNode.objects.get(pk=nodename)
    if nodename == platform.node()+".local":
       return HttpResponse(serializers.serialize("json", [node], ensure_ascii=False ) )
    #create all the players we have
    for player in Player.objects.filter(pelinode=platform.node()+".local"):
        print("Replicating player %s to node %s body %s"%(player,nodename,request.body))
        newplayer = urllib2.urlopen("http://%s:%d%s/player/create/%s/%s/%s" %(node.hostname,node.port,node.path,urllib.quote(player.name),player.uuid,platform.node()+".local")).read()
    for game in Game.objects.filter(pelinode=platform.node()+".local"):
        print("Replicating game %s to node %s"%(game.uuid,nodename))
        newplayer = urllib2.urlopen("http://%s:%d%s/game/new/%s/%s" %(node.hostname,node.port,node.path,urllib.quote(game_uuid.name),platform.node()+".local")).read()
        jsondata=[]
        #Replicate the canvas data to new node
        for path in game.canvas.path__set:
            jsondata.append({"color":path.color,"size":path.size,"segments":[{"pointx":path.pointx,"pointy":path.pointy,"handleInx":path.handleInx,"handleIny":path.handleIny,"handleOutx":path.handleOutx,"handleOuty":path.handleOuty}]})
        print "Replicating canvas %s data:%s"%(game.uuid,jsondata)
        newcanvas = urllib2.urlopen("http://%s:%d%s/canvas/%s/" %(node.hostname,node.port,node.path,urllib.quote(game_uuid.name)),jsondata).read()
    return HttpResponse(serializers.serialize("json", [node], ensure_ascii=False ) )

#Replicates request to all the other nodes if needed
def replicate(request, nodename=platform.node()+".local", uuid=""):
    if not request.is_ajax():
       print "No need to replicate non-ajax request"
       return
    print("Replicatin request %s"%(request.path_info))
    for node in HostNode.objects.exclude(hostname=platform.node()+".local"):
      print("Replicating data to host %s body: %s" %(node.hostname,request.body))
      newplayer=""
      try:
        if not len(request.body):
         newplayer = urllib2.urlopen("http://%s:%d%s%s/%s/%s" %(node.hostname,node.port,node.path,urllib.quote(request.path_info),uuid,platform.node()+".local")).read()
        else: #HTTP POST
         newplayer = urllib2.urlopen("http://%s:%d%s%s" %(node.hostname,node.port,node.path,urllib.quote(request.path_info)),request.body).read()
      except urllib2.HTTPError as e:
        print("HTTPError from %s: %d body:%s" % (node.hostname,e.code,e.read()))

def index(request):
    """For HTTP GETting the index page of the application."""
    return render_to_response('piirra_ja_arvaa.html',{})

#Create game with given uuid or generate uuid
def newgame(request, nodename=platform.node()+".local", game_uuid=None):
    """ Request new game to be started """
    pelinode = HostNode.objects.get(hostname=nodename)
    if game_uuid is None:
       game_uuid = uuid.uuid4()
       print("UUID created as %s" %(game_uuid))
    else:
       print("UUID given as %s" %(game_uuid))
    canvas = Canvas(uuid=game_uuid)
    canvas.save()
    uus_peli = Game(canvas=canvas,pelinode=pelinode,uuid=game_uuid)
    uus_peli.save()
    replicate(request,nodename, game_uuid)
    return HttpResponse(serializers.serialize("json", [uus_peli], ensure_ascii=False ) )

#Join player to some game
def joingame( request, playerid, gameid, nodename=platform.node()+".local" ):
    peli = Game.objects.get(pk=gameid)
    pelaaja = Player.objects.get(pk=playerid)
    pelaaja.peli=peli
    peli.pelaajat.add(pelaaja)
    peli.save()
    pelaaja.save()
    replicate(request,nodename)
    return HttpResponse(serializers.serialize("json", [pelaaja], ensure_ascii=False ) )

#List games that are created
def listgames( request ):
    return HttpResponse( serializers.serialize("json", Game.objects.all(), ensure_ascii=False ) )

#End game and clear out
def endgame( request, gameid, nodename=platform.node()+".local"):
    peli = Game.objects.get(pk=gameid)
    peli.canvas.delete()
    peli.delete()
    replicate(request,nodename)
    return HttpResponse(serializers.serialize("json", Game.objects.all(), ensure_ascii=False ) )


#Create new player with given name and optionally given uuid/node where player is connected
def newplayer(request,playername,player_uuid=None,nodename=platform.node()+".local"):
    if player_uuid is None:
       player_uuid = uuid.uuid4()
    pelinodeid = HostNode.objects.get(hostname=nodename)
    pelaaja = Player.objects.get_or_create(nimi=playername,pelinode=pelinodeid,uuid=player_uuid)[0]
    print type(str(player_uuid))
    print pelaaja
    print player_uuid
    print("Creating player %s uuid %s" %(playername,player_uuid))
    pelaaja.save()
    replicate(request,nodename, player_uuid)
    return HttpResponse(serializers.serialize("json", [pelaaja], ensure_ascii=False ) )

def players(request):
    """For HTTP GETting the data of the current players, JSON encoded."""
    return HttpResponse(serializers.serialize("json", Player.objects.all(), ensure_ascii=False ) )

def canvasall(request):
    """For HTTP GETting the all canvas, JSON encoded."""
    return HttpResponse(serializers.serialize("json", Canvas.objects.all(), ensure_ascii=False ))

@transaction.commit_on_success
def path_import( canvas, parametrit ):
    epoch = time.time()
    for segment in parametrit['segments']:
       datat = parametrit['segments'][segment]
       segmentti = Path()
       segmentti.ordernumber = segment
       segmentti.epoch = epoch
       segmentti.color = parametrit['color']
       segmentti.size  = parametrit['size']
       segmentti.pointx = datat['pointx']
       segmentti.pointy = datat['pointy']
       segmentti.handleInx = datat['handleInx']
       segmentti.handleIny = datat['handleIny']
       segmentti.handleOutx = datat['handleOutx']
       segmentti.handleOuty = datat['handleOuty']
       canvas.path_set.add(segmentti)
    canvas.save()
    return

#Give all the paths for given canvas from timestamp onward
@csrf_exempt
def canvasdiff( request, canvas_id, timestamp = 0 ):
    canvas = Canvas.objects.select_related().get(pk=canvas_id)
    if request.method == "POST":
     parametrit = simplejson.loads(urllib.unquote(request.body))
     path_import( canvas, parametrit )
     replicate( request )
     return HttpResponse(simplejson.dumps([{"response":"ok"}]))
    else:
     polling_time=600.0 #10min
     while canvas.path_set.filter(epoch__gt=float(timestamp)).count() == 0:
        time.sleep(0.2)
        polling_time -= 0.2
        if polling_time <= 0.0:
           return HttpResponse(status=304)
        canvas.path_set.update()
     time.sleep(0.05)
     canvas.path_set.update()
     return HttpResponse( serializers.serialize("json", canvas.path_set.filter(epoch__gt=float(timestamp)) ) )

#Clear the canvas from all the paths
@transaction.commit_on_success
def canvasclear( request, canvas_id ):
    canvas = Canvas.objects.select_related().get(pk=canvas_id)
    canvas.path_set.all().delete()
    replicate( request )
    return HttpResponse(status=200)


#Long-poll the guesses people have made
def guesses(request, timestamp = 0):
    aika = datetime.datetime.utcfromtimestamp(timestamp).replace(tzinfo=utc)
    """For HTTP GETting the guesses made on the current game, JSON encoded.
       If timestamp is given, give guesses that are younger than timestamp
       or block until such guess is made"""
    polling_time=600.0 #10min
    while len(Guess.objects.filter(aikaleima__gt=aika)) == 0:
          time.sleep(0.2)
          polling_time -= 0.2
          #If we have waited 10mins already, give not modified back
          if polling_time <= 0.0:
             return HttpResponse(status=304)
    return HttpResponse( serializers.serialize("json", Guess.objects.filter(aikaleima__gt=aika), ensure_ascii=False))

@csrf_exempt
def guess(request):
    """For HTTP POSTing a guess to the current game, JSON encoded(?)."""
    if request.method == "POST":
      parametrit = simplejson.loads(request.body)
      pelinodeinfo = HostNode.objects.get(hostname=platform.node()+".local")
      player = get_object_or_404(Player,nimi=str(parametrit['playername']))
      print player
      game_id = parametrit['canvas']
      game = Game.objects.get(uuid=game_id)
      guess = Guess(pelaaja=player,peli=game,arvaus=parametrit['guess'])
      guess.save()
      replicate( request )
      return HttpResponse("ok")
    return HttpResponse("not ok, use POST")

#Give all the connected nodes
def nodes(request):
    all_the_nodes = HostNode.objects.all()
    return HttpResponse( serializers.serialize("json", all_the_nodes, ensure_ascii=False ) )
