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
  @type({ map: Entity })
  players = new MapSchema<Entity>();

  createPlayer(sessionId: string) {
      //oppure: this.players.set(sessionId, new Player());
      this.players.set(sessionId, new Player().assign({
        x: Math.random() * 200,
        y: Math.random() * 200,
        color: Number("0x" + Math.floor(Math.random()*16777215).toString(16)) 
      }));
  }

  removePlayer(sessionId: string) {
      this.players.delete(sessionId);
  }

  movePlayer (sessionId: string, movement: any) {
    console.log("MOVEMENT: ", movement)
    if (movement.x) {
      this.players.get(sessionId).x += movement.x * 1; //vecchia versione era: movement.x * 10
      //console.log("movement.y * 10 ", movement.x * 10) 

    } else if (movement.y) {
      console.log(movement)
      this.players.get(sessionId).y += movement.y * 1;  //vecchia versione era: movement.y * 10
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
        //this.state.movePlayer(client.sessionId, data);
        const player = this.state.players[client.sessionId]
        //this.broadcast('move', data) 
        players.
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
