import {autobind} from 'core-decorators';
import {random, times} from 'lodash';
import React from 'react';
import {Compressor, setContext, ToneAudioNode} from 'tone';
import {chordName, chordsMatching} from '../audio/chords';
import {getNoteName, NoteValue} from '../audio/Note';
import {DopplerSettingsForm} from '../forms/DopplerSettingsForm';
import {JsonSchemaForm} from '../forms/JsonSchemaForm';
import {NoteGraphPhysicsForm} from '../forms/NoteGraphPhysicsForm';
import DopplerSynthModeSchema from '../schemas/DopplerSynthMode.json';
import {Microphone} from '../sprites/Microphone';
import {NoteGraph, NoteNode} from '../sprites/NoteGraph';
import {NoteGraphAutoplayer} from '../sprites/NoteGraphAutoplayer';
import {NoteGraphController} from '../sprites/NoteGraphController';
import {NoteGraphMidiPlayer} from '../sprites/NoteGraphMidiPlayer';
import {OuterSpace} from '../sprites/OuterSpace';
import {Sprite} from '../sprites/Sprite';
import {DopplerSettings} from '../types/DopplerSettings';
import {DopplerSynthMode} from '../types/DopplerSynthMode';
import {JsonSchema} from '../types/JsonSchema';
import {NoteGraphPhysics} from '../types/NoteGraphPhysics.d';
import {Dimensions, WorldState} from '../types/State';
import './DopplerSynth.scss';
import {Game, GameInfo, ResourceInitializers} from './Game';

@autobind
export class DopplerSynthGame implements Game {
  public info = DopplerSynth;

  // Sprites
  private noteGraph: NoteGraph;
  private noteGraphController: NoteGraphController;
  private readonly bg: Sprite;
  private readonly microphone: Microphone;

  // Other state
  private mode: DopplerSynthMode = 'auto';
  private readonly channel: ToneAudioNode;
  private lastDimensions: Dimensions;

  // Constants
  private updateMenu: () => void;

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
    this.noteGraphController = new NoteGraphAutoplayer(this.noteGraph, updateMenu);
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

  private reset() {
    this.noteGraph.nodes.forEach((node) => {
      this.noteGraph.deleteNode(node);
    });
    this.updateMenu();
    setTimeout(() => {
      this.noteGraph.destroy();
      this.noteGraphController.destroy();
      this.mode = 'auto';
      this.noteGraph = new NoteGraph({
        dimensions: this.lastDimensions,
        channel: this.channel
      });
      this.noteGraphController = new NoteGraphAutoplayer(this.noteGraph, this.updateMenu);
      this.updateMenu();
    }, 1000);
  }

  public gameTick(world: WorldState) {
    this.lastDimensions = world.dimensions;
    this.noteGraphController.tick(world);
  }

  private updateDopplerSettings(settings: DopplerSettings) {
    this.microphone.updateDopplerSettings(settings);
    this.updateMenu();
  }

  private updatePhysics(physics: NoteGraphPhysics) {
    this.noteGraph.physics = physics;
    this.updateMenu();
  }

  public updateMode(mode: DopplerSynthMode) {
    this.noteGraphController.destroy();
    this.mode = mode;
    this.noteGraphController =
      mode === 'midi'
        ? new NoteGraphMidiPlayer(this.noteGraph, this.updateMenu)
        : new NoteGraphAutoplayer(this.noteGraph, this.updateMenu);
  }

  public menu() {
    if (!this.microphone) {
      return null;
    }

    const notesArray: NoteValue[] = Array.from(this.noteGraphController.noteValues);

    return (
      <div className='doppler-synth-menu'>
        <fieldset>
          <label>DopplerSynth</label>
          <button onClick={this.reset}>Reset</button>
          <JsonSchemaForm
            value={this.mode}
            onChange={this.updateMode}
            schema={DopplerSynthModeSchema as JsonSchema}
          />
        </fieldset>
        <fieldset>
          <label>Notes</label>
          <div>
            <strong>{chordsMatching(notesArray).map(chordName).join(' or ')}</strong>
            <br />
            {notesArray.map((note: NoteValue) => getNoteName(note)).join(', ')}
          </div>
        </fieldset>
        <fieldset>
          <label>Actions</label>
          <div />
          <div>
            <div>
              {this.noteGraphController.actions.map(({name, action}, idx) => (
                <button key={idx} onClick={action}>
                  {name}
                </button>
              ))}
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
