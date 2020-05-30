import {autobind} from 'core-decorators';
import {times} from 'lodash';
import React from 'react';
import {Circle} from '../sprites/Circle';
import {Sprite} from '../sprites/Sprite';
import {StaticBackground} from '../sprites/StaticBackground';
import {WorldState} from '../types';
import {Game, GameInfo} from './Game';

@autobind
export class TadpoleGame implements Game {
  public readonly info = Tadpole;

  private readonly bg = new StaticBackground();
  private readonly circles: Set<Circle> = new Set<Circle>();

  constructor(world: WorldState) {
    const {dimensions} = world;

    times(100, () => {
      this.circles.add(
        new Circle({
          dimensions,
          bounceOffEdge: true,
          destroy: this.destroyCircle,
          mixBlendMode: 'xor'
        })
      );
    });
  }

  private destroyCircle(circle: Circle) {
    return this.circles.delete(circle);
  }

  public menu(world: WorldState) {
    return (
      <div>
        <h1>Tadpoles</h1>
        <p>They swim hidden in the seaweed until called.</p>
      </div>
    );
  }

  public sprites(): Sprite[] {
    return [this.bg, ...Array.from(this.circles)];
  }
}

export const Tadpole: GameInfo = {
  title: 'Tadpoles',
  url: '/tadpole',
  description: 'The tadpoles come to the surface when you speak',
  dataSources: ['mic'],
  game: TadpoleGame
};
