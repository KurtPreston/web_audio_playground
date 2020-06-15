import {random, times} from 'lodash';
import tinycolor from 'tinycolor2';
import {Dimensions, IPosition, WorldState} from '../types/State';
import {Sprite} from './Sprite';

interface Star {
  position: IPosition;
  size: number;
  color: tinycolor.ColorFormats.HSL;
}

function randomStarColor(): tinycolor.ColorFormats.HSL {
  const red = '#ffe08d';
  const white = '#fff';
  const blue = '#acd0e5';

  const colorPct = random(0.27, 0.8, true);
  if (colorPct < 0.5) {
    return tinycolor.mix(red, white, colorPct * 200).toHsl();
  } else {
    return tinycolor.mix(white, blue, (colorPct - 0.5) * 200).toHsl();
  }
}

export class OuterSpace implements Sprite {
  private stars: Star[];

  // Number of stars per pixel
  private readonly starDensity: number = 1 / 1000;

  // Store the dimensions so we can generate new stars on screen resize
  private readonly dimensions: Dimensions;

  constructor(dimensions: Dimensions) {
    this.dimensions = dimensions;

    const pixels = dimensions.width * dimensions.height;
    const numStars = pixels * this.starDensity;
    this.stars = times(
      numStars,
      (): Star => {
        return this.generateStar({
          xMin: 0,
          xMax: dimensions.width,
          yMin: 0,
          yMax: dimensions.height
        });
      }
    );
  }

  private generateStar(params: {xMin: number; xMax: number; yMin: number; yMax: number}): Star {
    const {xMin, xMax, yMin, yMax} = params;
    return {
      position: {
        x: random(xMin, xMax),
        y: random(yMin, yMax)
      },
      size: random(0.5, 1.5),
      color: randomStarColor()
    };
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    canvas.fillStyle = 'black';
    canvas.fillRect(0, 0, world.dimensions.width, world.dimensions.height);

    this.stars.forEach(({color, position, size}) => {
      const {x, y} = position;
      canvas.fillStyle = `hsl(${color.h}, ${color.s * 100}%, ${color.l * 100}%)`;
      canvas.fillRect(x, y, size, size);
    });
  }

  public tick(world: WorldState) {
    if (world.dimensions.height > this.dimensions.height) {
      // Create new stars
      const xMin = 0;
      const xMax = this.dimensions.width;
      const yMin = this.dimensions.height;
      const yMax = world.dimensions.height;
      const numNewStars = (xMax - xMin) * (yMax - yMin) * this.starDensity;
      this.stars.push(...times(numNewStars, () => this.generateStar({xMin, xMax, yMin, yMax})));

      // Update maxDimensions
      this.dimensions.height = world.dimensions.height;
    } else if (world.dimensions.height < this.dimensions.height) {
      this.stars = this.stars.filter((star) => star.position.y < world.dimensions.height);
      this.dimensions.height = world.dimensions.height;
    }

    if (world.dimensions.width > this.dimensions.width) {
      // Create new stars
      const xMin = this.dimensions.width;
      const xMax = world.dimensions.width;
      const yMin = 0;
      const yMax = this.dimensions.height;
      const numNewStars = (xMax - xMin) * (yMax - yMin) * this.starDensity;
      this.stars.push(...times(numNewStars, () => this.generateStar({xMin, xMax, yMin, yMax})));

      // Update maxDimensions
      this.dimensions.width = world.dimensions.width;
    } else if (world.dimensions.width < this.dimensions.width) {
      this.stars = this.stars.filter((star) => star.position.x < world.dimensions.width);
      this.dimensions.width = world.dimensions.width;
    }

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
