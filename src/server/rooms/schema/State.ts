/*

NON RIMUOVERE

import { Schema, Context, type, MapSchema } from "@colyseus/schema";
import { Entity } from "./Entity";
import { Player } from "./Player";

export const DEFAULT_PLAYER_RADIUS = 10;
const WORLD_SIZE = 1000;

export class State extends Schema {

    @type("string") mySynchronizedProperty: string = "Hello world";

    @type({ map: Entity })
    entities = new MapSchema<Entity>();

    
    width = WORLD_SIZE;
    height = WORLD_SIZE;

    createPlayer(sessionId: string) {
        this.entities.set(sessionId, new Player().assign({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          color: Number("0x" + Math.floor(Math.random()*16777215).toString(16))
        }));
      }

}*/