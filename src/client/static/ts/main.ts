import Phaser from 'phaser'
import 'regenerator-runtime/runtime'
import HelloWorldScene from './HelloWorldScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
    //mode: Phaser.Scale.FIT,
    //autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 600, //DEFAULT_WIDTH,
    height: 600,//DEFAULT_HEIGHT,
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
