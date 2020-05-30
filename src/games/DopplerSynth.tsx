import {autobind} from 'core-decorators';
import React from 'react';
import {Channel, setContext} from 'tone';
import {Microphone} from '../sprites/Microphone';
import {NoteGraph} from '../sprites/NoteGraph';
import {OuterSpace} from '../sprites/OuterSpace';
import {Sprite} from '../sprites/Sprite';
import {WorldState} from '../types';
import {Game, GameInfo, ResourceInitializers} from './Game';

@autobind
export class DopplerSynthGame implements Game {
  public info = DopplerSynth;

  private readonly bg: Sprite;
  private readonly noteGraph: NoteGraph;
  private readonly microphone: Microphone;

  constructor(world: WorldState, initializers: ResourceInitializers) {
    setContext(initializers.audioContext);
    const channel = new Channel();
    channel.toDestination();
    channel.connect(initializers.analyserNode);
    const {dimensions} = world;

    this.bg = new OuterSpace(dimensions);
    this.noteGraph = new NoteGraph({
      dimensions,
      channel
    });
    this.microphone = new Microphone({
      noteNodes: this.noteGraph.nodes
    });
  }

  public sprites(): Sprite[] {
    return [this.bg, this.microphone, this.noteGraph];
  }
}

export const DopplerSynth: GameInfo = {
  title: 'DopplerSynth',
  url: '/doppler',
  description: (
    <div>
      <p>if a synth orbits in outer space and no one's there to hear it, does it make a sound?</p>
      <p>place the wamdag so we don't have to find out.</p>
    </div>
  ),
  dataSources: [],
  game: DopplerSynthGame
};
