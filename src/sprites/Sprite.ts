import {AudioData, Dimensions} from '../types';

let spriteId = 1;

export abstract class Sprite {
  public readonly id = `${this.constructor.name}-${spriteId++}`;
  public abstract render(audio: AudioData, dimensions: Dimensions): React.ReactElement<SVGElement>;
  public abstract tick(dimensions: Dimensions): void;
}
