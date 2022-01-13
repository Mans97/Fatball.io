import { Room, Client, RedisPresence } from "colyseus";
//import { State } from "./schema/State";
import { Schema, type, MapSchema } from "@colyseus/schema";
import { Entity } from "./schema/Entity";
import { generateId } from "colyseus";
//import Bullet from "../../client/static/ts/Bullet_class"

const WORLD_SIZE = 2000;


export class Bullet{

  x: number;
  y: number;
  speed: number;
  born: number;
  direction: number;
  xSpeed: number;
  ySpeed: number;

  constructor(x: number, y: number){
    this.x = x;
    this.y = y;
    this.speed = 1;
    this.born = 0;
    this.direction = 0;
    this.xSpeed = 0;
    this.ySpeed = 0;
  }

}

export class Player extends Entity {
  constructor() {
    super();
    this.radius = 20;
    this.minimun_radius = 15;
    this.maximum_radius = 250;
    this.bullet = new Bullet(0,0);
    this.is_bullet_active = true;
  }
}


export class State extends Schema {
  @type({ map: Entity })
  players = new MapSchema<Entity>();

  // bullets = new Bullet()

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
        maximum_radius: 250,
        bullet: new Bullet(0,0),
        is_bullet_active: true
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
        if (player.radius > collidePlayer.radius && collidePlayer.radius == 10) {
          //check if there is the collision (use of distance between the objects)
          /**
           * If the distance between the objects is less than the sum of the two
           * radius, there is a collision because the objects are overlapped
           */
          if (player.radius + collidePlayer.radius >= Entity.distance(player, collidePlayer)) {
            //if the sum of two radius is more bigger than the distance, there is the collision
            //console.log("\t\tCollision")
            deadPlayers.push(collideSessionId); // this elements will be removed
            this.createFood();
            if (player.radius <= player.maximum_radius)
              player.radius += 5; //increase the radius of player
              player.your_bullets += 1 //increase the bullets of the player
          }

        }
        if(collidePlayer.radius > 10 && Entity.distance(player.bullet, collidePlayer) <= collidePlayer.radius
           && player.is_bullet_active){
            //deactivate the bullet
            player.is_bullet_active = false
            console.log(collidePlayer.name, "è stato colpitooooo ")
            //decrease player radius and check if it is dead
            collidePlayer.radius -= 5
            if(collidePlayer.radius <= collidePlayer.minimun_radius){
              collidePlayer.dead = true
            }
                
        }

      })

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

    console.log("start the shot: ", shot_Data);

    type bullet_coor = {playerShot: string,x: number, y: number}

    let bullet_coordinates: bullet_coor[] = [];

    var player = this.players.get(sessionId)

    player.bullet.x = shot_Data.player_x
    player.bullet.y = shot_Data.player_y
    
    player.bullet.direction = Math.atan((shot_Data.reticle_x - player.bullet.x) / (shot_Data.reticle_y - player.bullet.y));
    console.log(player.bullet.direction)
    // Calculate X and y velocity of bullet to moves it from shooter to target
    if (shot_Data.reticle_y >= shot_Data.player_y){
      player.bullet.xSpeed = player.bullet.speed * Math.sin(player.bullet.direction);
      player.bullet.ySpeed = player.bullet.speed * Math.cos(player.bullet.direction);
    }
    else{
      player.bullet.xSpeed = - player.bullet.speed * Math.sin(player.bullet.direction);
      player.bullet.ySpeed = - player.bullet.speed * Math.cos(player.bullet.direction);
    }

    player.bullet.born = 0; // Time since new bullet spawned

    var delta = 7 //time between each updates (in this case: speed of bullets)

    while(player.bullet.born<800){

      player.bullet.x += player.bullet.xSpeed * delta;
      player.bullet.y += player.bullet.ySpeed * delta;
      player.bullet.born += delta;
      var coor: bullet_coor = {playerShot: sessionId, x: player.bullet.x, y: player.bullet.y}
      bullet_coordinates.push(coor);

    }

    return bullet_coordinates;

  }
  
}

export class GameRoom extends Room<State> {
  // onAuth(client: Client, options: any, request: any){

  // }

  //LOBBY_CHANNEL = "pony"


