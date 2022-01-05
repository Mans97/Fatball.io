import { Room, Client, RedisPresence } from "colyseus";
//import { State } from "./schema/State";
import { Schema, type, MapSchema } from "@colyseus/schema";
import { Entity } from "./schema/Entity";


export class Player extends Entity {
  constructor() {
      super();
      this.radius = 100;
  }
}

export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();

  something = "This attribute won't be sent to the client-side";

  createPlayer(sessionId: string) {
      //oppure: this.players.set(sessionId, new Player());
      this.players.set(sessionId, new Player().assign({
        x: Math.random() * 200,
        y: Math.random() * 200
      }));
  }

  removePlayer(sessionId: string) {
      this.players.delete(sessionId);
  }

  movePlayer (sessionId: string, movement: any) {
    if (movement.x) {
      this.players.get(sessionId).x += movement.x * 10;
    } else if (movement.y) {
      console.log(movement)
      this.players.get(sessionId).y += movement.y * 10;
    }
  }
}

const players:any = {}

export class GameRoom extends Room<State> {

  onCreate (options: any) {
    this.setState(new State());

    /*this.onMessage("keydown", (client, message) => { //keydown è il nome del message che arriva al server 
        this.broadcast('keydown', message, { //lo invio a tutti
          except: client //tranne che a me stesso
        }) 
    });*/


    this.onMessage("move", (client, data) => {
        console.log("StateHandlerRoom received message from", client.sessionId, ":", data);
        this.state.movePlayer(client.sessionId, data);
        this.broadcast('move', data, { except: client }) 
    });

  }



  onJoin (client: Client, options: any) {
    console.log(client.sessionId, " joined!");
    console.log(options.name, " joined!");
    //create the player
    this.state.createPlayer(client.sessionId);
  
  
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
