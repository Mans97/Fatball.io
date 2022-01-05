// Colyseus + Express
import http from "http";
import { Server } from "colyseus";
import express from "express";
import cors from 'cors'
import { monitor } from "@colyseus/monitor";
import { GameRoom } from './rooms/GameRoom'
import path from 'path'


const port = Number(process.env.port || 2567);
const host = 'localhost'
const app = express();
app.use(cors());
app.use(express.json());
app.use('/static', express.static('public'))
app.use("/static",express.static(__dirname+'../client/static'))

//app.use('/static', express.static('public'))
const server = http.createServer(app)
const gameServer = new Server({    
    server,
});

app.get('/game', (req, res) => {
    res.redirect("ws://" + host + ":8000")
})

gameServer.define('game_room', GameRoom);

app.use('/colyseus', monitor())

app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/index.html'))
})



gameServer.listen(port)

console.log(`Listening on ws://localhost:${port}`)
