import Phaser, { Data } from "phaser";
import * as Colyseus from "colyseus.js";
import { State } from "../../../server/rooms/GameRoom";

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
  constructor() {
    super("hello-world");
  }

  init() {
    this.client = new Colyseus.Client("ws://localhost:2567");
  }

  preload() {
    //this.load.setBaseURL('http://labs.phaser.io')
    //this.load.image('sky', 'assets/skies/space3.png')
  }

  async create() {
    //setting boards and input keyboards
    var bound_rect = this.add.rectangle(1000, 1000, 6000, 6000); // draw rectangle around bounds
    bound_rect.setStrokeStyle(4000, 0x343a40); // border of 4000 px to the playground, color gray

    this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE, true); // set outer bounds
    this.physics.world.setBoundsCollision(); //enable bounds

    // ------------ keyboard setting ------------
    this.cursors = this.input.keyboard.addKeys("W,A,S,D");
    console.log(this.cursors);

    //Join room
    this.room = await this.client.joinOrCreate<State>("game_room"); //if there is one in the room, I have to use joinOrCreate()

    console.log(this.room.sessionId); //id of connectedplayes, esiste anche room.name

    this.room.state.players.onAdd = (player: any, sessionId: string) => {
      //console.log("\tenter in onAdd");
      if (player.radius != 10){
          //create the player with text inside
        var circle_player = this.add
          .circle(0, 0, player.radius, player.color, 0.6)
          .setStrokeStyle(3, player.border_color);
      
        var playerNick = this.add.text(0, 0, 'Pippo', { fontFamily: 'Helvetica', fontSize: '32px', color: '#000' });
        playerNick.x = playerNick.x - playerNick.width/2
        playerNick.y = playerNick.y - playerNick.height/2

        //setting the data inserting the radius, we'll need this to retrieve and modify it if the radius will change
        circle_player.setData('radius', '' + player.radius)

        var style_player = new Phaser.GameObjects.Container(this, player.x, player.y, [circle_player, playerNick])
      }else{//generate the food
        //create style of food
        var food_style = this.add
          .circle(0, 0, player.radius, 0xEEA635)
          .setStrokeStyle(3, 0xEEA635);
        
        //food_style.setData('radius', '' + player.radius)

        
        //create object food
        var style_player = new Phaser.GameObjects.Container(this, player.x, player.y, [food_style])

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
          if(this.room.state.players[id].radius != 10){ //only for player, not food
            //getting the radius stored in "data" of Arc
            var old_radius = this.players[id].getAt(0).getData('radius')

            if(old_radius != this.room.state.players[id].radius){ //if the radius change, I will update the radius
              //update of the radius
              //console.log("nuovo radius (è aumentato): ", this.room.state.players[id].radius)
              var circle_player_with_new_radius = circle_player.setRadius(this.room.state.players[id].radius)
        
            }
          }
         
         
          

        }
      };
    };

    this.room.state.players.onRemove = ( _: any, sessionId: any) => {
      console.log("\tREMOVE", sessionId);
      this.players[sessionId].destroy();
      delete this.players[sessionId];
    };

    /*this.room.onStateChange((state: any) => {
      console.log("the room state has been updated:", state);
    });*/

    //message coming from the server
    /*this.room.onMessage('keydown', (message: any) => {
            console.log(message)
        })*/

    /*this.input.keyboard.on('keydown', (evt: KeyboardEvent) =>{
            this.room.send('keydown', evt.key) //lo mando a Colysius server
        })*/
  }

  async update() {
    if (this.cursors) {
      if (this.cursors.D.isDown) {
        this.room.send("move", { x: +5 });
        //this.currentPlayer.x += 5;
      }
      if (this.cursors.A.isDown) {
        this.room.send("move", { x: -5 });
        //this.currentPlayer.x -= 5;
      }
      if (this.cursors.W.isDown) {
        this.room.send("move", { y: -5 });
        //this.currentPlayer.y -= 5;
      }
      if (this.cursors.S.isDown) {
        this.room.send("move", { y: +5 });
        //this.currentPlayer.y += 5;
      }
    }
    
  }
}
