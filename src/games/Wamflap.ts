import {autobind} from 'core-decorators';
import {sample, times} from 'lodash';
import {distanceBetween} from '../math/trig/distanceBetween';
import {Circle} from '../sprites/Circle';
import {FlyingWamdag} from '../sprites/FlyingWamdag';
import {Sprite} from '../sprites/Sprite';
import {StaticBackground} from '../sprites/StaticBackground';
import {WorldState} from '../types';
import {Game, GameInfo} from './Game';

@autobind
export class WamflapGame implements Game {
  private readonly player: FlyingWamdag;
  private readonly bg: StaticBackground;
  private readonly circles: Set<Circle> = new Set<Circle>();

  constructor(world: WorldState) {
    const {dimensions} = world;
    this.player = new FlyingWamdag({
      dimensions
    });
    this.bg = new StaticBackground();

    times(15, () => {
      this.circles.add(
        new Circle({
          dimensions,
          bounceOffEdge: true,
          destroy: this.destroyCircle
        })
      );
    });
  }

  public gameTick(world: WorldState) {
    this.circles.forEach((circle: Circle) => {
      const {size, ...circlePosition} = circle.state;
      const distance = distanceBetween(circlePosition, this.player.position);
      if (distance < size) {
        this.circles.delete(circle);
        this.player.powerUp(circle);
      }
    });

    if (this.circles.size === 0) {
      this.nextLevel(world);
    }
  }

  private destroyCircle(circle: Circle) {
    return this.circles.delete(circle);
  }

  private nextLevel(world: WorldState) {
    times(200, (idx) => {
      setTimeout(() => {
        this.circles.add(
          new Circle({
            dimensions: world.dimensions,
            bounceOffEdge: true,
            destroy: this.destroyCircle,
            mixBlendMode: sample(['color-dodge', 'soft-light', 'xor', 'multiply'])
          })
        );
      }, idx * 50);
    });
  }

  public sprites(): Sprite[] {
    const circles: Circle[] = Array.from(this.circles.values());
    return [this.bg, ...circles, this.player];
  }

  public info = Wamflap;
}

export const Wamflap: GameInfo = {
  title: 'Wamflap',
  description: 'Move the wambird by singing notes to collect the wisps',
  url: '/wamflap',
  dataSources: ['mic'],
  game: WamflapGame
};
