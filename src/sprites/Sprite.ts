import {WorldState} from '../types';

let spriteId = 1;
export abstract class Sprite {
  public readonly id = `${this.constructor.name}-${spriteId++}`;
  public abstract render(world: WorldState): React.ReactElement<SVGElement>;
  public abstract tick(world: WorldState): void;
}
