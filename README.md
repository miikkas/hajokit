Hajokit
=======

Distributed Systems course work, team Hajokit

Table of Content
----------------
- Brief Description
- Installation
- Service Discovery
- Drawing
- Guessing
- Communication Between Browser and Server
- Communication Between Nodes


Brief Description
-----------------

We designed and implemented a distributed 'draw and guess' game. The implementation
lacks game logic for now, so it ended up more as a shared whiteboard/chat. The system
is running on 3 virtual machines located in the following addresses:
* [node 1](http://ubuntu_node1.porogrammer.fi/)
* [node 2](http://ubuntu_node2.porogrammer.fi/)
* [node 3](http://ubuntu_node3.porogrammer.fi/)

The implementation is done on top of [JQuery](http://www.jquery.org/) on browser-side and
drawing uses [Paper.js](http://paperjs.org/) heavily on path information. jquery.cookie is 
used for storing cookie information. The server side is implemented using 
[Django](http://www.djangoproject.com/) for the HTTP interface and a Python-made separated 
daemon for service discovery. The backend DB is MySQL and the OS for the virtual machines 
is ubuntu precise.

When the user loads the web page, javascript asks all the games (canvases) from the
connected node. If there aren't any canvases available or made, the script creates
one.

On chat functionality, the web page first asks a user name and creates a user account.
The user account / name is stored in the browser as a cookie but may be lost when the 
user restarts the browser. Canvas and chat content is stored in the nodes' db and is
persistent over browser or web server restarts.

Installation
------------

Root of this directory is deploy.sh that checks/install needed ubuntu packages and installs
django 1.4.1 and MySQL DB database that is used. /etc/init.d/hajokit-zeroconf is installed
to start SD-module. Currently init-script isn't able to stop the SD-module. Deploy-script also
configures apache to server django setup as default content.

Service Discovery
-----------------

Service discovery is done using mDNS service advertising via avahi in Linux. Avahi is
connected via dbus and advertised services are marked as '\_hajarit.\_.tcp'. The service
follows similar textual information as web services [DNS-SD](http://www.dns-sd.org/ServiceTypes.html).
Main information is the port and path, user information isn't used for now.

When the daemon finds any own services, it adds them to django's database and gives a notification 
to django via HTTP request. The same happens when a service is no longer advertised. The daemon 
notifies django so it can purge all the related data from DB.

Drawing
-------

Drawing is implemented using HTML5 2d canvas. The canvas is handled using paper.js framework. The 
user is given a few basic drawing tools (freehand, circle, rectangle, line and eraser). Also a basic 
set of colors are offered (black, red, green, blue, yellow) and a selection of different sizes.

When the user draws any form, it is sent to the server as a group of segments. Also when the browser
receives drawing info from server, it is served a group of segments after a given unixtime 
(timestamp can be 0).

Guessing
--------

In this phase of implementation, guessing is just text-based chat. The browser sends user name and text 
in json to the server, and also gets back json-formatted data on what others have said. Text messages are 
tied to a certain canvas, so we could implement different 'rooms'.


Communication between the browser and the server
----------------------------------------

Communication between the browser and the server is based on a RESTful-like API containing json-formatted
data. Communication utilizes AJAX long-polling with a 10min timeout time. Response time for chat-messages
is on average 350ms and for drawing data on average 100ms (serverside checking period rules how fast it
notifies about new data). The guess and drawing query apis also allow to give a unix timestamp to wait 
messages that appear after that certain timestamp. 

If the server doesn't get any new messages within a 10min period, it returns 304 to the browser and 
the browser-code can restart the query. The connection doesn't utilize HTTPS or any other encryption method.

Communication between nodes
---------------------------

Communication between nodes happens in mDNS via SD-daemon and in HTTP for propagading drawing and other
user-related data. When a node receives drawing info or a text message from a browser, it replicates the data
content to other nodes using the same HTTP RESTful interface. Node communication doesn't implement any
encryption or stronger authentication.


Internal info for the team
==========================
Perusflow
---------

**Vain ensimmäisellä kerralla:**  
``git clone https://github.com/miikkas/hajokit.git hajokit``  
  
**Jatkossa:**  
``git pull --rebase``
  
*ahkeraa koodausta*  
  
``git commit``
  
*ahkeraa koodausta*  
  
``git commit``  
``git pull --rebase``  
``git push``  
  
*uudestaan!*  


Virtuaalikoneet eli Nodet
-------------------------

ubuntu_node{1..3}.porogrammer.fi on apache virtuaalihostit
ssh portit 200{1..3} porogrammer.fi-osoitteesta ohjataan ko nodeihin.
