#!/usr/bin/env bash

#hack'n'slash scripti projektin koodin asentamiseen ajoon ubuntu-ympäristössä

juurihakemisto=$( cd "$( dirname "$0" )" && pwd )
#Eli nyt ollaan projektin juuressa, sekä tiedetään missä projektin juuri on

sudo apt-get install --install-suggests -u python-pip libapache2-mod-wsgi python-avahi python-dbus python-prctl python-mysqldb mysql-server

#Asennetaan django 1.4.1 #FIXME
sudo apt-get remove python-django
sudo pip install django

#konffataan settings kohdilleen
sed -i -e "s|/home/mdf/projects/hajokit|$juurihakemisto|g" ${juurihakemisto}/django-project/draw_and_guess/settings.py

sudo cp apache_sites/hajokit /etc/apache2/sites-available/
sudo a2dissite default
sudo a2ensite hajokit
sudo a2enmod wsgi
sudo service apache2 reload
sudo service mysql start

#tehdään mysql kanta ja tunnari
echo "Creating MySQL DB and useraccount, please give mysql root pwd when asked"
echo "CREATE DATABASE IF NOT EXISTS hajokit; GRANT ALL PRIVILEGES ON hajokit.* TO \"hajokit\"@\"localhost\" IDENTIFIED BY \"hajarit2012\"; FLUSH PRIVILEGES;" | mysql -h localhost -u root -p

#tehdään tyhjä kanta jos ei ole olemassa
cd django-project && python manage.py syncdb --noinput

echo "Done"
