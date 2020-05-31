import backgroundDarkWaterColor from '../images/backgroundDarkWatercolor.jpg';
import {WorldState} from '../types';
import {Sprite} from './Sprite';

export class StaticBackground implements Sprite {
  private loadedImage: HTMLImageElement;

  constructor(imageSrc?: string) {
    this.loadedImage = new Image();
    this.loadedImage.src = imageSrc || backgroundDarkWaterColor;
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    const {width, height} = world.dimensions;
    canvas.drawImage(this.loadedImage, 0, 0, width, height);
  }

  public tick(world: WorldState) {}
}
