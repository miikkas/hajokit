#!/usr/bin/env python
#-*- encoding:utf-8 -*-
#
# Hajokit ryhmän DNS-pohjainen service discovery
#  daemoni. Hyödyntää Avahi-kirjastoa ja mdns kyselyitä
#  ilmoittamaan oman sijaintinsa ja palvelun sekä etsimään
#  muut palvelun nodet. Pitäiskö pelit jne synkronoida tämän avulla?
import dbus
import gobject
import avahi
from dbus.mainloop.glib import DBusGMainLoop
from dbus import DBusException

import time

import platform

serviceName = platform.node()
serviceType = "_hajarit._tcp" #see http://www.dns-sd.org/ServiceTypes.html
servicePort = 8080
serviceTXT = ["path=/","u=hajarit","p=letmein"]
domain = ""
host = ""

#Tiedostokahva logitukseen
LOGFILE = None

group = None
bus = None
#Yritetään 12 kertaa vaihtaa nimeä
rename_count = 12

#django sqlite kanta
import sqlite3
#kannan sijainti
djangoDB = '/home/hajokit/hajokit/django-project/dag.db'
conn = None 
cursor = None

#Daemonisointi-koodi, esimerkki http://code.activestate.com/recipes/278731/
import os,sys

sys.path.append(os.path.dirname(__file__))

from daemonize import createDaemon

def initdb():
    global conn, cursor
    conn = sqlite3.connect(djangoDB)
    cursor = conn.cursor()

#common logging
def log(*args):
    global LOGFILE
    if LOGFILE is None:
       LOGFILE = open("/tmp/"+serviceName+"_avahi_daemon.log","a")
    LOGFILE.write(time.ctime()+" ")
    LOGFILE.write("".join(args))
    LOGFILE.write("\n")
    LOGFILE.close()
    LOGFILE = None

#Adding avahi service for http service
def add_service():
    global group, serviceName, serviceType, servicePort, serviceTXT, domain, host, bus
    if group is None:
        group = dbus.Interface(
                 bus.get_object( avahi.DBUS_NAME, server.EntryGroupNew()),
                 avahi.DBUS_INTERFACE_ENTRY_GROUP )
        group.connect_to_signal('StateChanged', entry_group_state_changed )
    

    group.AddService(
        avahi.IF_UNSPEC,
        avahi.PROTO_UNSPEC,
        dbus.UInt32(0),
        serviceName, serviceType,
        domain, host,
        dbus.UInt16(servicePort),
        avahi.string_array_to_txt_array(serviceTXT))
    group.Commit()

def remove_service():
    global group
    if not group is None:
        group.Reset()

def server_state_changed(state):
    if state == avahi.SERVER_COLLISION:
        log("Server collision, removing service")
        remove_service()
    elif state == avahi.SERVER_RUNNING:
        log("Service running, adding service")
        add_service()

def entry_group_state_changed( state, error):
    global serviceName, server, rename_count


    if state == avahi.ENTRY_GROUP_COLLISION:
        rename_count -= 1
        log("Name collision")
        if rename_count:
            log("Changing name")
            serviceName = server.GetAlternativeServiceName(serviceName)
            remove_service()
            add_service()
        else:
            log("Giving up, no hope anymore")
            main_loop.quit()
    elif state == avahi.ENTRY_GROUP_FAILURE:
        log("Entry group failure,givin up")
        main_loop.quit()
        return

#Discovery parts
def service_resolved(*args):
    if cursor.execute("SELECT * FROM game_pelinode where hostname = ?",(args[2]+".local",)).fetchone() is None:
        txt = dict(item.split('=') for item in avahi.txt_array_to_string_array(args[9]))
        serviceentry = (args[2]+".local",args[8],txt["path"])
        log("New entry to DB:"+args[2]+" ")
        cursor.execute('INSERT INTO game_pelinode(hostname,port,path) VALUES(?,?,?)', serviceentry)
        conn.commit()


def print_error(*args):
    log("Error:"+args)

def remove_service( interface, protocol, name, stype, domain, flags):

    if flags & avahi.LOOKUP_RESULT_LOCAL:
        pass

    log("Removing service:"+name)
    cursor.execute('DELETE FROM game_pelinode where hostname = ?',(name+".local",))
    conn.commit()

def new_service( interface, protocol, name, stype, domain, flags):

    if flags & avahi.LOOKUP_RESULT_LOCAL:
        pass

    #Jos ei löydy kannasta, lisätään
    log("Adding service "+" ".join([name,stype,domain]))
    server.ResolveService(interface, protocol, name, stype,
            domain, avahi.PROTO_UNSPEC, dbus.UInt32(0),
            reply_handler=service_resolved, error_handler=print_error)


if __name__ == "__main__":
   retCode = createDaemon()

   log("Daemonized with code "+str(retCode)+" setting up avahi")
   DBusGMainLoop( set_as_default=True )
   bus = dbus.SystemBus()
   
   log("Opening DB")
   initdb()

   log("Cleaning up DB")
   cursor.execute('DELETE FROM game_pelinode')
   conn.commit()


   server = dbus.Interface(
               bus.get_object( avahi.DBUS_NAME, avahi.DBUS_PATH_SERVER ),
               avahi.DBUS_INTERFACE_SERVER )
   log("Advertisement setup done")
   print serviceType

   server.connect_to_signal( "StateChanged", server_state_changed )
   server_state_changed( server.GetState() )

   sbrowser = dbus.Interface( bus.get_object(avahi.DBUS_NAME,
               server.ServiceBrowserNew( avahi.IF_UNSPEC,
                    avahi.PROTO_UNSPEC, serviceType, 'local', dbus.UInt32(0))),
               avahi.DBUS_INTERFACE_SERVICE_BROWSER)

   sbrowser.connect_to_signal("ItemNew", new_service)
   sbrowser.connect_to_signal("ItemRemove", remove_service)


   log("Discovery setup done")

   gobject.MainLoop().run()
   group.Free()

