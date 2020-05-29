import {autobind} from 'core-decorators';
import React from 'react';
import {Microphone} from '../sprites/Microphone';
import {NoteGraph} from '../sprites/NoteGraph';
import {Sprite} from '../sprites/Sprite';
import {StaticBackground} from '../sprites/StaticBackground';
import {WorldState} from '../types';
import {Game, GameProps} from './Game';

interface ChordBlobState {}

@autobind
export class ChordBlob extends Game<ChordBlobState> {
  private readonly bg = new StaticBackground();
  private readonly noteGraph: NoteGraph;
  private readonly microphone: Microphone;

  constructor(props: GameProps) {
    super(props);
    const {dimensions} = props;

    this.noteGraph = new NoteGraph({
      dimensions
    });
    this.microphone = new Microphone({
      noteNodes: this.noteGraph.nodes
    });
  }

  protected menu(world: WorldState) {
    return (
      <div>
        <h1>ChordBlob</h1>
        <p>Pop the bubbles by singing chords</p>
      </div>
    );
  }

  protected sprites(): Sprite[] {
    return [this.bg, this.microphone, this.noteGraph];
  }
}
