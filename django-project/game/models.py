#!/usr/bin/env python
# -*- encoding: utf-8 -*-
from django.db import models

# Create your models here.


#Piirros on base64 koodattu piirrostilanne, tämän lisäksi muutokset
# kun pelaaja liittyy
class Piirros(models.Model):
    tilanne   = models.TextField()
    aikaleima = models.DateTimeField(auto_now=True)

class SegmentGroup(models.Model):
    aikaleima   = models.DateTimeField(auto_now=True)
    color       = models.CharField(max_length=32)
    size        = models.PositiveIntegerField()
    segments    = models.ForeignKey(Piirros)

    def __unicode__(self):
       return "<Segmentgroup %d: color:%s size:%d paths:%s>" %(self.id,self.color,self.size,self.path_set.all())

#Muutos on Piirrokseen tulleet muutokset
class Path(models.Model):
    aikaleima   = models.DateTimeField(auto_now=True)
    segment     = models.ForeignKey(SegmentGroup)
    pointy      = models.PositiveIntegerField()
    pointx      = models.PositiveIntegerField()
    handleIny   = models.FloatField()
    handleInx   = models.FloatField()
    handleOuty  = models.FloatField()
    handleOutx  = models.FloatField()

    def __unicode__(self):
       return "<Path %d: point(%d,%d) in(%f,%f) out(%f,%f)>" %(self.id, self.pointx,self.pointy,self.handleInx,self.handleIny,self.handleOutx,self.handleOuty)

#Pelinode, eli virtuaali kone jossa joku pelaaja on kiinni
class PeliNode(models.Model):
    hostname = models.CharField(max_length=256,primary_key=True)
    port     = models.PositiveIntegerField()
    path     = models.CharField(max_length=256)

#Pelaaja, pidetään tallessa missä nodessa on kiinni ja tunniste
class Pelaaja(models.Model):
    uuid     = models.CharField(max_length=32,primary_key=True)
    pelinode = models.ForeignKey(PeliNode)
    nimi     = models.CharField(max_length=256)

#Pelitilanne, kuka on piirtomuodossa ja mitä on piirretty
class Peli(models.Model):
    uuid          = models.CharField(max_length=32,primary_key=True)
    pelikaynnissa = models.BooleanField(default=False)
    pelinode      = models.ForeignKey(PeliNode)
    pelaajat      = models.ManyToManyField(Pelaaja)
    canvas        = models.ForeignKey(Piirros)
    piirtaja      = models.OneToOneField(Pelaaja,blank=True,null=True,related_name='+')

#Guess that some player have made for game
class Guess(models.Model):
    aikaleima = models.DateTimeField(auto_now=True)
    pelaaja   = models.ForeignKey(Pelaaja)
    peli      = models.ForeignKey(Peli)
    arvaus    = models.TextField()
