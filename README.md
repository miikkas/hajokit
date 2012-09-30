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

The API consists of the following URLs:

players/ : GET request. Lists all current players. Not used. Example output: [{"pk": "76d09e84-2368-402d-89e2-2621d059ae40", "model": "game.player", "fields": {"nimi": "jee", "pelinode": "ubuntunode3.local"}}, {"pk": "b1ca7495-3154-4128-b18d-61c35c27d579", "model": "game.player", "fields": {"nimi": "testiukko", "pelinode": "ubuntunode3.local"}}]

player/create/<playername> : GET request. Creates a new player with the given name. Example output: [{"pk": "5dad4763-3868-4c7f-9b13-ad6f094344e7", "model": "game.player", "fields": {"nimi": "pelimies", "pelinode": "ubuntunode3.local"}}]

player/create/<playername>/<player_uuid>/<nodename> : GET request. Like above, but includes a uuid/node where the player is connected. Not used.

player/<playername> : GET request. Returns 200 if a player with the given name exists, 404 otherwise.

player/<playerid>/join/<gameid> : GET request. Make the player join a game. Not used.

player/<playerid>/join/<gameid>/<nodename> As above, but includes a node name. Not used.

games/new : GET request. Create a new game. Returns game information in JSON format. Example output: [{"pk": "58bc7480-2d43-49cc-9da7-1f0e3098432f", "model": "game.game", "fields": {"pelikaynnissa": false, "canvas": "58bc7480-2d43-49cc-9da7-1f0e3098432f", "pelaajat": [], "pelinode": "ubuntunode3.local", "piirtaja": null}}]

games/new/<game_uuid>/<nodename> : GET request. As above, but includes a uuid/node name.

games/$ : GET request. List all available games. Response is in JSON. Example: [{"pk": "58bc7480-2d43-49cc-9da7-1f0e3098432f", "model": "game.game", "fields": {"pelikaynnissa": false, "canvas": "58bc7480-2d43-49cc-9da7-1f0e3098432f", "pelaajat": [], "pelinode": "ubuntunode3.local", "piirtaja": null}}]

games/<gameid>/delete$ : GET request. Deletes a given game. Not used.

games/<gameid>/delete/<nodename>  : GET request. As above, but includes a node name. Not used.

canvas/$ :GET request. Returns all the canvas data in JSON. Not used.

canvas/<canvas_id>/ : GET request. Returns all the paths drawn onto the given canvas in JSON.

canvas/<canvas_id>/<timestamp> : GET request. Like above, but only returns paths that are younger than the timestamp.

canvas/<canvas_id>/clear$ : GET request. Clears the canvas. Not used.

canvas/<canvas_id>/clear/.*$ : GET request. As above.

guesses/<canvas_id>/ : GET request. Returns all the guesses, or messages, related to the given canvas in JSON.

guesses/<canvas_id>/<timestamp> : GET request. As above, but returns guesses that are younger than the given timestamp.

guess/ : POST request. Send a guess to the server in JSON. Example: {"playername": "jukka", "guess": "talo", "canvas": 58bc7480-2d43-49cc-9da7-1f0e3098432f}

nodes/ : GET request. List all the nodes. Not used.

refresh/<nodename> : GET request. Refresh a given node. Not used.

remove/<nodename> : GET request. Remove a given node. Not used.

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
