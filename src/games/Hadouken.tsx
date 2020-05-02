import {autobind} from 'core-decorators';
import React from 'react';
import {Fireball, FireballSpriteParams} from '../sprites/Fireball';
import {Ryu} from '../sprites/Ryu';
import {Sprite} from '../sprites/Sprite';
import {Dimensions} from '../types';
import {Game} from './Game';

export interface HadoukenProps {
  dimensions: Dimensions;
  audioSource: AudioNode;
}

export interface HadoukenState {}

@autobind
export class Hadouken extends Game<HadoukenState> {
  private readonly player: Ryu;
  private readonly fireballs: Set<Fireball>;

  constructor(props: HadoukenProps) {
    super(props);
    this.player = new Ryu({
      world: this.world(),
      launchFireball: this.launchFireball
    });
    this.fireballs = new Set<Fireball>();
  }

  protected menu() {
    return (
      <div>
        <h1>Hadouken</h1>
        <p>Charge your fireball like a super-saiyan</p>
      </div>
    );
  }

  protected sprites(): Sprite[] {
    const fireballs: Fireball[] = Array.from(this.fireballs.values());
    return [this.player, ...fireballs];
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
