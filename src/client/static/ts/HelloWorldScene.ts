import Phaser from 'phaser'
import * as Colyseus from 'colyseus.js'
import { State } from '../../../server/rooms/GameRoom'


export default class HelloWorldScene extends Phaser.Scene
{
    declare private cursors:any 
    declare private player:any 
    declare private circle_object:any
    private client: Colyseus.Client
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
        const room = await this.client.joinOrCreate<State>('game_room') //if there is one in the room, I have to use joinOrCreate()

        console.log(room.sessionId) //id of connectedplayes, esiste anche room.name

        


        room.state.players.onAdd = (player, sessionId: string) => {
            console.log("player ",player)
            console.log("\tenter in onAdd")
            
            //create the player
            this.circle_object = this.add.circle(0, 0, 50, 0xaaaaaa).setStrokeStyle(3, 0xeaa66aa);
            this.player = this.physics.add.existing(this.circle_object);

            //players[sessionId] = player

            //this.player.setCollideWorldBounds(true);
            this.cameras.main.startFollow(this.player)
        
        }
        

        room.state.players.onRemove = (player, sessionId) => {
            delete players[sessionId];
        }

        room.onStateChange((state) => {
            console.log("the room state has been updated:", state);
        });


        //message coming from the server
        room.onMessage('keydown', (message) => {
            console.log(message)
        })

        this.input.keyboard.on('keydown', (evt: KeyboardEvent) =>{
            room.send('keydown', evt.key) //lo mando a Colysius server
        })


        /**
         * 
         * FATBALL
         * 
         */
        
        this.physics.world.setBounds(0, 0, 1000, 1000); // set outer bounds

        // ------------ keyboard setting ------------
        this.cursors = this.input.keyboard.addKeys("W,A,S,D");
        console.log(this.cursors)

        

    }

    async update(){
        
        if(this.cursors){
            if( this.cursors.D.isDown) {
                //room.send("move", { y: -1 });
                this.player.x += 5;
            }
            if( this.cursors.A.isDown) {
                this.player.x -= 5;          
            }
            if( this.cursors.W.isDown) {
                this.player.y -= 5;
            }
            if( this.cursors.S.isDown) {
                this.player.y += 5;
            }
        }
        
    }
}