import {autobind} from 'core-decorators';
import {chunk, random, times} from 'lodash';
import React from 'react';
import {Compressor, ToneAudioNode, Transport} from 'tone';
import {chordsMatching} from '../../audio/chords';
import {getNoteName, NoteValue} from '../../audio/Note';
import {Sequencer} from '../../audio/Sequencer/Sequencer';
import {SequencerOptions} from '../../audio/Sequencer/SequencerOptions.generated';
import {JsonSchemaForm} from '../../forms/JsonSchemaForm';
import {Astronaut} from '../../sprites/Astronaut';
import {WanderingBeatFactory} from '../../sprites/Beat/WanderingBeatFactory';
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
import {
  DopplerSynthSettingsSchema,
  MicrophoneAudioSettingsSchema,
  SequencerOptionsSchema
} from '../../types/schemas.generated';
import {Dimensions, WorldState} from '../../types/State';
import {Game, GameInfo, ResourceInitializers} from '../Game';
import './DopplerSynth.scss';
import {DopplerSynthMode} from './DopplerSynthMode.generated';
import {DopplerSynthSettings} from './DopplerSynthSettings.generated';

const defaultSettings: DopplerSynthSettings = {
  mode: 'auto',
  sprites: {
    noteGraph: true,
    snareWanderers: 0,
    hatWanderers: 0,
    kickWanderers: 0,
    bassWanderers: 0,
    melodyWanderers: 0
  }
};

@autobind
export class DopplerSynthGame implements Game {
  // Sprites
  private noteGraph: NoteGraph;
  private noteGraphController: NoteGraphController;
  private readonly bg: Sprite;
  private readonly astronaut: Astronaut;
  private readonly beat: WanderingBeatFactory;
  private readonly sequencer: Sequencer;

  // Other state
  private settings: DopplerSynthSettings = defaultSettings;
  private audioSettings: MicrophoneAudioSettings;
  private sequencerOptions: SequencerOptions;
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

    Transport.bpm.value = 90;

    this.audioSettings = {
      dopplerMode: DopplerMode.On,
      speedOfSound: 3000,
      distanceVolumeRolloff: 4,
      maxAudibleDistance: Math.round(
        Math.sqrt(world.dimensions.width * world.dimensions.height) / 3.5
      ),
      minVolume: -50,
      maxVolume: -10
    };
    this.sequencerOptions = {
      bpm: 90,
      chart: 'random',
      melody: 'chord'
    };
    this.bg = new OuterSpace(dimensions);
    this.noteGraph = new NoteGraph({
      dimensions
    });
    this.astronaut = new Astronaut({
      bubbleSize: this.audioSettings.maxAudibleDistance,
      getNoteValues: () => this.sequencer.chord.noteValues,
      channel: this.channel,
      dimensions: world.dimensions
    });
    this.mic = new Microphone({
      channel: this.channel,
      audioSettings: this.audioSettings,
      micPosition: () => this.astronaut.traveler
    });
    this.sequencer = new Sequencer(this.sequencerOptions);
    this.noteGraphController = new NoteGraphAutoplayer({
      noteGraph: this.noteGraph,
      onNotesUpdated: updateMenu,
      mic: this.mic,
      sequencer: this.sequencer
    });
    this.beat = new WanderingBeatFactory({
      dimensions: world.dimensions,
      mic: this.mic,
      sequencer: this.sequencer,
      collection: this.settings.sprites
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
    this.astronaut.bubbleSize = this.audioSettings.maxAudibleDistance;
    this.updateMenu();
  }

  private updateSequencerOptions(options: SequencerOptions) {
    this.sequencerOptions = options;
    this.sequencer.setOptions(options);
    this.updateMenu();
  }

  private updatePhysics(physics: NoteGraphOptions) {
    this.noteGraph.options = physics;
    this.updateMenu();
  }

  private updateSettings(settings: DopplerSynthSettings) {
    if (this.settings.mode !== settings.mode) {
      this.updateMode(settings.mode);
    }

    // Create or destroy notegraph
    if (this.settings.sprites.noteGraph !== settings.sprites.noteGraph) {
      if (settings.sprites.noteGraph) {
        this.updateMode(settings.mode);
      } else {
        this.noteGraphController.destroy();
      }
    }

    // Create or destroy  wanderers
    this.beat.setCollection(settings.sprites);

    this.settings = settings;

    this.updateMenu();
  }

  public updateMode(mode: DopplerSynthMode) {
    this.noteGraphController.destroy();
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
            value={this.settings}
            onChange={this.updateSettings}
            schema={{
              ...DopplerSynthSettingsSchema,
              title: 'Mode'
            }}
          />
          {this.noteGraphController.controls && this.noteGraphController.controls()}
        </fieldset>
        <fieldset>
          <JsonSchemaForm
            value={this.sequencerOptions}
            onChange={this.updateSequencerOptions}
            schema={SequencerOptionsSchema}
          />
        </fieldset>
        <fieldset>
          <label>Progression</label>
          <table>
            <tbody>
              {chunk(this.sequencer.chords, 4).map((chords, chunkIdx) => (
                <tr key={chunkIdx}>
                  {chords.map((chord, i) => {
                    if (this.sequencer.idx === i + chunkIdx * 4) {
                      return (
                        <td key={i}>
                          <b>{chord.name}</b>
                        </td>
                      );
                    } else {
                      return <td key={i}>{chord.name}</td>;
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <label>Notes</label>
          <div>
            <strong>
              {chordsMatching(notesArray)
                .map((c) => c.name)
                .join(' or ')}
            </strong>
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
      bubbleSize: 40,
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
  intro:
    'One brave astronaut set out to prove there was music in the vacuum of space. This is what he heard.',
  game: DopplerSynthGame,
  preview: DopplerSynthPreview
};
