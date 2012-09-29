Hajokit
=======

Distributed Systems coursework, team Hajokit

Table Of Content
----------------
- Brief Description
- Service Discovery
- Drawing
- Guessing
- Communication between browser and server
- Communication between nodes


Brief Description
-----------------

We designed and implemented distributed 'draw and guess' game. Implementation
lacks game logic for now, so it ended up more as shared whiteboard/chat. System
is running on 3 virtual machines located in following addresses:
* [node 1](http://ubuntu_node1.porogrammer.fi/)
* [node 2](http://ubuntu_node2.porogrammer.fi/)
* [node 3](http://ubuntu_node3.porogrammer.fi/)

Implementation is done on top of [JQuery](http://www.jquery.org/) on browserside and
drawing uses heavily [Paper.js](http://paperjs.org/) on path information. Serverside
is implemented using [Django](http://www.djangoproject.com/) for HTTP-interface and
python made separated daemon for service discovery. Backend DB is MySQL and OS for virtual
machines is ubuntu precise.

When user loads webpage, javascript asks all games (canvases) from the
connected node, if there isn't any canvases available or made, script creates
one.

On chat functionality webpage asks username first and creates useraccount,
useraccount isn't stored for now in browser and is lost when user reloads page
or restarts browser. Canvas and chat content is stored in nodes db and is
persistent over browser or webserver restarts.

Service Discovery
-----------------

Service discovery is done using mDNS service advertising via avahi in linux. Avahi is
connected via dbus and advertised service are marked as '\_hajarit.\_.tcp'. Service
follows similar textual information as webservices [DNS-SD](http://www.dns-sd.org/ServiceTypes.html).
Main information is port and path, user information isn't used for now.

When daemon finds any own services, it adds them to djangos database and gives notify to
django via HTTP request. Same happens when service is no longer advertised, daemon notifies
django so it can purge all the related data from DB.

Drawing
-------

Drawing is implemented using HTML5 2d canvas, canvas is handled using paper.js framework. User
is given few basic drawing tools (freehand, circle, rectangle, line and eraser). Also basic set
of colors are offered (black, red, green, blue, yellow) and selection of different sizes.

When user draws any form, it is send to the server as group of segments. Also when browser
receives drawing info from server, it is served as group of segments from given unixtime onward
(timestamp can be 0).

Guessing
--------

In this phase of implementation, guessing is just text-based chat. Browser sends user and text in json
to server, and also gets back json formated data on what others have said. Text messages are tied to 
certain canvas, so we could implement different 'rooms'.


Communication between browser and server
----------------------------------------

Communication between browser and server is based on RESTfull-like API containing json-formated
data. Communication utilizes ajax long-polling with 10min timeout time. Response time for chat-messages
is on average 350ms and on drawing data on average 100ms (serverside checking period rules how fast it
notifies about new data). Guess and drawing query api also allow to give unix timestamp to wait messages
that appear after that certain timestamp. 

If server doesn't get any new messages within 10min period, it returns 304 to the browser and browser-code
can restart the query. Connection doesn't utilize HTTPS or any other encryption method.

Communication between nodes
---------------------------

Communication between nodes happens in mDNS via SD-daemon and in HTTP for propagading drawing and other
user related data. When node receives drawing info or text message from browser, it replicates the data
content to other nodes using same HTTP RESTfull interface. Node communication doesn't implement any
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
