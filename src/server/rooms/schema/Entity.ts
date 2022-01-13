import { Schema, type } from "@colyseus/schema";
import { Bullet } from "../GameRoom"

export class Entity extends Schema {
  @type("float64") x!: number;
  @type("float64") y!: number;
  @type("float32") radius!: number;
  @type("float32") color!: number;
  @type("float32") border_color!: number;
  @type("string") name!: string;
  @type("int32") your_bullets!: number; 
  @type("int32") points!: number;
  @type("float32") minimun_radius!: number;
  @type("float32") maximum_radius!: number;
  bullet: Bullet = new Bullet(0,0);
  @type("boolean") is_bullet_active!: boolean;
  @type("string") bulletId: string;

  dead: boolean = false;
  angle: number = 0;
  speed = 0;

  static distance(a: any, b: any) {
    //Euclideian distance
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  }
}
