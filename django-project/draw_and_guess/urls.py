from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'game.views.index'),
    url(r'^players/$', 'game.views.players'),
    url(r'^canvas/$', 'game.views.canvas'),
    url(r'^guesses/$', 'game.views.guesses'),
    url(r'^guess/$', 'game.views.guess'),

    # The admin URL:
    url(r'^admin/', include(admin.site.urls)),
)
