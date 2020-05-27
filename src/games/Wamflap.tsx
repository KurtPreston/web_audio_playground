import {autobind} from 'core-decorators';
import {sample, times} from 'lodash';
import React from 'react';
import {Circle} from '../sprites/Circle';
import {FlyingWamdag} from '../sprites/FlyingWamdag';
import {distanceBetween} from '../sprites/renderHelpers/distanceBetween';
import {Sprite} from '../sprites/Sprite';
import {StaticBackground} from '../sprites/StaticBackground';
import {WorldState} from '../types';
import {Game, GameProps} from './Game';

interface WamflapState {}

@autobind
export class Wamflap extends Game<WamflapState> {
  private readonly player: FlyingWamdag;
  private readonly bg: StaticBackground;
  private readonly circles: Set<Circle> = new Set<Circle>();

  constructor(props: GameProps) {
    super(props);
    const {dimensions} = props;
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

  protected gameTick(world: WorldState) {
    this.circles.forEach((circle: Circle) => {
      const {size, ...circlePosition} = circle.state;
      const distance = distanceBetween(circlePosition, this.player.position);
      if (distance < size) {
        this.circles.delete(circle);
        this.player.powerUp();
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

  protected menu(world: WorldState) {
    return (
      <div>
        <h1>Wamflap</h1>
        <p>Guide the wamdag by singing or playing an instrument</p>
        <p>Try to collect all the circles</p>
      </div>
    );
  }

  protected sprites(): Sprite[] {
    const circles: Circle[] = Array.from(this.circles.values());
    return [this.bg, ...circles, this.player];
  }
}
