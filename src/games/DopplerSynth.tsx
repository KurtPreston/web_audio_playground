import {autobind} from 'core-decorators';
import {random, range, sample} from 'lodash';
import React from 'react';
import {Compressor, setContext, ToneAudioNode} from 'tone';
import {chordsMatching} from '../audio/chords';
import {generateRelatedChord} from '../audio/harmony';
import {getNoteName, Note, NoteValue} from '../audio/Note';
import {DopplerSettingsForm} from '../forms/DopplerSettingsForm';
import {Microphone} from '../sprites/Microphone';
import {NoteGraph, NoteNode} from '../sprites/NoteGraph';
import {OuterSpace} from '../sprites/OuterSpace';
import {Sprite} from '../sprites/Sprite';
import {DopplerSettings} from '../types/DopplerSettings';
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

    this.randomActions.set(this.addNoteNode, 15);
    this.randomActions.set(this.deleteNoteNode, 15);
    this.randomActions.set(this.loadRelatedChord, 20);
    this.randomActions.set(this.splitConstellation, 45);
    this.randomActions.set(this.mergeConstellations, 45);
    // this.randomActions.set(this.regenerateGraph, 60);
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
  }

  private regenerateGraph() {
    this.noteGraph.destroy();
    this.noteGraph = new NoteGraph({
      dimensions: this.lastDimensions,
      channel: this.channel
    });
    this.updateMenu();
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

  public menu() {
    if (!this.microphone) {
      return null;
    }

    const notesArray: NoteValue[] = Array.from(this.noteGraph.notes);

    return (
      <div className='doppler-synth-menu'>
        <fieldset>
          <label>Notes</label>
          <div>
            <strong>
              {chordsMatching(notesArray)
                .map((chord) => chord.name)
                .join(' or ')}
            </strong>
            <br />
            {notesArray.map((note: NoteValue) => getNoteName(note)).join(', ')}
          </div>
          <div>
            <div>
              <button onClick={this.regenerateGraph}>Random</button>
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
              <button onClick={this.splitConstellation}>Split</button>
              <button onClick={this.mergeConstellations}>Merge</button>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <DopplerSettingsForm
            value={this.microphone.dopplerSettings}
            onChange={this.updateDopplerSettings}
          />
        </fieldset>
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
