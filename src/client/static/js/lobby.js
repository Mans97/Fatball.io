
//var host = window.document.location.host.replace(/:.*/, '');
/*var client = new Colyseus.Client(location.protocol.replace("http", "ws") + "//" + host + (location.port ? ':' + location.port : ''));
var lobby;
var _username = ""
var _roomName = ""
import matchMaker from 'colyseus.js'

console.log('Scrivi qualcosa per favore ')
function precondition() {
    _username = document.getElementById("usernameField").value
    _roomName = document.getElementById("roomNameField").value

    if (_username == "" || _roomName == "") {
        alert('You need to insert username and room name to join or create!')
        return 0
    }
}

function createAndJoin() {
    precondition()
    console.log(`Connection of ${_username} on ${_roomName}`)
    client.joinOrCreate("lobby_room", // if not exists, onCreate and than onJoin
        {
            username: _username, // register in the client distributed instance
            roomId: _roomName // this.roomID
        }).then(room_instance => {
            lobby = room_instance;
            getLobbyList();
            onjoin();
            console.log("Joined lobby room!");

        }).catch(e => {
            console.error("Error", e);
        });
}

function onjoin() {
    lobby.onStateChange((state) => {
        console.log("Custom lobby state:", state);
    })

    lobby.onLeave(() => {
        allRooms = [];
        //update_full_list();
        console.log("Bye, bye!");
    });
}


function getLobbyList() {
    matchMaker.query("lobby_room").then(rooms => {
        rooms.forEach((room) => {
            var alreadyListed = []
            if (alreadyListed.includes(room.roomId)) {
            } else {
                console.log("BBB" + alreadyListed.includes(room.roomId))
                alreadyListed.push(room.roomId)
                console.log("AAAAAA " + alreadyListed.length)
                console.log("Room ID: " + room.roomId);
                console.log("Clients numbers: " + room.clients)
                var lobby_list = document.getElementById('lobby-list')
                row_room = ' <tr class="align-items-center"><th scope="row ">' + room.roomId + "</th><td>" +
                    room.clients + '</td><td><button class="btn btn-sm btn-primary" id="' + room.roomId + '">Join to Room</button></td>';
                lobby_list.innerHTML += row_room
            }
        });
    }).catch(e => {
        console.log('Error on listining rooms')
    });
}
function update_full_list() {
    // client.getAvailableRooms("lobby_room").then(rooms => {
    //     var room_listElement = document.getElementById('room_list')
    //     console.log(room_listElement)
    //     if (room_listElement == null) console.log('Element doesn\'t exist')
    //     else {
    //         room_listElement.innerHTML = ""
    //     }
    //     for (var i = 0; i < rooms.length; i++) {

    //         room_listElement.innerHTML = allRooms.map(function (room) {
    //             return "<li><code>" + JSON.stringify(room) + "</code></li>";
    //         })
    //     }
    // })

}


function leave() {
    if (lobby) {
        lobby.leave();

    } else {
        console.warn("Not connected.");
    }
}
*/