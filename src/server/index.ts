// Colyseus + Express
import http from "http";
import { Server } from "colyseus";
import express from "express";
import cors from 'cors'
import { monitor } from "@colyseus/monitor";
import { GameRoom } from './rooms/GameRoom'
import path from 'path'


const port = Number(process.env.port || 2567);

const app = express();
app.use(cors());
app.use(express.json());
app.use("/static",express.static(__dirname+'../client/static'))

//app.use('/static', express.static('public'))
const server = http.createServer(app)
const gameServer = new Server({    
    server,
});

app.get('/', (req, res) => {
    //res.send('Hai sbagliato... go to: http://127.0.0.1:2567/colyseus/#/')
    res.sendFile(path.join(__dirname, '../client/game.html'));
})

gameServer.define('game_room', GameRoom);

app.use('/colyseus', monitor())

gameServer.listen(port)

console.log(`Listening on ws://localhost:${port}`)
