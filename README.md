# Fatball.io | Distributed System Project
Game based on Colyseus framework to build a multiplayer game in distributed manner using Redis Presence for scalability. The project consists in a realtime game which every player needs to shot enemies, eats balls and became the fat one and win the game at the end of the timer. Games are lobby orientations and comunication is based on HTTP using express.js for connection binding and WebSockets for internal distributed data trasmissions. 

# Start the project
Following commands are standard ones or built in the `package.json` located in the main directory. 
- `redis-server` for the redis management
- `npm run start-server` (url http://127.0.0.1:2567/colyseus/#/) and (url http://127.0.0.1:2567/) for the main page
- `npm run start` (url http://127.0.0.1:8000/) for the game testing in development mode

# Testing Redis

Following these steps to clear redis via redis-cli
- `redis-cli` to access in the cli
- `FLUSHDB` on the redis-cli

# Authors
Mario Sessa | Emanuele Fazzini | Michele Bonini
