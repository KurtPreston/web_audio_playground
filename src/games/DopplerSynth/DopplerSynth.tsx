import {autobind} from 'core-decorators';
import {random, times} from 'lodash';
import React from 'react';
import {Compressor, setContext, ToneAudioNode} from 'tone';
import {chordName, chordsMatching} from '../../audio/chords';
import {getNoteName, NoteValue} from '../../audio/Note';
import {JsonSchemaForm} from '../../forms/JsonSchemaForm';
import {Microphone} from '../../sprites/Microphone/Microphone';
import {MicrophoneAudioSettings} from '../../sprites/Microphone/MicrophoneAudioSettings.generated';
import {NoteGraph, NoteNode} from '../../sprites/NoteGraph/NoteGraph';
import {NoteGraphAutoplayer} from '../../sprites/NoteGraph/NoteGraphAutoplayer';
import {NoteGraphAction, NoteGraphController} from '../../sprites/NoteGraph/NoteGraphController';
import {NoteGraphMidiPlayer} from '../../sprites/NoteGraph/NoteGraphMidiPlayer';
import {NoteGraphPhysics} from '../../sprites/NoteGraph/NoteGraphPhysics.generated';
import {NoteGraphPhysicsForm} from '../../sprites/NoteGraph/NoteGraphPhysicsForm';
import {OuterSpace} from '../../sprites/OuterSpace';
import {Sprite} from '../../sprites/Sprite';
import {DopplerSynthModeSchema, MicrophoneAudioSettingsSchema} from '../../types/schemas.generated';
import {Dimensions, WorldState} from '../../types/State';
import {Game, GameInfo, ResourceInitializers} from '../Game';
import './DopplerSynth.scss';
import {DopplerSynthMode} from './DopplerSynthMode.generated';

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

  // References
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
      dimensions
    });
    this.microphone = new Microphone({
      getNoteNodes: this.getNoteNodes,
      channel: this.channel,
      dimensions: world.dimensions
    });
    this.noteGraphController = new NoteGraphAutoplayer({
      noteGraph: this.noteGraph,
      onNotesUpdated: updateMenu,
      channel: this.channel,
      microphone: this.microphone
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
        dimensions: this.lastDimensions
      });
      this.noteGraphController = new NoteGraphAutoplayer({
        noteGraph: this.noteGraph,
        onNotesUpdated: this.updateMenu,
        channel: this.channel,
        microphone: this.microphone
      });
      this.updateMenu();
    }, 1000);
  }

  public gameTick(world: WorldState) {
    this.lastDimensions = world.dimensions;
    this.noteGraphController.tick(world);
  }

  private updateAudioSettings(settings: MicrophoneAudioSettings) {
    this.microphone.updateAudioSettings(settings);
    this.updateMenu();
  }

  private updatePhysics(physics: NoteGraphPhysics) {
    this.noteGraph.physics = physics;
    this.updateMenu();
  }

  public updateMode(mode: DopplerSynthMode) {
    this.noteGraphController.destroy();
    this.mode = mode;
    if (mode === 'midi') {
      this.updateAudioSettings({
        ...this.microphone.audioSettings,
        maxAudibleDistance: 1500,
        maxNodeVolume: -12
      });
      this.updatePhysics({
        ...this.noteGraph.physics,
        volumeRampTime: 10
      });
      this.noteGraphController = new NoteGraphMidiPlayer({
        noteGraph: this.noteGraph,
        onNotesUpdated: this.updateMenu,
        channel: this.channel
      });
    } else if (mode === 'auto') {
      this.updateAudioSettings({
        ...this.microphone.audioSettings,
        maxAudibleDistance: 600,
        maxNodeVolume: -4
      });
      this.updatePhysics({
        ...this.noteGraph.physics,
        volumeRampTime: 1000
      });
      this.noteGraphController = new NoteGraphAutoplayer({
        noteGraph: this.noteGraph,
        onNotesUpdated: this.updateMenu,
        channel: this.channel,
        microphone: this.microphone
      });
    }

    this.updateMenu();
  }

  public menu() {
    if (!this.microphone) {
      return null;
    }

    const notesArray: NoteValue[] = Array.from(this.noteGraphController.noteValues);

    return (
      <div className='doppler-synth-menu'>
        <fieldset className='doppler-synth-menu-mode'>
          <label>DopplerSynth</label>
          <JsonSchemaForm
            value={this.mode}
            onChange={this.updateMode}
            schema={{
              ...DopplerSynthModeSchema,
              title: 'Mode'
            }}
          />
          {this.noteGraphController.controls && this.noteGraphController.controls()}
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
              {this.noteGraphController.actions.map(
                (actionGroup: NoteGraphAction[], idx: number) => (
                  <div key={idx}>
                    {actionGroup.map(({action, name}, idx) => (
                      <button key={idx} onClick={action}>
                        {name}
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
            <div>
              <button onClick={this.addEdges}>Add Edges</button>
              <button onClick={this.deleteEdges}>Delete Edges</button>
            </div>
            <div>
              <button onClick={this.splitConstellation}>Split Groups</button>
              <button onClick={this.mergeConstellations}>Merge Groups</button>
            </div>
            <div>
              <button onClick={this.reset}>Reset</button>
            </div>
          </div>
        </fieldset>
        <JsonSchemaForm
          value={this.microphone.audioSettings}
          onChange={this.updateAudioSettings}
          schema={{
            ...MicrophoneAudioSettingsSchema,
            title: 'Audio'
          }}
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
  game: DopplerSynthGame
};
