#!/usr/bin/env python
# -*- encoding: utf-8 -*-
from django.db import models

# Create your models here.


#Piirros on base64 koodattu piirrostilanne, tämän lisäksi muutokset
# kun pelaaja liittyy
class Piirros(models.Model):
    tilanne  = models.TextField()

#Muutos on Piirrokseen tulleet muutokset
class Muutos(models.Model):
    muutos   = models.TextField()
    alku     = models.ForeignKey(Piirros)

#Pelinode, eli virtuaali kone jossa joku pelaaja on kiinni
class PeliNode(models.Model):
    hostname = models.CharField(max_length=256)
    port     = models.PositiveIntegerField()
    path     = models.CharField(max_length=256)

#Pelaaja, pidetään tallessa missä nodessa on kiinni ja tunniste
class Pelaaja(models.Model):
    pelinode = models.ForeignKey(PeliNode)
    nimi     = models.CharField(max_length=256)

#Pelitilanne, kuka on piirtomuodossa ja mitä on piirretty
class Peli(models.Model):
    pelikaynnissa = models.BooleanField(default=False)
    pelinode      = models.ForeignKey(PeliNode)
    pelaajat      = models.ManyToManyField(Pelaaja)
    canvas        = models.ForeignKey(Piirros)
    piirtaja      = models.OneToOneField(Pelaaja,blank=True,null=True,related_name='+')
