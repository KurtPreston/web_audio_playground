import {autobind} from 'core-decorators';
import {Fireball, FireballSpriteParams} from '../sprites/Fireball';
import {inputPositionController, randomPositionController, Ryu} from '../sprites/Ryu';
import {Sprite} from '../sprites/Sprite';
import {WorldState} from '../types/State';
import {Game, GameInfo, ResourceInitializers} from './Game';

@autobind
export class HadoukenGame implements Game {
  public info = Hadouken;

  private readonly player1: Ryu;
  private readonly player2: Ryu;
  private readonly fireballs: Set<Fireball>;

  constructor(world: WorldState, initializers: ResourceInitializers) {
    initializers.mic();
    initializers.deviceOrientation();
    const {dimensions} = world;

    this.player1 = new Ryu({
      world,
      launchFireball: this.launchFireball,
      position: {
        x: dimensions.width / 2,
        y: dimensions.height - 50
      },
      angle: (3 * Math.PI) / 2, // facing up.
      positionController: inputPositionController
    });

    this.player2 = new Ryu({
      world,
      launchFireball: this.launchFireball,
      position: {
        x: dimensions.width / 2,
        y: 50
      },
      angle: Math.PI / 2, // facing down,
      positionController: randomPositionController
    });
    this.fireballs = new Set<Fireball>();
  }

  public sprites(): Sprite[] {
    const fireballs: Fireball[] = Array.from(this.fireballs.values());
    return [this.player1, this.player2, ...fireballs];
  }

  private launchFireball(params: FireballSpriteParams) {
    this.fireballs.add(
      new Fireball({
        ...params,
        destroy: this.destroyFireball
      })
    );
  }

  private destroyFireball(fireball: Fireball) {
    return this.fireballs.delete(fireball);
  }
}

class HadoukenPreview implements Game {
  private ryu: Ryu;

  constructor(world: WorldState) {
    this.ryu = new Ryu({
      world,
      launchFireball: () => {},
      position: {
        x: world.dimensions.width / 2,
        y: world.dimensions.height - 50
      },
      angle: (3 * Math.PI) / 2, // facing up.
      positionController: inputPositionController
    });
  }

  public sprites(): Sprite[] {
    return [this.ryu];
  }
}

export const Hadouken: GameInfo = {
  title: 'Hadouken',
  url: '/hadouken',
  description: 'Charge your fireball like a super-saiyan',
  game: HadoukenGame,
  preview: HadoukenPreview
};
