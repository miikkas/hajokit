from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'game.views.index'),
    url(r'^players/$', 'game.views.players'),
    url(r'^player/create/(?P<playername>.+)$', 'game.views.newplayer'),
    url(r'^player/create/(?P<playername>.+)/(?P<nodename>\w+)$', 'game.views.newplayer'),
    url(r'^player/(?P<playerid>\d+)/join/(?P<gameid>\d+)$', 'game.views.joingame'),
    url(r'^games/new$', 'game.views.newgame'),
    url(r'^games/new/(?P<nodename>\w+)$', 'game.views.newgame'),
    url(r'^games/$', 'game.views.listgames'),
    url(r'^games/(?P<gameid>\d+)/delete$', 'game.views.endgame'),
    url(r'^canvas/$', 'game.views.canvasall'),
    url(r'^canvas/(?P<canvas_id>\d+)/$', 'game.views.canvas'),
    url(r'^canvas/(?P<canvas_id>\d+)/diff$', 'game.views.canvasdiff'),
    url(r'^guesses/$', 'game.views.guesses'),
    url(r'^guess/$', 'game.views.guess'),
    url(r'^nodes/$', 'game.views.nodes'),

    # The admin URL:
    url(r'^admin/', include(admin.site.urls)),
)
