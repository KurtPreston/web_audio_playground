import {random, times} from 'lodash';
import tinycolor from 'tinycolor2';
import {Dimensions, IPosition, WorldState} from '../types';
import {Sprite} from './Sprite';

interface Star {
  position: IPosition;
  size: number;
  color: tinycolor.ColorFormats.HSL;
}

function randomStarColor(): tinycolor.ColorFormats.HSL {
  const red = '#ffd06d';
  const white = '#fff';
  const blue = '#acd0e5';

  const colorPct = Math.random();
  if (colorPct < 0.5) {
    return tinycolor.mix(red, white, colorPct * 200).toHsl();
  } else {
    return tinycolor.mix(white, blue, (colorPct - 0.5) * 200).toHsl();
  }
}

export class OuterSpace implements Sprite {
  private readonly stars: Star[];

  constructor(dimensions: Dimensions) {
    this.stars = times(500, () => ({
      position: {
        x: random(0, dimensions.width),
        y: random(0, dimensions.height)
      },
      size: random(0.4, 1),
      color: randomStarColor()
    }));
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    canvas.fillStyle = 'black';
    canvas.fillRect(0, 0, world.dimensions.width, world.dimensions.height);

    this.stars.forEach(({color, position, size}) => {
      const {x, y} = position;
      canvas.beginPath();
      canvas.fillStyle = tinycolor(color).toHexString();
      canvas.arc(x, y, size, 0, Math.PI * 2);
      canvas.fill();
      canvas.closePath();
    });
  }

  public tick(world: WorldState) {
    this.stars.forEach(({color}: Star) => {
      let brightness = color.l + random(-0.05, 0.05, true);
      if (brightness < 0.2) {
        brightness = 0.2;
      }
      if (brightness > 1) {
        brightness = 1;
      }
      color.l = brightness;
    });
  }
}
