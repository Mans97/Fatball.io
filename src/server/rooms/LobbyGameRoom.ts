
import { Schema, type } from "@colyseus/schema";
import { Client, LobbyRoom } from "colyseus";

// Customization for the joining or creating room
export function isValidId(id: string) { return id && /^[a-zA-Z0-9_\-]{9}$/.test(id); } 

class LobbyState extends Schema {
    @type('number') counter : number = 0; // counter number of total players
}

export class LobbyGameRoom extends LobbyRoom {
    async onCreate(options : any) {
        await super.onCreate(options);
        this.setState(new LobbyState()); // init the distributed state
        this.roomId = options.roomId
    }

    onJoin(client: Client, options : any) {
        super.onJoin(client, options);
        client.userData = {username : options.username} // distributed data
        this.state.counter++
    }

    onLeave(client : any) {
        super.onLeave(client);
        this.state.counter--;
    }
}