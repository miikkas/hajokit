#!/usr/bin/env bash

#hack'n'slash scripti projektin koodin asentamiseen ajoon ubuntu-ympäristössä

juurihakemisto=$( cd "$( dirname "$0" )" && pwd )
#Eli nyt ollaan projektin juuressa, sekä tiedetään missä projektin juuri on

sudo apt-get install --install-suggests -u python-pip libapache2-mod-wsgi python-avahi python-dbus
#Asennetaan django 1.4.1 #FIXME
sudo pip install django

#konffataan settings kohdilleen
sed -i -e "s|/home/mdf/projects/hajokit|$juurihakemisto|g" ${juurihakemisto}/django-project/draw_and_guess/settings.py

sudo cp apache_sites/hajokit /etc/apache2/sites-available/
sudo a2dissite default
sudo a2ensite hajokit
sudo a2enmod wsgi
sudo service apache2 reload
