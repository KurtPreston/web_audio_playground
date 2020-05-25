import {autobind} from 'core-decorators';
import React from 'react';
import {Circle} from '../sprites/Circle';
import {FlyingWamdag} from '../sprites/FlyingWamdag';
import {NoteGrid} from '../sprites/NoteGrid';
import {Sprite} from '../sprites/Sprite';
import {Dimensions, WorldState} from '../types';
import {Game, GameProps} from './Game';

export interface HadoukenProps {
  dimensions: Dimensions;
  audioSource: AudioNode;
}

export interface HadoukenState {}

@autobind
export class Fairy extends Game<HadoukenState> {
  private readonly player: FlyingWamdag;
  private readonly noteGrid: NoteGrid;
  private readonly circles: Set<Circle> = new Set<Circle>();

  constructor(props: GameProps) {
    super(props);
    const {dimensions} = props;
    this.player = new FlyingWamdag({dimensions});
    this.noteGrid = new NoteGrid();
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
    return [this.player, this.noteGrid, ...circles];
  }
}
