import {autobind} from 'core-decorators';
import {times} from 'lodash';
import {Sprite} from '../sprites/Sprite';
import {StaticBackground} from '../sprites/StaticBackground';
import {Wisp} from '../sprites/Wisp';
import {WorldState} from '../types';
import {Game, GameInfo, ResourceInitializers} from './Game';

@autobind
export class TadpoleGame implements Game {
  public readonly info = Tadpole;

  private readonly bg = new StaticBackground();
  private readonly wisps: Set<Wisp> = new Set<Wisp>();

  constructor(world: WorldState, initializers: ResourceInitializers) {
    initializers.mic();
    const {dimensions} = world;

    times(100, () => {
      this.wisps.add(
        new Wisp({
          dimensions,
          bounceOffEdge: true,
          destroy: this.destroyWisp,
          mixBlendMode: 'xor'
        })
      );
    });
  }

  private destroyWisp(circle: Wisp) {
    return this.wisps.delete(circle);
  }

  public sprites(): Sprite[] {
    return [this.bg, ...Array.from(this.wisps)];
  }
}

export const Tadpole: GameInfo = {
  title: 'Tadpoles',
  url: '/tadpole',
  description: 'The tadpoles come to the surface when called',
  dataSources: ['mic'],
  game: TadpoleGame
};
