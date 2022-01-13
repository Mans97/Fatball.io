import Phaser, { Data } from "phaser";
import * as Colyseus from "colyseus.js";
import { State } from "../../../server/rooms/GameRoom";
import Bullet from "./Bullet_class"

const WORLD_SIZE = 2000;

export default class HelloWorldScene extends Phaser.Scene {
  private declare cursors: any;
  players: { [id: string]: Phaser.GameObjects.Container } = {};
  currentPlayer: Phaser.GameObjects.Container;
  foods: { [id: string]: Phaser.GameObjects.Container } = {};
  arc: Phaser.GameObjects.Arc;
  private declare circle_object: any;
  private client: Colyseus.Client;
  room: any;
  reticle: any;
  private pointer: Phaser.Input.Pointer;
  bullets_value: number = 0;
  bulletsText: any;
  bullet_object: any;

  //avoid to shoot multiple times with a single left button press
  isDown_timeout: Number;

  roomID_fromUrl: any;
  usernameFromUrl: any;
  constructor() {
    super("hello-world");
  }

  init() {
    this.client = new Colyseus.Client("ws://localhost:2567");
    // this.roomID_fromUrl = this.getFromURL('roomId');
    // this.usernameFromUrl = this.getFromURL('username');

  }

  preload() {
    this.load.setBaseURL('http://labs.phaser.io')
    // var target_path = "/assets/target.png";
    // this.load.image("target", target_path);
    this.load.image('bullet', 'assets/particles/red.png')
    //this.load.image('bullet', 'assets/bullets/bullet37.png')
  }

  async create() {

    this.isDown_timeout = new Date().getTime();

    var first_click: Boolean = true;
    //setting boards and input keyboards
    var game = this.game;
    this.pointer = this.input.activePointer;
    var bound_rect = this.add.rectangle(1000, 1000, 6000, 6000); // draw rectangle around bounds
    bound_rect.setStrokeStyle(4000, 0x343a40); // border of 4000 px to the playground, color gray

    this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE, true); // set outer bounds
    this.physics.world.setBoundsCollision(); //enable bounds

    // ------------ keyboard setting ------------
    this.cursors = this.input.keyboard.addKeys("W,A,S,D");
    console.log(this.cursors);

    //Join room
    this.room = await this.client.joinOrCreate<State>("game_room", {name: this.getFromURL('username'), room_name: this.getFromURL('roomId')}); //if there is one in the room, I have to use joinOrCreate()
    // this.room.onLeave((code: any) => {
    //   console.log("Client left the room. Code:", code);
    //   //window.location.href = "http://192.168.1.73:8000/"

    // });

    this.room.onMessage("access_denied", (data: any) => {
      if(this.room.sessionId == data.id_session){
        window.location.href = "http://192.168.1.73:2567/"
      }
    });

    console.log("SESSION ID OF user: ",this.room.sessionId); //id of connectedplayes, esiste anche room.name
    //console.log(this.usernameFromUrl, " - ", this.roomID_fromUrl)
    //this.room.send('dataURL',{userURL: this.usernameFromUrl, roomID_URL: this.roomID_fromUrl});


    //setting the bullets informations as text
    this.bulletsText = this.add.text(16, 16, 'score: 0', { fontSize: '32px'});
    //this.bulletsText.setText('Your Bullets: ' + this.bullets_value);



