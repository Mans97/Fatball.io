import Phaser from 'phaser'
import * as Colyseus from 'colyseus.js'

export default class HelloWorldScene extends Phaser.Scene
{
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
        const room = await this.client.joinOrCreate('my_room') //if there is one in the room, I have to use joinOrCreate()

        console.log(room.sessionId) //id of connectedplayes, esiste anche room.name

        //message coming from the server
        room.onMessage('keydown', (message) => {
            console.log(message)
        })

        this.input.keyboard.on('keydown', (evt: KeyboardEvent) =>{
            room.send('keydown', evt.key) //lo mando a Colysius server
        })

    }
}
