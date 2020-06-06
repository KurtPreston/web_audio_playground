import {autobind} from 'core-decorators';
import {random, range, sample, times} from 'lodash';
import React from 'react';
import {Compressor, setContext, ToneAudioNode} from 'tone';
import {chordName, chordsMatching} from '../audio/chords';
import {generateRelatedChord} from '../audio/harmony';
import {getNoteName, Note, NoteValue} from '../audio/Note';
import {DopplerSettingsForm} from '../forms/DopplerSettingsForm';
import {NoteGraphPhysicsForm} from '../forms/NoteGraphPhysicsForm';
import {Microphone} from '../sprites/Microphone';
import {NoteGraph, NoteNode} from '../sprites/NoteGraph';
import {OuterSpace} from '../sprites/OuterSpace';
import {Sprite} from '../sprites/Sprite';
import {DopplerSettings} from '../types/DopplerSettings';
import {NoteGraphPhysics} from '../types/NoteGraphPhysics.d';
import {Dimensions, WorldState} from '../types/State';
import './DopplerSynth.scss';
import {Game, GameInfo, ResourceInitializers} from './Game';

@autobind
export class DopplerSynthGame implements Game {
  public info = DopplerSynth;

  // Sprites
  private noteGraph: NoteGraph;
  private readonly bg: Sprite;
  private readonly microphone: Microphone;

  // Other state
  private readonly channel: ToneAudioNode;
  private lastDimensions: Dimensions;

  // Constants
  private updateMenu: () => void;
  private requestMidi: () => void;

  // Random actions mapped to how frequently the action occurs in seconds
  private randomActions = new Map<() => void, number>();

  constructor(world: WorldState, initializers: ResourceInitializers, updateMenu: () => void) {
    setContext(initializers.audioContext);
    this.channel = new Compressor({
      threshold: -10,
      ratio: 5
    });
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
    this.updateMenu = updateMenu;
    this.requestMidi = initializers.midi;

    this.randomActions.set(this.addNoteNode, 20);
    this.randomActions.set(this.deleteNoteNode, 20);
    this.randomActions.set(this.addEdges, 25);
    this.randomActions.set(this.deleteEdges, 40);
    this.randomActions.set(this.loadRelatedChord, 20);
    this.randomActions.set(this.splitConstellation, 50);
    this.randomActions.set(this.mergeConstellations, 50);
    // this.randomActions.set(this.regenerateGraph, 500);
  }

  public sprites(): Sprite[] {
    return [this.bg, this.microphone, this.noteGraph];
  }

  public getNoteNodes(): Set<NoteNode> {
    return this.noteGraph.nodes;
  }

  public addNoteNode() {
    this.noteGraph.createNode();
    this.updateMenu();
  }

  public addNote() {
    const noteValue: NoteValue = random(0, 12);
    const unusedNotes = range(0, 12).filter(
      (noteValue: NoteValue) => !this.noteGraph.notes.has(noteValue)
    );
    if (unusedNotes.length) {
      this.noteGraph.addNote(noteValue);
      this.updateMenu();
    }
  }

  public addEdges() {
    times(random(1, 5), () => {
      this.noteGraph.addEdge();
    });
  }

  public deleteEdges() {
    times(random(1, 5), () => {
      this.noteGraph.deleteEdge();
    });
  }

  public loadRelatedChord() {
    const relatedChord = generateRelatedChord(this.noteGraph.notes);
    this.noteGraph.setChord(relatedChord.notes);
    this.updateMenu();
  }

  public deleteNote() {
    this.noteGraph.deleteNote(sample(Array.from(this.noteGraph.notes)) as Note);
    this.updateMenu();
  }

  public deleteNoteNode() {
    this.noteGraph.deleteNode();
    this.updateMenu();
  }

  public splitConstellation() {
    this.noteGraph.splitGraph();
  }

  public mergeConstellations() {
    this.noteGraph.mergeGraphs();
    times(random(0, 6), () => {
      this.noteGraph.addEdge();
    });
  }

  private regenerateGraph() {
    this.noteGraph.nodes.forEach((node) => {
      this.noteGraph.deleteNode(node);
    });
    setTimeout(() => {
      this.noteGraph.destroy();
      this.noteGraph = new NoteGraph({
        dimensions: this.lastDimensions,
        channel: this.channel
      });
      this.updateMenu();
    }, 1000);
  }

  public gameTick(world: WorldState) {
    this.lastDimensions = world.dimensions;

    this.randomActions.forEach((interval, action) => {
      const oddsOfHappeningThisFrame = 1 / 25 / interval;
      if (Math.random() < oddsOfHappeningThisFrame) {
        action();
      }
    });
  }

  private updateDopplerSettings(settings: DopplerSettings) {
    this.microphone.updateDopplerSettings(settings);
    this.updateMenu();
  }

  private updatePhysics(physics: NoteGraphPhysics) {
    this.noteGraph.physics = physics;
    this.updateMenu();
  }

  private initializeMidi() {
    this.requestMidi();
    this.randomActions.delete(this.loadRelatedChord);
  }

  public menu() {
    if (!this.microphone) {
      return null;
    }

    const notesArray: NoteValue[] = Array.from(this.noteGraph.notes);

    return (
      <div className='doppler-synth-menu'>
        <fieldset>
          <label>DopplerSynth</label>
          <button onClick={this.regenerateGraph}>Reset</button>
          <button onClick={this.initializeMidi}>MIDI</button>
        </fieldset>
        <fieldset>
          <label>Notes</label>
          <div>
            <strong>{chordsMatching(notesArray).map(chordName).join(' or ')}</strong>
            <br />
            {notesArray.map((note: NoteValue) => getNoteName(note)).join(', ')}
          </div>
          <div>
            <div>
              <button onClick={this.loadRelatedChord}>Related chord</button>
            </div>
            <div>
              <button onClick={this.addNote}>Add note</button>
              <button onClick={this.deleteNote}>Delete note</button>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <label>Constellation</label>
          <div />
          <div>
            <div>
              <button onClick={this.addNoteNode}>Add Node</button>
              <button onClick={this.deleteNoteNode}>Delete Node</button>
            </div>
            <div>
              <button onClick={this.addEdges}>Add Edges</button>
              <button onClick={this.deleteEdges}>Delete Edges</button>
            </div>
            <div>
              <button onClick={this.splitConstellation}>Split Groups</button>
              <button onClick={this.mergeConstellations}>Merge Groups</button>
            </div>
          </div>
        </fieldset>
        <DopplerSettingsForm
          value={this.microphone.dopplerSettings}
          onChange={this.updateDopplerSettings}
        />
        <NoteGraphPhysicsForm value={this.noteGraph.physics} onChange={this.updatePhysics} />
      </div>
    );
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