  onCreate(options: any) {
    this.setState(new State());

    //overwrite of roomID
    this.roomId = options.room_name;
    console.log("I'M CREATING this room id: ", this.roomId)

    //add food
    for (let i = 0; i < 25; i++) {
      this.state.createFood();
    }


    //on move
    this.onMessage("move", (client, data) => {
      //console.log("Received message from",client.sessionId,":",data);
      this.state.movePlayer(client.sessionId, data);
    });

    //var i = 0;
    this.onMessage("check-the-hit", (client,data) =>{

      //console.log("dataaaaa: ", data)
      //console.log("check-the hit ", ++i)
      const player = this.state.players.get(client.sessionId)
      player.bullet.x = data.x
      player.bullet.y = data.y
      //console.log("shoot from: ", player.name, " coordinates: ",player.bullet.x, "-", player.bullet.y)

      //}
      
    })

    //on shot
    this.onMessage("shot", (client, data) => {
      //console.log("Received message from",client.sessionId,":",data);
      if(this.state.players.get(client.sessionId).your_bullets >= 1){ //check if it has bullets

        this.state.players.get(client.sessionId).is_bullet_active = true
        //create the bullet trajectory 
        type bullet_coor = {x: number, y: number}
        var bullet_coordinates: bullet_coor[] = []
        bullet_coordinates = this.state.shot_a_bullet(client.sessionId, data);
        this.broadcast("shoot_coordinates", bullet_coordinates)
      } 
      else {
        console.log("Received message from",client.sessionId,": NO BULLETS, YOU CANNOT SHOT");
      }
    });

    this.onMessage("exit", async (client, data) => {
      const user_exit = await this.presence.smembers(options.room_name+"@"+options.name)
     console.log("Sta uscendo: ", user_exit)
      console.log("sono qui")
      //resetting the field in redis sayng that user is no more in the room (so the field is setted to FALSE)
      // this.presence.srem(data.room_name+"@"+data.name, await this.presence.smembers(data.room_name+"@"+data.name));
      // this.presence.srem(data.room_name,data.name);
        
      //console.log(this.presence.del(data.room_name));
      console.log(await this.presence.del(data.room_name+"@"+data.name));

      this.presence.sadd(options.room_name+"@"+options.name,"false")
      //const user_exit2 = await this.presence.smembers(options.room_name)

      const user_exit3 = await this.presence.smembers(options.room_name+"@"+options.name)

      //console.log("chi è rimasto field 1? ",user_exit2)
      console.log("chi è rimasto field 2? ",user_exit3)
    });



    // this.onMessage("dataURL", (client, data) => {
    //   console.log("data From URL ", data)
    //   this.state.players.get(client.sessionId).name = data.userURL;
    // });

    this.setSimulationInterval(() => this.state.update()); //default is 60fps
  }

  async onJoin(client: Client, options: any) {
    console.log("I'M JOINING this room id: ", this.roomId, " and the user is: ", options.name)

    console.log(options.room_name, " - ", options.name)

    const user_in_game = await this.presence.smembers(options.room_name+"@"+options.name)
    console.log(user_in_game)
    if (user_in_game.includes("true")){
      console.log("The player is already in the game");
      //this client is not allowed to enter
      client.send("access_denied",{message: "You cannot enter", id_session: client.sessionId});

    }else if(user_in_game.includes("false")){ //else is false, so the user is not in the lobby/redis
      //insert the player in redis, using the room_id of game as key
      this.presence.srem(options.room_name+"@"+options.name,"false")
      this.presence.sadd(options.room_name+"@"+options.name,"true")
      console.log("new user created.")

      // creating the player and setting is name
      console.log(client.sessionId, " joined!");
      console.log(options.name, " joined!");
      console.log("Room name ", options.room_name);
      //create the player
      this.state.createPlayer(client.sessionId);
      this.state.players.get(client.sessionId).name = options.name;

    }else{//user does not exist
      console.log("The player does not exist");
      //this client is not allowed to enter
      client.send("access_denied",{message: "You cannot enter", id_session: client.sessionId});

    }

  
   
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left! ");
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.dead = true;
    }
    //this.presence.srem(options.room_name+"@"+options.name,await this.presence.smembers(options.room_name+"@"+options.name))

    /** If is the last user for this room id, then remove every user, associate to this room id, from redis*/
    //for every user ... 
    //await this.presence.del(data.room_name+"@"+data.name)
    //await this.presence.del(data.room_name)

  }

  async onDispose() {
    console.log("room", this.roomId, "disposing...");
    //TODO: remove player and room id and flag from redis
    //const user_in_game = await this.presence.smembers(options.room_name+"@"+options.name)
    

    //this.presence.sadd(options.room_name+"@"+options.name,"true")
    
  }

}