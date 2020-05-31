import {random} from 'lodash';
import {randomWalkFactory} from '../frameTickers/randomWalk';
import {IWanderer, SpriteTicker, WorldState} from '../types/State';
import {circularPath} from './renderHelpers/circularPath';
import {Sprite} from './Sprite';

export interface FireballSpriteParams {
  velocity: number;
  wave: Uint8Array;
  minSize: number;
  maxSize: number;
  spinMomentum: number;
  state: FireballState;
  prepareCanvas: (canvas: CanvasRenderingContext2D) => void;
}

export interface FireballState extends IWanderer {
  spinAngle: number;
}

export interface FireballParams extends FireballSpriteParams {
  destroy: (fireball: Fireball) => boolean;
}

export class Fireball implements Sprite {
  private readonly ticker: SpriteTicker<IWanderer>;
  private readonly remove: () => boolean;

  constructor(private readonly params: FireballParams) {
    const {velocity, destroy} = params;

    this.ticker = randomWalkFactory({
      velocity,
      jitter: random(0.01, 0.08),
      lean: 0,
      bounceOffEdge: false
    });

    this.remove = () => destroy(this);
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    const {wave, state, minSize, maxSize} = this.params;
    this.params.prepareCanvas(canvas);
    circularPath({
      canvas,
      wave,
      cx: state.x,
      cy: state.y,
      minSize,
      maxSize,
      angle: state.spinAngle
    });
  }

  public tick(world: WorldState) {
    const {dimensions} = world;
    const size = this.params.maxSize;

    // Spin + move
    this.params.state = {
      ...this.ticker(this.params.state, world),
      spinAngle: this.params.state.spinAngle + this.params.spinMomentum
    };

    // Destroy if out-of-bounds
    const {x, y} = this.params.state;
    const offLeftSide = x < -1 * size;
    const offRightSide = x > dimensions.width + size;
    const offTop = y < -1 * size;
    const offBottom = y > dimensions.height + size;
    if (offLeftSide || offRightSide || offTop || offBottom) {
      this.remove();
    }
  }
}
