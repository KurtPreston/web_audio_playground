import {autobind} from 'core-decorators';
import React from 'react';
import {Compressor, setContext} from 'tone';
import {JsonSchemaForm} from '../../forms/JsonSchemaForm';
import {MidiNoteBus} from '../../midi/MidiNoteBus';
import {buildMidiSource} from '../../midi/sources/buildMidiSource';
import {IMidiSource} from '../../midi/sources/MidiSource';
import {IMidiSubscriber} from '../../midi/subscribers/MidiSubscriber';
import {MidiSynth} from '../../midi/subscribers/MidiSynth';
import {NoteGraphMidiPlayer} from '../../midi/subscribers/NoteGraphMidiController';
import {defaultNoteGraphOptions, NoteGraph} from '../../sprites/NoteGraph/NoteGraph';
import {OuterSpace} from '../../sprites/OuterSpace';
import {Sprite} from '../../sprites/Sprite';
import {CablesOptionsSchema} from '../../types/schemas.generated';
import {WorldState} from '../../types/State';
import {Game, GameInfo, ResourceInitializers} from '../Game';
import {CablesOptions} from './CablesOptions.generated';

@autobind
export class CablesGame implements Game {
  private options: CablesOptions;

  private readonly noteGraph: NoteGraph;
  private background: OuterSpace;
  private readonly midiNoteBus: MidiNoteBus;
  private midiSource: IMidiSource | undefined;
  private readonly midiSynth: MidiSynth;
  private readonly midiListeners: IMidiSubscriber[];

  constructor(
    world: WorldState,
    initializers: ResourceInitializers,
    private readonly updateMenu: () => void
  ) {
    // Build options
    this.options = {
      synth: {
        oscillator: {
          type: 'triangle',
          partialCount: 3
        },
        envelope: {
          attack: 0.01,
          attackCurve: 'linear',
          decay: 0.1,
          decayCurve: 'exponential',
          sustain: 0.3,
          release: 1,
          releaseCurve: 'exponential'
        },
        volume: -40
      },
      noteGraph: defaultNoteGraphOptions(world.dimensions)
    };

    // Setup audio
    setContext(initializers.audioContext);
    const channel = new Compressor({
      threshold: -10,
      ratio: 5
    });
    channel.toDestination();
    channel.connect(initializers.analyserNode);

    // Build sprites
    this.background = new OuterSpace(world.dimensions);
    this.midiNoteBus = new MidiNoteBus();
    this.noteGraph = new NoteGraph({
      dimensions: world.dimensions
    });
    this.midiSynth = new MidiSynth({
      options: this.options.synth,
      channel,
      midiNoteSubscribe: this.midiNoteBus.subscribe
    });
    this.midiListeners = [
      this.midiSynth,
      new NoteGraphMidiPlayer({
        noteGraph: this.noteGraph,
        subscribe: this.midiNoteBus.subscribe
      })
    ];

    // Initialize midi
    this.updateSettings(this.options);
  }

  public destroy() {
    this.midiListeners.forEach((listener: IMidiSubscriber) => listener.destroy());
  }

  public gameTick(world: WorldState) {}

  public sprites(): Sprite[] {
    return [this.background, this.noteGraph];
  }

  public menu(): React.ReactNode {
    return (
      <JsonSchemaForm
        value={this.options}
        onChange={this.updateSettings}
        schema={CablesOptionsSchema}
      />
    );
  }

  private updateSettings(options: CablesOptions) {
    if (options.midiSource) {
      const midiSourceType = options.midiSource.source;
      if (midiSourceType !== this.options?.midiSource?.source) {
        this.midiNoteBus.reset();
        if (this.midiSource) {
          this.midiSource.destroy();
        }

        this.midiSource = buildMidiSource({
          config: options.midiSource,
          publish: this.midiNoteBus.publish
        });
      }
    }

    this.midiSynth.updateSynth(options.synth);
    Object.assign(this.noteGraph.options, options.noteGraph);

    this.options = options;
    this.updateMenu();
  }

  public info = Cables;
}

export const Cables: GameInfo = {
  title: 'Cables',
  url: '/cables',
  description: 'The tadpoles come to the surface when called',
  game: CablesGame
};
