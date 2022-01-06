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
        //Join room
        this.room = await this.client.joinOrCreate<State>('game_room') //if there is one in the room, I have to use joinOrCreate()

        console.log(this.room.sessionId) //id of connectedplayes, esiste anche room.name

        this.room.state.players.onAdd = (player: any, sessionId: string) => {
            console.log("\tenter in onAdd")
            
            //create the player
            //this.circle_object = this.add.circle(0, 0, 50, 0xaaaaaa).setStrokeStyle(3, 0xeaa66aa);
            //console.log(typeof "this.circle_object")
            //this.players = this.physics.add.existing(this.circle_object);


            //var graphics = this.add.graphics({ fillStyle: { color: 0xff0000}})
            console.log("RADIUS coming from ROOM: ", player.radius)
            this.players[sessionId] = new Phaser.GameObjects.Arc(this, player.x, player.y, player.radius, 0xaaaaaa)
            this.players[sessionId] = this.add.circle(player.x, player.y, player.radius, 0xaaaaaa).setStrokeStyle(3, 0xeaa66aa)
            //graphics.fillCircleShape(this.players[sessionId])
            //NON VA this.physics.add.existing(graphics)

            //NON VAthis.players[sessionId] = this.physics.add.sprite(300, 100, 'dude')

            
            //this.players[sessionId].body.collideWorldBounds = true;
            //this.players2[sessionId].setCollideWorldBounds(true);
            //this.cameras.main.startFollow(this.players[sessionId])

            if (sessionId === this.room.sessionId) {
                this.currentPlayer = this.add.circle(player.x, player.y, player.radius, 0xaaaaaa).setStrokeStyle(3, 0xeaa66aa)
                console.log("sono qui con il giocatore corrente che è: ", this.currentPlayer)
                this.cameras.main.startFollow(this.currentPlayer)
                //follow player with the camera
            }
            //this.currentPlayer = this.players[sessionId]
            //graphics.fillCircleShape(this.currentPlayer)
            //
        
        }
        
        

        this.room.state.players.onRemove = (player: any, sessionId: any) => {
            delete this.players[sessionId];
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


        /**
         * 
         * FATBALL
         * 
         */
        var bound_rect = this.add.rectangle(1000, 1000, 6000, 6000);  // draw rectangle around bounds
        bound_rect.setStrokeStyle(4000, 0x343a40); // stylize

        this.physics.world.setBounds(0, 0, 1000, 1000); // set outer bounds

        // ------------ keyboard setting ------------
        this.cursors = this.input.keyboard.addKeys("W,A,S,D");
        console.log(this.cursors)


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
                this.room.send("move", { x: +1 });
                this.currentPlayer.x += 1;
            }
        }

       
 

        
        /*if(this.cursors){
            if( this.cursors.D.isDown) {
                //room.send("move", { y: -1 });
                this.currentPlayer.x += 5;
            }
            if( this.cursors.A.isDown) {
                this.currentPlayer.x -= 5;          
            }
            if( this.cursors.W.isDown) {
                this.currentPlayer.y -= 5;
            }
            if( this.cursors.S.isDown) {
                this.currentPlayer.y += 5;
            }
        }*/
        
    }

 
    

}



