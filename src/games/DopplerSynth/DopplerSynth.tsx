import {autobind} from 'core-decorators';
import {chunk, random, times} from 'lodash';
import React from 'react';
import {Compressor, ToneAudioNode} from 'tone';
import {chordName, chordsMatching} from '../../audio/chords';
import {getNoteName, NoteValue} from '../../audio/Note';
import {Sequencer} from '../../audio/Sequencer';
import {JsonSchemaForm} from '../../forms/JsonSchemaForm';
import {Astronaut} from '../../sprites/Astronaut';
import {BeatSequencer} from '../../sprites/Beat/BeatSequencer';
import {Microphone} from '../../sprites/Microphone/Microphone';
import {
  DopplerMode,
  MicrophoneAudioSettings
} from '../../sprites/Microphone/MicrophoneAudioSettings.generated';
import {NoteGraph, NoteNode} from '../../sprites/NoteGraph/NoteGraph';
import {NoteGraphAutoplayer} from '../../sprites/NoteGraph/NoteGraphAutoplayer';
import {NoteGraphAction, NoteGraphController} from '../../sprites/NoteGraph/NoteGraphController';
import {NoteGraphMidiPlayer} from '../../sprites/NoteGraph/NoteGraphMidiPlayer';
import {NoteGraphOptions} from '../../sprites/NoteGraph/NoteGraphOptions.generated';
import {NoteGraphOptionsForm} from '../../sprites/NoteGraph/NoteGraphOptionsForm';
import {OuterSpace} from '../../sprites/OuterSpace';
import {Sprite} from '../../sprites/Sprite';
import {DopplerSynthModeSchema, MicrophoneAudioSettingsSchema} from '../../types/schemas.generated';
import {Dimensions, WorldState} from '../../types/State';
import {Game, GameInfo, ResourceInitializers} from '../Game';
import './DopplerSynth.scss';
import {DopplerSynthMode} from './DopplerSynthMode.generated';

@autobind
export class DopplerSynthGame implements Game {
  // Sprites
  private noteGraph: NoteGraph;
  private noteGraphController: NoteGraphController;
  private readonly bg: Sprite;
  private readonly astronaut: Astronaut;
  private readonly beat: BeatSequencer;
  private readonly sequencer: Sequencer;

  // Other state
  private mode: DopplerSynthMode = 'auto';
  private audioSettings: MicrophoneAudioSettings;
  private readonly mic: Microphone;
  private readonly channel: ToneAudioNode;
  private lastDimensions: Dimensions;

  // References
  private updateMenu: () => void;

  constructor(world: WorldState, initializers: ResourceInitializers, updateMenu: () => void) {
    this.channel = new Compressor({
      threshold: -10,
      ratio: 5
    });
    this.channel.toDestination();
    this.channel.connect(initializers.analyserNode);
    const {dimensions} = world;

    this.audioSettings = {
      dopplerMode: DopplerMode.On,
      speedOfSound: 3000,
      distanceVolumeRolloff: 3,
      maxAudibleDistance: Math.min(world.dimensions.width, world.dimensions.height),
      minVolume: -50,
      maxVolume: -10
    };
    this.bg = new OuterSpace(dimensions);
    this.noteGraph = new NoteGraph({
      dimensions
    });
    this.astronaut = new Astronaut({
      getNoteValues: () => this.noteGraphController.noteValues,
      channel: this.channel,
      dimensions: world.dimensions
    });
    this.mic = new Microphone({
      channel: this.channel,
      audioSettings: this.audioSettings,
      micPosition: () => this.astronaut.traveler
    });
    this.sequencer = new Sequencer();
    this.noteGraphController = new NoteGraphAutoplayer({
      noteGraph: this.noteGraph,
      onNotesUpdated: updateMenu,
      mic: this.mic,
      sequencer: this.sequencer
    });
    this.beat = new BeatSequencer({
      dimensions: world.dimensions,
      mic: this.mic,
      getNotes: () => this.noteGraphController.noteValues
    });
    this.lastDimensions = world.dimensions;
    this.updateMenu = updateMenu;
  }

  public sprites(): Sprite[] {
    return [this.bg, this.astronaut, this.noteGraph, this.beat];
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
      this.noteGraphController.destroy();
      this.noteGraph.destroy();
      this.mode = 'auto';
      this.noteGraph = new NoteGraph({
        dimensions: this.lastDimensions
      });
      this.noteGraphController = new NoteGraphAutoplayer({
        noteGraph: this.noteGraph,
        onNotesUpdated: this.updateMenu,
        mic: this.mic,
        sequencer: this.sequencer
      });
      this.updateMenu();
    }, 1000);
  }

  public gameTick(world: WorldState) {
    this.lastDimensions = world.dimensions;
    this.noteGraphController.tick(world);
  }

  private updateAudioSettings(settings: Partial<MicrophoneAudioSettings>) {
    Object.assign(this.audioSettings, settings);
    this.updateMenu();
  }

  private updatePhysics(physics: NoteGraphOptions) {
    this.noteGraph.options = physics;
    this.updateMenu();
  }

  public updateMode(mode: DopplerSynthMode) {
    this.noteGraphController.destroy();
    this.mode = mode;
    if (mode === 'midi') {
      this.updateAudioSettings({
        ...this.noteGraphController.audioSettings,
        maxAudibleDistance: 1500,
        maxVolume: -12
      });
      this.noteGraphController = new NoteGraphMidiPlayer({
        noteGraph: this.noteGraph,
        onNotesUpdated: this.updateMenu,
        channel: this.channel,
        dimensions: this.lastDimensions
      });
    } else if (mode === 'auto') {
      this.updateAudioSettings({
        maxAudibleDistance: 600,
        maxVolume: -10
      });
      this.noteGraphController = new NoteGraphAutoplayer({
        noteGraph: this.noteGraph,
        onNotesUpdated: this.updateMenu,
        mic: this.mic,
        sequencer: this.sequencer
      });
    }

    this.updateMenu();
  }

  public menu() {
    if (!this.astronaut) {
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
          <label>Progression</label>
          <table>
            <tbody>
              {chunk(this.sequencer.chordProgression, 4).map((chords, chunkIdx) => (
                <tr>
                  {chords.map((chord, i) => {
                    if (this.sequencer.idx === i + chunkIdx * 4) {
                      return (
                        <td>
                          <b>{chordName(chord)}</b>
                        </td>
                      );
                    } else {
                      return <td>{chordName(chord)}</td>;
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
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
          value={this.audioSettings}
          onChange={this.updateAudioSettings}
          schema={{
            ...MicrophoneAudioSettingsSchema,
            title: 'Audio'
          }}
        />
        <NoteGraphOptionsForm value={this.noteGraph.options} onChange={this.updatePhysics} />
      </div>
    );
  }
}

export class DopplerSynthPreview implements Game {
  private readonly astronaut: Astronaut;
  private readonly notes = new Set<NoteValue>();

  constructor(world: WorldState) {
    this.astronaut = new Astronaut({
      dimensions: world.dimensions,
      getNoteValues: () => this.notes,
      channel: null
    });
  }

  public sprites(): Sprite[] {
    return [this.astronaut];
  }
}

export const DopplerSynth: GameInfo = {
  title: 'DopplerSynth',
  url: '/doppler',
  description: (
    <div>
      <p>They say there's no sound in outer space, but they've never been.</p>
      <p>The astronaut is your ears to hear the sounds which whirl around the stars.</p>
    </div>
  ),
  game: DopplerSynthGame,
  preview: DopplerSynthPreview
};
