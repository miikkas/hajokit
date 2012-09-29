#!/usr/bin/env bash

#asetetaan verbose mode niin näkee mitä tapahtuu
set -x

#hack'n'slash scripti projektin koodin asentamiseen ajoon ubuntu-ympäristössä

juurihakemisto=$( cd "$( dirname "$0" )" && pwd )
#Eli nyt ollaan projektin juuressa, sekä tiedetään missä projektin juuri on

sudo apt-get install --install-suggests -u libapache2-mod-wsgi python-avahi python-dbus python-prctl python-mysqldb mysql-server
# python-pip

#Asennetaan django 1.4.1 #FIXME
sudo apt-get remove python-django
#sudo pip install django
sudo easy_install https://www.djangoproject.com/download/1.4.1/tarball/

#konffataan settings kohdilleen
sed -i -e "s|/home/mdf/projects/hajokit|$juurihakemisto|g" ${juurihakemisto}/django-project/draw_and_guess/settings.py

#konffataan init.d-skripta kohdilleen
sed -i -e "s|/home/mdf/hajarit/hajokit/src/avahi|$juurihakemisto/src/avahi|g" ${juurihakemisto}/src/avahi/hajokit-zeroconf
sudo ln -s $juurihakemisto/src/avahi/hajokit-zeroconf /etc/init.d/hajokit-zeroconf
sudo update-rc.d hajokit-zeroconf defaults 99

#konffataan apache
sed -i -e "s|/home/hajokit/hajokit/django-project/draw_and_guess/wsgi.py|$juurihakemisto/django-project/draw_and_guess/wsgi.py|g" ${juurihakemisto}/apache_sites/hajokit
sed -i -e "s|/home/hajokit/hajokit/js|$juurihakemisto/js|g" ${juurihakemisto}/apache_sites/hajokit
sed -i -e "s|/home/hajokit/hajokit/css|$juurihakemisto/css|g" ${juurihakemisto}/apache_sites/hajokit
sudo cp apache_sites/hajokit /etc/apache2/sites-available/
sudo a2dissite default
sudo a2ensite hajokit
sudo a2enmod wsgi
sudo service apache2 reload
sudo service mysql start

#tehdään mysql kanta ja tunnari
echo "Creating MySQL DB and useraccount, please give mysql root pwd when asked"
echo "DROP DATABASE IF EXISTS hajokit; CREATE DATABASE hajokit; GRANT ALL PRIVILEGES ON hajokit.* TO \"hajokit\"@\"localhost\" IDENTIFIED BY \"hajarit2012\"; FLUSH PRIVILEGES;" | mysql -h localhost -u root -p

#tehdään tyhjä kanta jos ei ole olemassa
cd django-project && python manage.py syncdb --noinput

echo "Done"
