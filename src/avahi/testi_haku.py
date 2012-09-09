#!/usr/bin/env python
# -*- encoding:utf-8 -*-

import dbus, gobject, avahi
from dbus import DBusException
from dbus.mainloop.glib import DBusGMainLoop

TYPE = '_hajarit._tcp'

servicelist = {}

def print_services():
    print "Services:"
    for service in servicelist.keys():
        print "https://%s.local:%s%s" % (service,servicelist[service][0],servicelist[service][1]["path"])

def service_resolved(*args):
    if args[2] not in servicelist:
        txt = dict(item.split('=') for item in avahi.txt_array_to_string_array(args[9]))
        servicelist[args[2]]=[args[8],txt]
        print_services()


def print_error(*args):
    print 'error handler'
    print args[0]

def remove_service( interface, protocol, name, stype, domain, flags):

    if flags & avahi.LOOKUP_RESULT_LOCAL:
        pass

    if name in servicelist:
       print 'Removing service "%s" type "%s" domain "%s" ' %(name, stype, domain)
       del servicelist[name]
       print_services()



def new_service( interface, protocol, name, stype, domain, flags):

    if flags & avahi.LOOKUP_RESULT_LOCAL:
        pass

    if name not in servicelist:
        print 'Found service "%s" type "%s" domain "%s" ' %(name,stype,domain)
        server.ResolveService(interface, protocol, name, stype,
            domain, avahi.PROTO_UNSPEC, dbus.UInt32(0),
            reply_handler=service_resolved, error_handler=print_error)


loop = DBusGMainLoop()

bus = dbus.SystemBus(mainloop=loop)

server = dbus.Interface( bus.get_object(avahi.DBUS_NAME, '/'),
            'org.freedesktop.Avahi.Server')

sbrowser = dbus.Interface( bus.get_object(avahi.DBUS_NAME,
               server.ServiceBrowserNew( avahi.IF_UNSPEC,
                    avahi.PROTO_UNSPEC, TYPE, 'local', dbus.UInt32(0))),
               avahi.DBUS_INTERFACE_SERVICE_BROWSER)

sbrowser.connect_to_signal("ItemNew", new_service)
sbrowser.connect_to_signal("ItemRemove", remove_service)

gobject.MainLoop().run()
