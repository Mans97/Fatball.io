import { Room, Client, RedisPresence } from "colyseus";
//import { State } from "./schema/State";
import { Schema, type, MapSchema } from "@colyseus/schema";
import { Entity } from "./schema/Entity";
import { generateId } from "colyseus";

const WORLD_SIZE = 2000;

export class Player extends Entity {
  constructor() {
    super();
    this.radius = 20;
    this.minimun_radius = 15;
    this.maximum_radius = 250;
  }
}

export class Bullet{
  speed = 1;
  born = 0;
  direction = 0;
  xSpeed = 0;
  ySpeed = 0;
  constructor() {
    this.speed = 1;
    this.born = 0;
    this.direction = 0;
    this.xSpeed = 0;
    this.ySpeed = 0;
  }
}

export class State extends Schema {
  @type({ map: Entity })
  players = new MapSchema<Entity>();

  //@type({ map: Entity })
  //foods = new MapSchema<Entity>();

  createPlayer(sessionId: string) {
    const color = Number(
      "0x" + Math.floor(Math.random() * 16777215).toString(16)
    );
    //oppure: this.players.set(sessionId, new Player());
    this.players.set(
      sessionId,
      new Player().assign({
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE,
        radius: 20, //initial radius
        color: color,
        border_color: color,
        name: sessionId,
        your_bullets: 1,
        points: 0,
        minimun_radius: 15, //if reach this radius, the player will die
      })
    );
  }

  createFood() {
    const food = new Entity().assign({
      x: Math.random() * WORLD_SIZE,
      y: Math.random() * WORLD_SIZE,
      radius: 10,
    });
    this.players.set(generateId(), food);
  }

  movePlayer(sessionId: string, movement: any) {
    //console.log("MOVEMENT: ", movement);
    const player = this.players.get(sessionId);
    if (!player) {
      //dead players cannot move
      console.log("\t\t Dead player cannot move! ");
      return;
    }
    if (movement.x) {
      if (player.x > WORLD_SIZE) {
        player.x = WORLD_SIZE;
      } else {
        if (player.radius >= 15 && player.radius <= 80)
          player.x += movement.x * 5;
        else if (player.radius > 80 && player.radius <= 160)
          player.x += movement.x * 3.5;
        else player.x += movement.x * 2.5;
      }
      //boundaries for x
      if (player.x < 0) {
        player.x = 0;
      } else {
        if (player.radius >= 15 && player.radius <= 80)
          player.x += movement.x * 5;
        else if (player.radius > 80 && player.radius <= 160)
          player.x += movement.x * 3.5;
        else player.x += movement.x * 1.5;
      }
    } else if (movement.y) {
      //console.log(movement);
      if (player.y > WORLD_SIZE) {
        player.y = WORLD_SIZE;
      } else {
        if (player.radius >= 15 && player.radius <= 80)
          player.y += movement.y * 5;
        else if (player.radius > 80 && player.radius <= 160)
          player.y += movement.y * 3.5;
        else player.y += movement.y * 2.5;
      }
      //boundaries for y
      if (player.y < 0) {
        player.y = 0;
      } else {
        if (player.radius >= 15 && player.radius <= 80)
          player.y += movement.y * 5;
        else if (player.radius > 80 && player.radius <= 160)
          player.y += movement.y * 3.5;
        else player.y += movement.y * 2.5;
      }
    }
  }

  update() {
    //console.log("\t\t ----------- Update in room ----------- ")
    const deadPlayers: string[] = [];
    this.players.forEach((player, sessionId) => {
      if (player.dead) {
        deadPlayers.push(sessionId);
        return;
      }

      this.players.forEach((collidePlayer, collideSessionId) => {
        if (collidePlayer == player) {
          //no collision allowed with the same player (current player)
          return;
        }

        /** you can eat only the food, so your radius has to be more bigger than the collide object and
         * the collided object CANNOT be an other player. So the radius of the
         * collided object has to be 10 (only the food will have 10 of radius).
         *
         * ** The minimun radius of players will be > 10 (for exaple 15 is a good minimun radius for every player)
         */
        if (
          player.radius > collidePlayer.radius &&
          collidePlayer.radius == 10
        ) {
          //check if there is the collision (use of distance between the objects)
          /**
           * If the distance between the objects is less than the sum of the two
           * radius, there is a collision because the objects are overlapped
           */
          if (
            player.radius + collidePlayer.radius >=
            Entity.distance(player, collidePlayer)
          ) {
            //if the sum of two radius is more bigger than the distance, there is the collision
            //console.log("\t\tCollision")
            deadPlayers.push(collideSessionId); // this elements will be removed
            this.createFood();
            if (player.radius <= player.maximum_radius)
              player.radius += collidePlayer.radius - 5; //increase the radius of player
              player.your_bullets += 1 //increase the bullets of the player
          }
        }
      });
    });
    
    // delete all dead entities
    deadPlayers.forEach((sessionId) => {
      if (this.players.get(sessionId).radius == 10){
        this.players.delete(sessionId);
        console.log("One piece of food remove: ", sessionId);
      }else{
        this.players.delete(sessionId);
        console.log("Player removed from game: ", sessionId);
      }
     
    });
  }


  shot_a_bullet(sessionId: string, shot_Data: any){
    console.log("start the shot");
  }



}

export class GameRoom extends Room<State> {
  onCreate(options: any) {
    this.setState(new State());
    //add food
    for (let i = 0; i < 25; i++) {
      this.state.createFood();
    }

    /*this.onMessage("keydown", (client, message) => { //keydown è il nome del message che arriva al server 
        this.broadcast('keydown', message, { //lo invio a tutti
          except: client //tranne che a me stesso
        }) 
    });*/

    //on move
    this.onMessage("move", (client, data) => {
      //console.log("Received message from",client.sessionId,":",data);
      this.state.movePlayer(client.sessionId, data);
    });

    //on shot
    this.onMessage("shot", (client, data) => {
      console.log("Received message from",client.sessionId,":",data);
      if(this.state.players.get(client.sessionId).your_bullets >= 1){ //check if it has bullets
        this.state.shot_a_bullet(client.sessionId, data);
      }else{
        console.log("Received message from",client.sessionId,": NO BULLETS, YOU CANNOT SHOT");
      }
    });

    this.setSimulationInterval(() => this.state.update()); //default is 60fps
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, " joined!");
    console.log(options.name, " joined!");
    //create the player
    this.state.createPlayer(client.sessionId);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.dead = true;
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
