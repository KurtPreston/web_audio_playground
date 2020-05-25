import {WorldState} from '../types';

let spriteId = 1;
export abstract class Sprite {
  public readonly id = `${this.constructor.name}-${spriteId++}`;
  public abstract render(canvas: CanvasRenderingContext2D, world: WorldState): void;
  public abstract tick(world: WorldState): void;
}
