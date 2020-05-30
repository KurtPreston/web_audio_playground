import {random, times} from 'lodash';
import tinycolor from 'tinycolor2';
import {Dimensions, IPosition, WorldState} from '../types';
import {Sprite} from './Sprite';

interface Star {
  position: IPosition;
  brightness: number; // 0 - 1
}

export class OuterSpace extends Sprite {
  private readonly stars: Star[];

  constructor(dimensions: Dimensions) {
    super();
    this.stars = times(500, () => ({
      position: {
        x: random(0, dimensions.width),
        y: random(0, dimensions.height)
      },
      brightness: random(0, 1, true)
    }));
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    canvas.fillStyle = 'black';
    canvas.fillRect(0, 0, world.dimensions.width, world.dimensions.height);

    this.stars.forEach(({brightness, position}) => {
      const {x, y} = position;
      canvas.fillStyle = tinycolor({
        h: 0,
        s: 0,
        l: brightness
      }).toHexString();
      canvas.fillRect(x, y, 1, 1);
    });
  }

  public tick(world: WorldState) {
    this.stars.forEach((star: Star) => {
      star.brightness += (Math.random() - 0.5) / 10;
      if (star.brightness > 1) {
        star.brightness = 1;
      }
      if (star.brightness < 0) {
        star.brightness = 0;
      }
    });
  }
}
