
import { Schema, type } from "@colyseus/schema";
import { Client, LobbyRoom} from "colyseus";

class LobbyState extends Schema {
    @type('number') connectionsCounter : number = 0; // counter number of total players
}


export class LobbyGameRoom extends LobbyRoom {

    // lobbyRoomChannel set a channel in redis for lobbies
    lobbyRoomChannel = "$LobbyRoomChannel"
    
    // metadata
    private usernameList : string[] = []
    private lobbyCounter : number = 0
    private lobbyName : string;
    removeUsername(username : string ){
        this.usernameList = this.usernameList.filter(function(e) { return e !== username })
    }

    async onCreate(options : any) {
        await super.onCreate(options);
        this.setState(new LobbyState()); // init the distributed state
        this.lobbyName = options.roomId
        this.presence
        this.onMessage("usernamesRequest", (client, message) => {
            this.broadcast("+", this.usernameList) // broadcast on group of players for missplaced update
        });
    }

    onJoin(client: Client, options : any) {
        super.onJoin(client, options);
        client.userData = {username : options.username} // distributed data
        this.usernameList.push(options.username)
        this.lobbyCounter++
        console.log('Lobby Counter Player: ' + this.lobbyCounter)
        this.broadcast("players", this.lobbyCounter)
        this.broadcast("+", this.usernameList) // adding username in the list
    }

    onLeave(client : any) {
        super.onLeave(client);
        this.removeUsername(client.userData.username)
        this.lobbyCounter--
        this.broadcast("players", this.lobbyCounter)
        this.broadcast("-", this.usernameList) // remove client username in the distributed list
        this.state.counter--;
    }
    
    
}