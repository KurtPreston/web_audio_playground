import {autobind} from 'core-decorators';
import React from 'react';
import {Channel, setContext} from 'tone';
import {Microphone} from '../sprites/Microphone';
import {NoteGraph, NoteNode} from '../sprites/NoteGraph';
import {OuterSpace} from '../sprites/OuterSpace';
import {Sprite} from '../sprites/Sprite';
import {Dimensions, WorldState} from '../types';
import {Game, GameInfo, ResourceInitializers} from './Game';

@autobind
export class DopplerSynthGame implements Game {
  public info = DopplerSynth;

  // Sprites
  private noteGraph: NoteGraph;
  private readonly bg: Sprite;
  private readonly microphone: Microphone;

  // Other state
  private readonly channel: Channel;
  private lastDimensions: Dimensions;

  constructor(world: WorldState, initializers: ResourceInitializers) {
    setContext(initializers.audioContext);
    this.channel = new Channel();
    this.channel.toDestination();
    this.channel.connect(initializers.analyserNode);
    const {dimensions} = world;

    this.bg = new OuterSpace(dimensions);
    this.noteGraph = new NoteGraph({
      dimensions,
      channel: this.channel
    });
    this.microphone = new Microphone({
      getNoteNodes: this.getNoteNodes,
      channel: this.channel
    });
    this.lastDimensions = world.dimensions;
  }

  public sprites(): Sprite[] {
    return [this.bg, this.microphone, this.noteGraph];
  }

  public getNoteNodes(): Set<NoteNode> {
    return this.noteGraph.nodes;
  }

  public addNoteNode() {
    this.noteGraph.createNode();
  }

  public deleteNoteNode() {
    this.noteGraph.deleteNode();
  }

  private regenerateGraph() {
    this.noteGraph.destroy();
    this.noteGraph = new NoteGraph({
      dimensions: this.lastDimensions,
      channel: this.channel
    });
  }

  private adjustDoppler() {
    this.microphone.generateRandomDopplerSettings();
  }

  public gameTick(world: WorldState) {
    this.lastDimensions = world.dimensions;
  }

  public menu = (
    <div>
      <div>
        <button onClick={this.regenerateGraph}>Regenerate</button>
        <button onClick={this.addNoteNode}>Add</button>
        <button onClick={this.deleteNoteNode}>Delete</button>
      </div>
      <div>
        <button onClick={this.adjustDoppler}>Re-doppler</button>
      </div>
    </div>
  );
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
