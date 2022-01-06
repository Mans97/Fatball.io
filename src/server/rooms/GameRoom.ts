import { Room, Client, RedisPresence } from "colyseus";
//import { State } from "./schema/State";
import { Schema, type, MapSchema } from "@colyseus/schema";
import { Entity } from "./schema/Entity";

const WORLD_SIZE = 2000;

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
    const player = this.players.get(sessionId)

    if (movement.x) {
      
      // player.x += movement.x * 1; //vecchia versione era: movement.x * 10
      // if (player.x < 0) { player.x = 0; }
      if (player.x > WORLD_SIZE) { player.x = WORLD_SIZE; }
      else { player.x += movement.x * 1; }
      if (player.x < 0) { player.x = 0; }
      else { player.x += movement.x * 1; }
      // if (player.y < 0) { player.y = 0; }
      // if (player.y > WORLD_SIZE) { player.y = WORLD_SIZE; }

    } else if (movement.y) {
      console.log(movement)
      if (player.y > WORLD_SIZE) { player.y = WORLD_SIZE; }
      else { player.y += movement.y * 1; }
      if (player.y < 0) { player.y = 0; }
      else { player.y += movement.y * 1; }
    }
  }
}

//const players:any = {}

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
        //console.log("this.state.players ",this.state.players.get(client.sessionId))
        //const player = this.state.players.get(client.sessionId)
        this.state.movePlayer(client.sessionId, data);
        //this.broadcast('move', data) 
        
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
