from django.db import models

# Create your models here.

#Pelinode, eli virtuaali kone jossa joku pelaaja on kiinni
class PeliNode(models.Model):
    hostname = models.CharField(max_length=256)
    port     = models.PositiveIntegerField()
    path     = models.CharField(max_length=256)

#Pelaaja, pidetään tallessa missä nodessa on kiinni ja tunniste
class Pelaaja(models.Model):
    pelinode = models.ForeingKey('PeliNode')
    nimi     = models.CharField(max_length=256)

#Muutos on Piirrokseen tulleet muutokset
class Muutos(models.Model):
    muutos   = models.TextField()
    alku     = models.ForeingKey('Piirros')

#Piirros on base64 koodattu piirrostilanne, tämän lisäksi muutokset
# kun pelaaja liittyy
class Piirros(models.Model):
    tilanne  = models.TextField()

#Pelitilanne, kuka on piirtomuodossa ja mitä on piirretty
class Peli(models.Model):
    piirtaja = models.ForeingKey('Pelaaja')
    tilanne  = models.ForeingKey('Piirros')
