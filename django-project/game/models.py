#!/usr/bin/env python
# -*- encoding: utf-8 -*-
from django.db import models


#Canvas is the id of the drawingboard that is used in game
class Canvas(models.Model):
    tilanne   = models.TextField()
    aikaleima = models.DateTimeField(auto_now=True)

#Path contains all the paths that are places on canvas
class Path(models.Model):
    aikaleima   = models.DateTimeField(auto_now=True)
    color       = models.CharField(max_length=32)
    size        = models.PositiveIntegerField()
    segments    = models.ForeignKey(Canvas)
    pointy      = models.PositiveIntegerField()
    pointx      = models.PositiveIntegerField()
    handleIny   = models.FloatField()
    handleInx   = models.FloatField()
    handleOuty  = models.FloatField()
    handleOutx  = models.FloatField()

#Gamenode, Info about hosts that are discovered
class HostNode(models.Model):
    hostname = models.CharField(max_length=255,primary_key=True)
    port     = models.PositiveIntegerField()
    path     = models.CharField(max_length=255)

#Player, info about the player that either draws or guesses
class Player(models.Model):
    uuid     = models.CharField(max_length=64,primary_key=True)
    pelinode = models.ForeignKey(HostNode)
    nimi     = models.CharField(max_length=255)

#Game, state of the game, who is drawing and the players who are joined
class Game(models.Model):
    uuid          = models.CharField(max_length=64,primary_key=True)
    pelikaynnissa = models.BooleanField(default=False)
    pelinode      = models.ForeignKey(HostNode)
    pelaajat      = models.ManyToManyField(Player)
    canvas        = models.ForeignKey(Canvas)
    piirtaja      = models.OneToOneField(Player,blank=True,null=True,related_name='+')

#Guess that some player have made for game
class Guess(models.Model):
    aikaleima = models.DateTimeField(auto_now=True)
    pelaaja   = models.ForeignKey(Player)
    peli      = models.ForeignKey(Game)
    arvaus    = models.TextField()
