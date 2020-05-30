import {autobind} from 'core-decorators';
import React from 'react';
import {Fireball, FireballSpriteParams} from '../sprites/Fireball';
import {inputPositionController, randomPositionController, Ryu} from '../sprites/Ryu';
import {Sprite} from '../sprites/Sprite';
import {Dimensions, WorldState} from '../types';
import {GameRunner} from './GameRunner';

export interface HadoukenProps {
  dimensions: Dimensions;
  audioSource: AudioNode;
}

export interface HadoukenState {}

@autobind
export class Hadouken extends GameRunner<HadoukenState> {
  private readonly player1: Ryu;
  private readonly player2: Ryu;
  private readonly fireballs: Set<Fireball>;

  constructor(props: HadoukenProps) {
    super(props);
    const {dimensions} = props;

    this.player1 = new Ryu({
      world: this.world(),
      launchFireball: this.launchFireball,
      position: {
        x: dimensions.width / 2,
        y: dimensions.height - 50
      },
      angle: (3 * Math.PI) / 2, // facing up.
      positionController: inputPositionController
    });

    this.player2 = new Ryu({
      world: this.world(),
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

  protected menu(world: WorldState) {
    return (
      <div>
        <h1>Hadouken</h1>
        <p>Charge your fireball like a super-saiyan</p>
      </div>
    );
  }

  protected sprites(): Sprite[] {
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
