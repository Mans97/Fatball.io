import http from "http";
import { Server } from "colyseus";
import express from "express";
import cors from 'cors'
import { monitor } from "@colyseus/monitor";
import { GameRoom } from './rooms/GameRoom'
import {LobbyGameRoom} from './rooms/LobbyGameRoom'
import { RedisPresence } from "colyseus";
import path from 'path'


const port = Number(process.env.port || 2567);
const host = 'localhost'
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname+'/../client/static'))
//app.use('/static', express.static('public'))
const server = http.createServer(app)
const gameServer = new Server({    
    server,
    presence : new RedisPresence()
});

gameServer.define('game_room', GameRoom);
gameServer.define('lobby_room', LobbyGameRoom)
app.use('/colyseus', monitor())

/*
app.get('/game', (req, res) => {
    res.redirect("ws://" + 'localhost' + ":8000")
})
*/

app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/index.html'))
})

app.get('/lobby/:id', (req, res)=>{
    var lobby_id = req.params.id;
    // TODO: sending to the lobby at the url 
})



gameServer.listen(port)

console.log(`Listening on ws://localhost:${port}`)
