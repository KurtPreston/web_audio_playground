import {autobind} from 'core-decorators';
import {times} from 'lodash';
import React from 'react';
import {Circle} from '../sprites/Circle';
import {FlyingWamdag} from '../sprites/FlyingWamdag';
import {NoteGrid} from '../sprites/NoteGrid';
import {distanceBetween} from '../sprites/renderHelpers/distanceBetween';
import {Sprite} from '../sprites/Sprite';
import {WorldState} from '../types';
import {Game, GameProps} from './Game';

interface WamflapState {}

@autobind
export class Wamflap extends Game<WamflapState> {
  private readonly player: FlyingWamdag;
  private readonly noteGrid: NoteGrid;
  private readonly circles: Set<Circle> = new Set<Circle>();

  constructor(props: GameProps) {
    super(props);
    const {dimensions} = props;
    this.noteGrid = new NoteGrid({
      lowOctave: 2,
      highOctave: 4,
      showPitchIndicator: false
    });
    this.player = new FlyingWamdag({
      dimensions,
      noteGrid: this.noteGrid
    });

    times(5, () => {
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
  }

  private destroyCircle(circle: Circle) {
    return this.circles.delete(circle);
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
    return [this.noteGrid, ...circles, this.player];
  }
}