    function delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
    }

    this.room.onMessage("shoot_coordinates", (data: any) => {

      console.log("ho ricevuto delle coor")

      var bullet: Bullet = new Bullet(this,data[0].x,data[0].y);
      this.add.existing(bullet);

      (async () => { 

        for(let i in data){

            bullet.setX(data[i].x);
            bullet.setY(data[i].y);
            //console.log(data[i].playerShot)
            if(data[i].playerShot == this.room.sessionId){
            //velocità grafica del proiettile
              console.log("check-the hit ", i)
              this.room.send("check-the-hit", {playerShot: data[i].playerShot,x: bullet.x, y: bullet.y})
            }
            await delay(15);
            

        }

        bullet.destroy()
      })();

    })

    this.room.state.players.onAdd = (player: any, sessionId: string) => {
      //console.log("\tenter in onAdd");
      var circle_player: Phaser.GameObjects.Arc;
      var style_player: Phaser.GameObjects.Container;
      
      if (player.radius != 10) {
        console.log('bullet client ',player.bullet)
        //create the player with text inside
        circle_player = this.add
          .circle(0, 0, player.radius, player.color, 0.6)
          .setStrokeStyle(3, player.border_color);

        var playerNick = this.add.text(0, 0, player.name, {
          fontFamily: "Helvetica",
          fontSize: "32px",
          color: "#000",
        });

        playerNick.x = playerNick.x - playerNick.width / 2;
        playerNick.y = playerNick.y - playerNick.height / 2;

        //setting the data inserting the radius, we'll need this to retrieve and modify it if the radius will change
        circle_player.setData("radius", "" + player.radius);

        style_player = new Phaser.GameObjects.Container(
          this,
          player.x,
          player.y,
          [circle_player, playerNick]
        );
      } else {
        //generate the food
        //create style of food
        var food_style = this.add
          .circle(0, 0, player.radius, 0xeea635)
          .setStrokeStyle(3, 0xeea635);

        //food_style.setData('radius', '' + player.radius)
        //create object food
        style_player = new Phaser.GameObjects.Container(
          this,
          player.x,
          player.y,
          [food_style]
        );
      }

      this.physics.world.enable(style_player);
      this.add.existing(style_player);
      this.physics.add.existing(style_player);
      this.players[sessionId] = style_player;

      if (sessionId === this.room.sessionId) {
        //current player is need to bind the camera to your current player (the player that you use in the game)
        this.currentPlayer = style_player;
        console.log("CIAO CLIENT, il tuo giocatore è: ", this.currentPlayer);
        //follow player with the camera
        this.cameras.main.startFollow(this.currentPlayer);  
      }

      player.onChange = (changes: any) => {
        //console.log("\t\t----- è cambiato qualcosa", changes);
        for (let id in this.players) {
          //updates of position of every players and current player
          this.players[id].x = this.room.state.players[id].x;
          this.players[id].y = this.room.state.players[id].y;

          //getting from data of ARC
          if (this.room.state.players[id].radius != 10) {
            //only for player, not food
            //getting the radius stored in "data" of Arc
            var old_radius = this.players[id].getAt(0).getData("radius");

            if (old_radius != this.room.state.players[id].radius) {
              //if the radius change, I will update the radius
              //update of the radius

              if(circle_player){
                circle_player.setRadius(this.room.state.players[sessionId].radius);
                console.log("RAGGIO GIOCATORE ",id," :", this.players[id].getData('radius'), " and radius of circle ", circle_player.radius , "radius from backend ", this.room.state.players[id].radius)
              }
              this.room.state.players[id].radius
            }
          }

        }
        
        //getting the remaining bullets
        this.bullets_value = this.room.state.players[sessionId].your_bullets;
        //console.log("bullets: ", this.bullets_value)

      };
    };

    this.room.state.players.onRemove = (_: any, sessionId: any) => {
      //tell the client that he has to update redis field for this user
      this.room.send("exit",{name: this.getFromURL('username'), room_name: this.getFromURL('roomId')});
      console.log("\tREMOVE", sessionId);
      this.players[sessionId].destroy();
      delete this.players[sessionId];
    };

    // Fires bullet from player on left click of mouse
    this.input.on('pointerdown', (pointer: any, time: any, lastFired: any) => {
      console.log("shoot", this.currentPlayer.x, " ", this.currentPlayer.y, " ", this.pointer.worldX, " ", this.pointer.worldY);
      this.room.send("shot", { player_x: this.currentPlayer.x, player_y: this.currentPlayer.y, 
        reticle_x: this.pointer.worldX, reticle_y: this.pointer.worldY });
    }, this);

  

  }




  async update() {
    //setting the bullet text
    if (this.bulletsText){
      this.bulletsText.setText('Your Bullets: ' + this.bullets_value);
    }

    //var time = new Date().getTime() - Number(this.isDown_timeout);
    
    // if (this.pointer.leftButtonDown()){
    //   this.pointer.downElement()
    //   if (time > 200){
    //     //for debugging print i to not overlap all the logs
    //     console.log("shoot", this.currentPlayer.x, " ", this.currentPlayer.y, " ", this.pointer.worldX, " ", this.pointer.worldY);
    //     this.room.send("shot", { player_x: this.currentPlayer.x, player_y: this.currentPlayer.y, 
    //       reticle_x: this.pointer.worldX, reticle_y: this.pointer.worldY });
    //     this.isDown_timeout = new Date().getTime();
    //   }
    // }

    if (this.cursors) {

      if (this.cursors.D.isDown) {
        this.room.send("move", { x: +1 });
        // this.currentPlayer.x += 5;
      }

      if (this.cursors.A.isDown) {
        this.room.send("move", { x: -1 });
        //this.currentPlayer.x -= 5;
      }

      if (this.cursors.W.isDown) {
        this.room.send("move", { y: -1 });
        //this.currentPlayer.y -= 5;
      }

      if (this.cursors.S.isDown) {
        this.room.send("move", { y: +1 });
        //this.currentPlayer.y += 5;
      }
    }
  }


  getFromURL(search_string: any){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get(search_string);
    return code;
  }
}

