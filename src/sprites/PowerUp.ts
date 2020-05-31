import {autobind} from 'core-decorators';
import {scale} from '../math/scale';
import {CanvasBlendMode, IPosition, WorldState} from '../types';
import {Sprite} from './Sprite';

export interface PowerUpParams {
  position: IPosition;
  blendMode: CanvasBlendMode;
  color: string;
  destroy: (self: PowerUp) => void;
}

@autobind
export class PowerUp implements Sprite {
  // Variables
  private frameNum: number = 0;
  private readonly position: IPosition;

  // Constants
  private readonly maxSize: number = 150;
  private readonly blendMode: CanvasBlendMode;
  private readonly color: string;
  private readonly remove: () => void;
  private readonly lifespan: number = 15; // how many frames

  constructor(params: PowerUpParams) {
    this.position = params.position;
    this.blendMode = params.blendMode;
    this.color = params.color;
    this.remove = () => params.destroy(this);
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    const size = scale({
      input: this.frameNum,
      inputMin: 0,
      inputMax: this.lifespan,
      outputMin: 0,
      outputMax: this.maxSize
    });

    canvas.restore();
    canvas.fillStyle = this.color;
    canvas.globalCompositeOperation = this.blendMode;
    canvas.beginPath();
    canvas.arc(this.position.x, this.position.y, size, 0, 2 * Math.PI);
    canvas.fill();
  }

  public tick(world: WorldState) {
    this.frameNum++;
    if (this.frameNum > this.lifespan) {
      this.remove();
    }
  }
}
