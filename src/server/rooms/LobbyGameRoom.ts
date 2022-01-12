
import { Client, LobbyRoom} from "colyseus";


export class LobbyGameRoom extends LobbyRoom {
    
    // local variables from Redis operations
    private players : string[] = [] // used for the current player list (from Redis)
    private isGameStarting = false; // used for the temporal game status
    private counter : number = 0 // current player counter (from Redis)
    private lobbyName : string;
    removeUsername(username : string ){
        this.players= this.players.filter(function(e) { return e !== username })
    }

    async onCreate(options : any) {
        await super.onCreate(options);
        // this message is triggered on the start button in one of the player of the lobby

        this.onMessage("initGame", (client, message) =>{
            this.isGameStarting = true

            this.broadcast("startGame", {room : client.userData.lobbyName, username : client.userData.username}) // void because it is only a redirect for now
        })

        // forwarding of the adding player in the client if the first update failed
        this.onMessage("usernamesRequest", (client, message) => {
            this.broadcast("+", {players : this.players, room : client.userData.lobbyName}) // broadcast on group of players for missplaced update
        });
    }

    // event-driven when the client is joined to the lobby
    onJoin(client: Client, options : any) {
        super.onJoin(client, options);
        this.lobbyName = options.roomName;
        client.userData = {username : options.username, lobbyName : options.roomName} // distributed data
        console.log('LOBBY: Joining of player ', client.userData.username, " in the room: ", client.userData.lobbyName)
        // distributed
        this.addConnection(client) // adding connection to Redis
        this.broadcast("players", {counter : this.counter + 1, room : client.userData.lobbyName}) // sending the counter for the min. players required policy
        this.broadcast("+", { players : this.players, room : client.userData.lobbyName}) // adding username in the list
        
    }

    // called on the disconnection in manual use
    async onDispose(){
            // do nothing 
    }

    // called when the player leave the room, it is not synchronius way for the Redis updating.
    async onLeave(client : Client) {
        super.onLeave(client);
        if(!this.isGameStarting){
            this.isGameStarting = false;
            this.lobbyName = client.userData.lobbyName
            console.log('LOBBY: Removing of player ' + client.userData.username, " in the room ", client.userData.lobbyName)
            this.removeConnection(client)
            this.broadcast("players", {counter : this.counter - 1, room : client.userData.lobbyName})
            this.broadcast("-", { players : this.players, room : client.userData.lobbyName}) // remove client username in the distributed list            
        }
    }

    /* Redis Functions */
    private async addConnection(client : Client){
        // current users assigned to the topic of the room
        var currentUsers = await this.presence.smembers(client.userData.lobbyName)
        // getting the username from the client user data
        const username = client.userData.username
        if(!currentUsers.includes(username)){
            // the current user is not in the topic, must be joined
            console.log('REDIS: Adding ', username, ' from the key ', client.userData.lobbyName, ' room')
            // adding the user to the room
            this.presence.sadd(client.userData.lobbyName, username)
            currentUsers = await this.presence.smembers(client.userData.lobbyName)
            this.counter = currentUsers.length // updating of the number of users
            this.players = currentUsers // updating of the user list
            
        } else {
            // do nothing, the user is already a member
            client.send("errorUsername", {}) // void message to notify the client of username already taken for the room
        }
    }

    // remove a connection from the Rooom
    private async removeConnection(client : Client){
        if(client.userData.username != null && this.presence.exists(client.userData.lobbyName) && 
        this.presence.sismember(client.userData.lobbyName, client.userData.username)){
            var users = await this.presence.smembers(client.userData.lobbyName)
            console.log("REDIS: Removing ", client.userData.username, "from key ", client.userData.lobbyName)
            this.presence.srem(client.userData.lobbyName, client.userData.username)

            users = await this.presence.smembers(client.userData.lobbyName)
            this.counter = users.length // updating of the number of user
            this.players = users // updating of the user list

        }
    }

    
    
}