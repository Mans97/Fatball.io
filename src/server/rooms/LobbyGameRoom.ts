
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
    async onJoin(client: Client, options : any) {
        super.onJoin(client, options);
        this.lobbyName = options.roomName;
        client.userData = {username : options.username, lobbyName : options.roomName} // distributed data
        console.log('LOBBY: Joining of player ', client.userData.username, " in the room: ", client.userData.lobbyName)
        
        //check if user has started a game session before (for this specific game)
        /** enter again value is FALSE if the player was in the game before. Is true if the player is in the game now. */
        var enter_again = await this.presence.smembers(client.userData.lobbyName+"@"+client.userData.username) //if the game start now, this redis field is empty
        console.log("ENTER_AGAIN IS ", enter_again);
        if ( enter_again.includes('false') ){ //re-entering in the game
            console.log("pony sono qui");
            client.send("re_entering", {message:"Ok", room: client.userData.LobbyName, username: client.userData.username});
        }else if(!enter_again.includes('false') && (!enter_again.includes('true'))){  // so is empty because the game is not started yet. The player can enter
            console.log("\t MESSAGE: Enter again includes is empty: THIS IS THE FIRST TIME THAT YOU ENTER IN THIS GAME")
            // distributed
            this.addConnection(client) // adding connection to Redis
            this.broadcast("players", {counter : this.counter + 1, room : client.userData.lobbyName}) // sending the counter for the min. players required policy
            this.broadcast("+", { players : this.players, room : client.userData.lobbyName}) // adding username in the list
        
        }else{ //enter again contains true, so the player is already in the game
            console.log("\t\nERROR: enter_again contains true. This player is already in the game\n")
        }
        
        
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


        /**
         * If enter_again is empty: you can NOT enter;
         * if enter_again contains 'true': you can NOT enter;
         * if username is already in redis field, you can NOT enter;
         *
         * if username is not in redis field, you can enter;
         *          OR
         * if enter_again is false: you can enter (in this case username is FOR SURE in redis field)
         */
        if(!currentUsers.includes(username)){   // || enter_again.includes('false')
            // the current user is not in the topic, must be joined
            console.log('REDIS: Adding ', username, ' from the key ', client.userData.lobbyName, ' room')
            // adding the user to the room
            this.presence.sadd(client.userData.lobbyName, username)
            this.presence.sadd(client.userData.lobbyName+"@"+username, "false") //roomname@username

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