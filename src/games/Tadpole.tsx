import {autobind} from 'core-decorators';
import {times} from 'lodash';
import React from 'react';
import {Circle} from '../sprites/Circle';
import {Sprite} from '../sprites/Sprite';
import {StaticBackground} from '../sprites/StaticBackground';
import {WorldState} from '../types';
import {Game, GameProps} from './Game';

interface TadpoleState {}

@autobind
export class Tadpole extends Game<TadpoleState> {
  private readonly bg = new StaticBackground();
  private readonly circles: Set<Circle> = new Set<Circle>();

  constructor(props: GameProps) {
    super(props);
    const {dimensions} = props;

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

  protected menu(world: WorldState) {
    return (
      <div>
        <h1>Tadpoles</h1>
        <p>They swim hidden in the seaweed until called.</p>
      </div>
    );
  }

  protected sprites(): Sprite[] {
    return [this.bg, ...Array.from(this.circles)];
  }
}
