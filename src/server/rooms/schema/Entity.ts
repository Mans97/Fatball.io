import { Schema, type } from "@colyseus/schema";


export class Bullet{

  @type("float64") x: number;
  @type("float64") y: number;
  @type("float64") speed: number;
  @type("int32") born: number;
  @type("float64") direction: number;
  @type("float64") xSpeed: number;
  @type("float64") ySpeed: number;
  @type("boolean") active: Boolean;

}

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
  bullet!: Bullet;

  dead: boolean = false;
  angle: number = 0;
  speed = 0;

  static distance(a: Entity, b: Entity) {
    //Euclideian distance
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
  }
}
