import Phaser from 'phaser'
import 'regenerator-runtime/runtime'
import HelloWorldScene from './HelloWorldScene'
//import {WORLD_SIZE} from './const.js'

const WORLD_SIZE = 600; 

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
    //mode: Phaser.Scale.FIT,
    //autoCenter: Phaser.Scale.CENTER_BOTH,
    width: WORLD_SIZE,     //DEFAULT_WIDTH,
    height: WORLD_SIZE,    //DEFAULT_HEIGHT,
    backgroundColor: 0x00aa00,
	physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
	scene: [HelloWorldScene]
}

export default new Phaser.Game(config)


