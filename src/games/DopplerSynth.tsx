import {autobind} from 'core-decorators';
import React from 'react';
import {Microphone} from '../sprites/Microphone';
import {NoteGraph} from '../sprites/NoteGraph';
import {Sprite} from '../sprites/Sprite';
import {StaticBackground} from '../sprites/StaticBackground';
import {WorldState} from '../types';
import {GameRunner, GameRunnerProps} from './GameRunner';

interface DopplerSynthState {}

@autobind
export class DopplerSynth extends GameRunner<DopplerSynthState> {
  private readonly bg = new StaticBackground();
  private readonly noteGraph: NoteGraph;
  private readonly microphone: Microphone;

  constructor(props: GameRunnerProps) {
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
        <h1>DopplerSynth</h1>
        <p>Pop the bubbles by singing chords</p>
      </div>
    );
  }

  protected sprites(): Sprite[] {
    return [this.bg, this.microphone, this.noteGraph];
  }
}
