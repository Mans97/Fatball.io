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
  reticle: any;

  bullets_value: number = 0;
  bulletsText: any;
  constructor() {
    super("hello-world");
  }

  init() {
    this.client = new Colyseus.Client("ws://localhost:2567");
  }

  preload() {
    this.load.setBaseURL('http://labs.phaser.io')
    // var target_path = "/assets/target.png";
    // this.load.image("target", target_path);
    this.load.image('target', 'assets/particles/red.png')
    //this.load.image('bullet', 'assets/bullets/bullet37.png')
  }

  async create() {
    var first_click: Boolean = true;
    //setting boards and input keyboards
    var game = this.game;

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

    this.reticle = this.physics.add.sprite(500, 400, "target");
    this.reticle.setOrigin(0.5,0.5)
          .setDisplaySize(25, 25)
          .setCollideWorldBounds(false);

    //reticle initial settings
    game.canvas.addEventListener("mousedown", function () {
      game.input.mouse.requestPointerLock();
      
    });

    //setting the bullets informations as text
    this.bulletsText = this.add.text(16, 16, 'score: 0', { fontSize: '32px'});
    //this.bulletsText.setText('Your Bullets: ' + this.bullets_value);

    
  
    this.input.on("pointermove",(pointer: { movementX: number; movementY: number }) => {
        if (game.input.mouse.locked) {
          
          // Move reticle with mouse
          this.reticle.x += pointer.movementX;
          this.reticle.y += pointer.movementY;
          
          //*********** "constraint" of reticle *************** */
           // Only works when camera follows player
           var distX = this.reticle.x - this.currentPlayer.x;
           var distY = this.reticle.y - this.currentPlayer.y;
 
           // Ensures reticle cannot be moved offscreen
           if (distX > 500)
               this.reticle.x = this.currentPlayer.x+500;
           else if (distX < -500)
               this.reticle.x = this.currentPlayer.x-500;
 
           if (distY > 300)
               this.reticle.y = this.currentPlayer.y+300;
           else if (distY < -300)
               this.reticle.y = this.currentPlayer.y-300;
        }
      },
      this
    );


    this.room.state.players.onAdd = (player: any, sessionId: string) => {
      //console.log("\tenter in onAdd");
      var circle_player: Phaser.GameObjects.Arc;
      var style_player: Phaser.GameObjects.Container;

      if (player.radius != 10) {
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
            }
          }
        }
        
        //getting the bullets
        this.bullets_value = this.room.state.players[sessionId].your_bullets;
        //console.log("bullets: ", this.bullets_value)

      };
    };



    this.room.state.players.onRemove = (_: any, sessionId: any) => {
      console.log("\tREMOVE", sessionId);
      this.players[sessionId].destroy();
      delete this.players[sessionId];
    };

    
    // Fires bullet from player on left click of mouse
    this.input.on('pointerdown', (pointer: any, time: any, lastFired: any) => {

      this.room.send("shot", { player_x: this.currentPlayer.x, player_y: this.currentPlayer.y, reticle_x: this.reticle.x, reticle_y: this.reticle.y });

      //*************************************************
      // *************** VECCHIA VERSIONE ***************
      // Get bullet from bullets group
      // var bullet = arrow_pointer_Bullets.get().setActive(true).setVisible(true);

      // if (bullet && player.radius > 25){ // when radius is small than 25, then you can't shot
      //     bullet.fire(arrow_pointer, reticle);
      //     //remove 5% of the radius for each bullets 
   
      //     player.setRadius(player.radius - (player.radius*0.05));            
      //     console.log(player.radius)

      //     this.physics.add.collider(player2, bullet, enemyHitCallback);
         
      // }
  }, this);

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


  //vecchio bullets
 /* function enemyHitCallback(enemyHit, bulletHit){
    // Reduce health of enemy
    if (bulletHit.active === true && enemyHit.active === true){
        // Destroy bullet
        bulletHit.setActive(false).setVisible(false);
        // QUESTO DEVE ACCADERE SUBITO 
        // ---> enemyHit.setActive(false).setVisible(false);
        enemyHit.setRadius(enemyHit.radius - (enemyHit.radius*0.05)) //reduce of 5% his radius
        //increase radius of player who is shotting
        return true; //hitted
    }
}

function enemyCollisionCallback(enemyCollided, player_principal){
    if (enemyCollided.active === true && player_principal.active === true){
        console.log(player_principal.radius)
        if(player_principal.radius>=enemyCollided.radius){
            enemyCollided.setActive(false).setVisible(false);
            player_principal.setRadius(player_principal.radius + enemyCollided.radius)
             /*******************************************
             *                                          | 
             *                                          |
             *   GESTIRE COSA SUCCEDE AL NEMICO QUI     |
             *                                          |
             *                                          | 
             ********************************************
        }else{
            player_principal.setActive(false).setVisible(false);
            arrow_pointer.setActive(false).setVisible(false);

            /*************************************
             *                                   | 
             *                                   |
             *   GESTIRE STATO GAME OVER QUI     |
             *                                   |
             *                                   | 
             ************************************

        }
       //check which radius in bigger
    }
}*/
constrainReticle(reticle: any, radius: any){
  var distX = reticle.x-this.currentPlayer.x; // X distance between player & reticle
  var distY = reticle.y-this.currentPlayer.y; // Y distance between player & reticle

  // Ensures reticle cannot be moved offscreen
  if (distX > 500){
      reticle.x = this.currentPlayer.x+500;
  }else if (distX < -500){
      reticle.x = this.currentPlayer.x-500;
  }
  if (distY > 300){
      reticle.y = this.currentPlayer.y+300;
  }else if (distY < -300){
      reticle.y = this.currentPlayer.y-300;
  }
  // Ensures reticle cannot be moved further than dist(radius) from player
  var distBetween = Phaser.Math.Distance.Between(this.currentPlayer.x, this.currentPlayer.y, reticle.x, reticle.y);
  if (distBetween > radius){
      // Place reticle on perimeter of circle on line intersecting player & reticle
      var scale = distBetween/radius;

      reticle.x = this.currentPlayer.x + (reticle.x-this.currentPlayer.x)/scale;
      reticle.y = this.currentPlayer.y + (reticle.y-this.currentPlayer.y)/scale;
  }
}

  async update() {

     // Camera position is average between reticle and player positions
     if(this.currentPlayer){
      var avgX = ((this.currentPlayer.x+this.reticle.x)/2)-400;
      var avgY = ((this.currentPlayer.y+this.reticle.y)/2)-300;
      this.cameras.main.scrollX = avgX;
      this.cameras.main.scrollY = avgY;
  
      // Make reticle move with player
      this.reticle.body.velocity.x = this.currentPlayer.body.velocity.x;
      this.reticle.body.velocity.y = this.currentPlayer.body.velocity.y;

      //updates constraints
      this.constrainReticle(this.reticle, Number(this.currentPlayer.getData('radius')))

     }

     //setting the bullet text
     if (this.bulletsText){
       this.bulletsText.setText('Your Bullets: ' + this.bullets_value);
     }


    if (this.cursors) {
      if (this.cursors.D.isDown) {
        this.room.send("move", { x: +1 });
        this.reticle.x += 1;
        //this.currentPlayer.x += 5;
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
}
