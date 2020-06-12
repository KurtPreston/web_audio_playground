import {autobind} from 'core-decorators';
import {sample, times} from 'lodash';
import {distanceBetween} from '../math/trig/distanceBetween';
import {FlyingWamdag} from '../sprites/FlyingWamdag';
import {Sprite} from '../sprites/Sprite';
import {StaticBackground} from '../sprites/StaticBackground';
import {Wisp} from '../sprites/Wisp';
import {WorldState} from '../types/State';
import {Game, GameInfo, ResourceInitializers} from './Game';

@autobind
export class WamflapGame implements Game {
  private readonly player: FlyingWamdag;
  private readonly bg: StaticBackground;
  private readonly wisps: Set<Wisp> = new Set<Wisp>();

  constructor(world: WorldState, initializers: ResourceInitializers) {
    initializers.mic();

    const {dimensions} = world;
    this.player = new FlyingWamdag({
      dimensions
    });
    this.bg = new StaticBackground();

    times(15, () => {
      this.wisps.add(
        new Wisp({
          dimensions,
          bounceOffEdge: true,
          destroy: this.destroyWisp
        })
      );
    });
  }

  public gameTick(world: WorldState) {
    this.wisps.forEach((circle: Wisp) => {
      const {size, ...circlePosition} = circle.state;
      const distance = distanceBetween(circlePosition, this.player.position);
      if (distance < size) {
        this.wisps.delete(circle);
        this.player.powerUp(circle);
      }
    });

    if (this.wisps.size === 0) {
      this.nextLevel(world);
    }
  }

  private destroyWisp(circle: Wisp) {
    return this.wisps.delete(circle);
  }

  private nextLevel(world: WorldState) {
    times(200, (idx) => {
      setTimeout(() => {
        this.wisps.add(
          new Wisp({
            dimensions: world.dimensions,
            bounceOffEdge: true,
            destroy: this.destroyWisp,
            mixBlendMode: sample(['color-dodge', 'soft-light', 'xor', 'multiply'])
          })
        );
      }, idx * 50);
    });
  }

  public sprites(): Sprite[] {
    const wisps: Wisp[] = Array.from(this.wisps.values());
    return [this.bg, ...wisps, this.player];
  }

  public info = Wamflap;
}

export const Wamflap: GameInfo = {
  title: 'Wamflap',
  description: 'Move the wambird by singing notes to collect the wisps',
  url: '/wamflap',
  game: WamflapGame
};
