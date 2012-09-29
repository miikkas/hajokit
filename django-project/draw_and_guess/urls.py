from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'game.views.index'),
    url(r'^players/$', 'game.views.players'),
    url(r'^player/create/(?P<playername>[\w ]+)$', 'game.views.newplayer'),
    url(r'^player/create/(?P<playername>[\w ]+)/(?P<player_uuid>[\w-]+)/(?P<nodename>[\w\.]+)$', 'game.views.newplayer'),
    url(r'^player/(?P<playerid>[\w-]+)/join/(?P<gameid>[\w-]+)$', 'game.views.joingame'),
    url(r'^player/(?P<playerid>[\w-]+)/join/(?P<gameid>[\w-]+)/(?P<nodename>[\w\.]+)$', 'game.views.joingame'),
    url(r'^games/new$', 'game.views.newgame'),
    url(r'^games/new/(?P<game_uuid>[\w-]+)/(?P<nodename>[\w\.]+)$', 'game.views.newgame'),
    url(r'^games/$', 'game.views.listgames'),
    url(r'^games/(?P<gameid>[\w-]+)/delete$', 'game.views.endgame'),
    url(r'^games/(?P<gameid>[\w-]+)/delete/(?P<nodename>[\w\.]+)$', 'game.views.endgame'),
    url(r'^canvas/$', 'game.views.canvasall'),
    url(r'^canvas/(?P<canvas_id>[\w-]+)/$', 'game.views.canvasdiff'),
    url(r'^canvas/(?P<canvas_id>[\w-]+)/(?P<timestamp>\d+\.?\d*)$', 'game.views.canvasdiff'),
    url(r'^canvas/(?P<canvas_id>[\w-]+)/clear$', 'game.views.canvasclear'),
    url(r'^canvas/(?P<canvas_id>[\w-]+)/clear/.*$', 'game.views.canvasclear'),
    url(r'^guesses/(?P<canvas_id>)/$', 'game.views.guesses'),
    url(r'^guesses/(?P<canvas_id>)/(?P<timestamp>\d+)$', 'game.views.guesses'),
    url(r'^guess/$', 'game.views.guess'),
    url(r'^nodes/$', 'game.views.nodes'),
    url(r'^refresh/(?P<nodename>[\w\.]+)$', 'game.views.refresh'),
    url(r'^remove/(?P<nodename>[\w\.]+)$', 'game.views.remove'),

    # The admin URL:
    url(r'^admin/', include(admin.site.urls)),
)
