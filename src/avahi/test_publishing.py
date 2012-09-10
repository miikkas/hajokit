#!/usr/bin/env python
# -*- encoding: utf-8 -*-

import dbus
import gobject
import avahi
from dbus.mainloop.glib import DBusGMainLoop

import platform

serviceName = platform.node()
serviceType = "_hajarit._tcp" #see http://www.dns-sd.org/ServiceTypes.html
servicePort = 8080
serviceTXT = ["path=/","u=hajarit","p=letmein"]

domain = ""
host = ""

group = None
rename_count = 12

def add_service():
    global group, serviceName, serviceType, servicePort, serviceTXT, domain, host
    if group is None:
        group = dbus.Interface(
                 bus.get_object( avahi.DBUS_NAME, server.EntryGroupNew()),
                 avahi.DBUS_INTERFACE_ENTRY_GROUP )
        group.connect_to_signal('StateChanged', entry_group_state_changed )
    
    print "Adding service '%s' of type '%s' .." %(serviceName, serviceType)

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
        print "Server name collision"
        remove_service()
    elif state == avahi.SERVER_RUNNING:
        add_service()

def entry_group_state_changed( state, error):
    global serviceName, server, rename_count

    print "State changed: %i" % state

    if state == avahi.ENTRY_GROUP_ESTABLISHED:
        print "Service established."
    elif state == avahi.ENTRY_GROUP_COLLISION:
        rename_count -= 1
        if rename_count:
            serviceName = server.GetAlternativeServiceName(serviceName)
            print "Service name collision, changing name to '%s'.." % serviceName
            remove_service()
            add_service()
        else:
            print "No suitable service name found, exiting"
            main_loop.quit()
    elif state == avahi.ENTRY_GROUP_FAILURE:
        print "Error in group state changed", error
        main_loop.quit()
        return

if __name__ == '__main__':
    DBusGMainLoop( set_as_default=True )

    main_loop = gobject.MainLoop()
    bus = dbus.SystemBus()

    server = dbus.Interface(
                bus.get_object( avahi.DBUS_NAME, avahi.DBUS_PATH_SERVER ),
                avahi.DBUS_INTERFACE_SERVER )
    server.connect_to_signal( "StateChanged", server_state_changed )
    server_state_changed( server.GetState() )

    try:
        main_loop.run()
    except KeyboardInterrupt:
        pass

    if not group is None:
        group.Free()
