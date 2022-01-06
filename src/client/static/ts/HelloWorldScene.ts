import Phaser, { Data } from 'phaser'
import * as Colyseus from 'colyseus.js'
import { State } from '../../../server/rooms/GameRoom'


export default class HelloWorldScene extends Phaser.Scene
{
    declare private cursors:any 
    players: { [id: string]: Phaser.GameObjects.Arc } = {}
    currentPlayer: Phaser.GameObjects.Arc
    declare private circle_object:any
    private client: Colyseus.Client
    room: any
	constructor()
	{
		super('hello-world')
	}

    init()
    {
        this.client = new Colyseus.Client('ws://localhost:2567')
    }

	preload()
    {
        //this.load.setBaseURL('http://labs.phaser.io')
        //this.load.image('sky', 'assets/skies/space3.png')
    }

    

    async create()
    {
        //setting boards and input keyboards
        var bound_rect = this.add.rectangle(1000, 1000, 6000, 6000);  // draw rectangle around bounds
        bound_rect.setStrokeStyle(4000, 0x343a40); // stylize

        this.physics.world.setBounds(0, 0, 1000, 1000); // set outer bounds
        this.physics.world.setBoundsCollision(); //enable bounds

        // ------------ keyboard setting ------------
        this.cursors = this.input.keyboard.addKeys("W,A,S,D");
        console.log(this.cursors)


        //Join room
        this.room = await this.client.joinOrCreate<State>('game_room') //if there is one in the room, I have to use joinOrCreate()

        console.log(this.room.sessionId) //id of connectedplayes, esiste anche room.name

        this.room.state.players.onAdd = (player: any, sessionId: string) => {
            console.log("\tenter in onAdd")
            //generate random color
         
            
            //create the player
            var style_player = this.add.circle(player.x, player.y, player.radius, player.color).setStrokeStyle(3, 0xeaa66aa)
            this.physics.world.enable(style_player);
            style_player = this.physics.add.existing(style_player);
            //style_player.body.collideWorldBounds = true
            this.players[sessionId] = style_player
        
            //this.players[sessionId].body.collideWorldBounds = true;
            //this.players[sessionId].setCollideWorldBounds(true);

            if (sessionId === this.room.sessionId) {
                this.currentPlayer = style_player
                console.log("CIAO CLIENT, il tuo giocatore è: ", this.currentPlayer)
                //follow player with the camera
                this.cameras.main.startFollow(this.currentPlayer)

            }

              
            player.onChange = (changes: any) => {
                console.log("\t\t----- è cambiato qualcosa")
            }



        }
        
        

        this.room.state.players.onRemove = (player: any, sessionId: any) => {
            delete this.players[sessionId];
            console.log("\tREMOVE")
        }

        this.room.onStateChange((state: any) => {
            console.log("the room state has been updated:", state);
        });


        //message coming from the server
        /*this.room.onMessage('keydown', (message: any) => {
            console.log(message)
        })*/

        /*this.input.keyboard.on('keydown', (evt: KeyboardEvent) =>{
            this.room.send('keydown', evt.key) //lo mando a Colysius server
        })*/


      
        this.room.onMessage("move", (data: any) => {
            console.log("\t MOVED RECEIVED: message received from server");
            //console.log("pony", data);
            for(let id in this.players){
                //console.log("id:", id, " data: ", data)
                console.log("VECCHIA POSIZIONE del giocatore ", id," è : ", this.players[id].x, " E ", this.players[id].y)
                this.players[id].x = this.room.state.players[id].x
                this.players[id].y = this.room.state.players[id].y
                console.log("\t\NUOVA POSIZIONE: ", id," è : ", this.room.state.players[id].x, " E ", this.room.state.players[id].y)

                
            }
        });
        console.log("sessione room", this.room.sessionId)

        

    }

    async update(){
        if(this.cursors){
            if( this.cursors.D.isDown) {
                this.room.send("move", { x: +5 });
                //this.currentPlayer.x += 5;
            }
            if( this.cursors.A.isDown) {
                this.room.send("move", { x: -5 });
                //this.currentPlayer.x -= 5;          
            }
            if( this.cursors.W.isDown) {
                this.room.send("move", { y: -5 });
                //this.currentPlayer.y -= 5;
            }
            if( this.cursors.S.isDown) {
                this.room.send("move", { y: +5 });
                //this.currentPlayer.y += 5;
            }
        }

       
 
        
    }

 
    

}



