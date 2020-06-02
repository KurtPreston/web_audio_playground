import {autobind} from 'core-decorators';
import {random, sample} from 'lodash';
import React from 'react';
import {Compressor, setContext, ToneAudioNode} from 'tone';
import {chordName} from '../audio/chords';
import {generateRelatedChord} from '../audio/harmony';
import {getNoteName, Note} from '../audio/Note';
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

  constructor(world: WorldState, initializers: ResourceInitializers, updateMenu: () => void) {
    setContext(initializers.audioContext);
    this.channel = new Compressor(-10, 4);
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
    this.noteGraph.addNote(random(36, 60));
    this.updateMenu();
  }

  public loadRelatedChord() {
    const currentNotes: Note[] = this.noteGraph.notes;
    const relatedChord = generateRelatedChord(this.noteGraph.notes);

    // Add any missing notes
    relatedChord.forEach((note: Note) => {
      if (!currentNotes.includes(note)) {
        this.noteGraph.addNote(note);
      }
    });

    // Remote any removed notes
    currentNotes.forEach((note: Note) => {
      if (!relatedChord.includes(note)) {
        this.noteGraph.deleteNote(note);
      }
    });

    this.updateMenu();
  }

  public deleteNote() {
    this.noteGraph.deleteNote(sample(this.noteGraph.notes) as Note);
    this.updateMenu();
  }

  public deleteNoteNode() {
    this.noteGraph.deleteNode();
    this.updateMenu();
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
  }

  private updateDopplerSettings(settings: DopplerSettings) {
    this.microphone.updateDopplerSettings(settings);
    this.updateMenu();
  }

  public menu() {
    if (!this.microphone) {
      return null;
    }

    return (
      <div className='doppler-synth-menu'>
        <fieldset>
          <label>Notes</label>
          <div>
            <strong>{chordName(this.noteGraph.notes)}</strong>
            <br />
            {this.noteGraph.notes.map((note) => getNoteName(note)).join(', ')}
          </div>
          <div>
            <button onClick={this.loadRelatedChord}>Related chord</button>
            <button onClick={this.addNote}>Add</button>
            <button onClick={this.deleteNote}>Delete</button>
          </div>
        </fieldset>
        <fieldset>
          <label>Constellation</label>
          <div>
            <button onClick={this.regenerateGraph}>Regenerate</button>
          </div>
          <div>
            <button onClick={this.addNoteNode}>Add Node</button>
            <button onClick={this.deleteNoteNode}>Delete Node</button>
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
