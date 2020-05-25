import {autobind} from 'core-decorators';
import {times} from 'lodash';
import React from 'react';
import {Circle} from '../sprites/Circle';
import {FlyingWamdag} from '../sprites/FlyingWamdag';
import {NoteGrid} from '../sprites/NoteGrid';
import {Sprite} from '../sprites/Sprite';
import {WorldState} from '../types';
import {Game, GameProps} from './Game';

interface FairyState {}

@autobind
export class Fairy extends Game<FairyState> {
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

  private destroyCircle(circle: Circle) {
    return this.circles.delete(circle);
  }

  protected menu(world: WorldState) {
    return (
      <div>
        <h1>Fairy</h1>
        <p>Collect the circles by singing a note.</p>
      </div>
    );
  }

  protected sprites(): Sprite[] {
    const circles: Circle[] = Array.from(this.circles.values());
    return [this.noteGrid, this.player, ...circles];
  }
}
