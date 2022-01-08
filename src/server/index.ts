import http from "http";
import { Server } from "colyseus";
import express from "express";
import cors from 'cors'
import { monitor } from "@colyseus/monitor";
import { GameRoom } from './rooms/GameRoom'
import {LobbyGameRoom} from './rooms/LobbyGameRoom'
import { RedisPresence } from "colyseus";
import path from 'path'
import {networkInterfaces} from 'os'


// Public IP exposition

const netInterface : any= networkInterfaces();
var resultsNet : any = {}

// filtering nets on the interface of the host system
for (const name of Object.keys(netInterface)) {
    for (const net of netInterface[name]) {
        // If the IP is IPv4 type and it is not equal to localhost
        if (net.family === 'IPv4' && !net.internal) {
            if (!resultsNet[name]) {
                resultsNet[name] = [];
            }
            resultsNet[name].push(net.address);
        }
    }
}
// the current host IP is
console.log("Current Public IP host: " + resultsNet[Object.keys(resultsNet)[0]][0])


// setting hosting parameters
const port = Number(process.env.port || 2567);
const host = resultsNet[Object.keys(resultsNet)[0]][0]
const app = express();


// settings uses 
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname+'/../client/static'))


//app.use('/static', express.static('public'))


// setting Colyseus Server and adding RoomTypes, Redis and other configurations
const server = http.createServer(app)
const gameServer = new Server({    
    server, // express
    presence : new RedisPresence({
        url : "redis://127.0.0.1:6379/0" // redis for distribution between servers and processes
    }) 
    // TODO: setting proxy, check https://github.com/colyseus/proxy
});

// define rooms and namespace
gameServer.define('game_room', GameRoom);
gameServer.define('lobby_room', LobbyGameRoom)

// monitoring interface
app.use('/colyseus', monitor())

// main Rest API call
app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname, '../client/index.html'))
})


gameServer.listen(port)

console.log(`Listening on ws://${host}:${port}`)
