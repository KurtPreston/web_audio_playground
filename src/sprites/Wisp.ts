import {isFinite, random} from 'lodash';
import {randomWalkFactory} from '../frameTickers/randomWalk';
import {scale} from '../math/scale';
import {CanvasBlendMode} from '../types/CanvasBlendMode.generated';
import {Dimensions, IWanderer, SpriteTicker, WorldState} from '../types/State';
import {randomColor} from '../util/color';
import {Sprite} from './Sprite';

export interface WispParams {
  dimensions: Dimensions;
  bounceOffEdge: boolean;
  destroy: (sprite: Wisp) => boolean;
  minSize?: number;
  maxSize?: number;
  mixBlendMode?: CanvasBlendMode;
}

interface WispState extends IWanderer {
  size: number;
}

export class Wisp implements Sprite {
  // State
  public state: WispState;

  // Constants
  public readonly color = randomColor();
  public readonly mixBlendMode: CanvasBlendMode;
  private readonly minSize: number;
  private readonly maxSize: number;
  private readonly walkTicker: SpriteTicker<IWanderer>;
  private readonly bounceOffEdge: boolean;
  private readonly remove: () => boolean;

  constructor(params: WispParams) {
    const {dimensions, bounceOffEdge, minSize, maxSize, mixBlendMode} = params;
    const {height, width} = dimensions;

    const pixels = width * height;
    const avgSideLength = Math.sqrt(pixels);
    this.minSize = isFinite(minSize) ? (minSize as number) : Math.round(avgSideLength / 80);
    this.maxSize = isFinite(maxSize) ? (maxSize as number) : Math.round(avgSideLength / 15);
    this.mixBlendMode = mixBlendMode || 'color-dodge';
    this.walkTicker = randomWalkFactory({
      velocity: random(3, 7),
      jitter: random(0.01, 0.12),
      lean: random(-0.03, 0.03, true),
      bounceOffEdge
    });
    this.bounceOffEdge = bounceOffEdge;
    this.remove = () => params.destroy(this);

    this.state = {
      // On left, facing right
      x: 0,
      y: height / 2,
      angle: 0,
      size: this.minSize
    };
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    const {x, y, size} = this.state;
    canvas.globalCompositeOperation = this.mixBlendMode;
    canvas.beginPath();
    canvas.arc(x, y, size, 0, 2 * Math.PI);
    canvas.fillStyle = this.color;
    canvas.fill();
    canvas.closePath();
  }

  public tick(world: WorldState) {
    const {dimensions, audio} = world;
    const size = scale({
      input: audio.amplitude,
      inputMin: 0,
      inputMax: 1,
      outputMin: this.minSize,
      outputMax: this.maxSize,
      logarithmic: true
    });
    this.state = {
      ...this.walkTicker(this.state, world),
      size
    };

    if (!this.bounceOffEdge) {
      const {x, y} = this.state;
      const offLeftSide = x < -1 * size;
      const offRightSide = x > dimensions.width + size;
      const offTop = y < -1 * size;
      const offBottom = y > dimensions.height + size;
      if (offLeftSide || offRightSide || offTop || offBottom) {
        this.remove();
      }
    }
  }
}
