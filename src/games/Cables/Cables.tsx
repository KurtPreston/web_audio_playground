import {autobind} from 'core-decorators';
import {merge} from 'lodash';
import React from 'react';
import {Compressor} from 'tone';
import {Note} from '../../audio/Note';
import {JsonSchemaForm} from '../../forms/JsonSchemaForm';
import {diff} from '../../math/diff';
import {unzip, zip} from '../../math/zip';
import {MidiNoteBus} from '../../midi/MidiNoteBus';
import {buildMidiSource} from '../../midi/sources/buildMidiSource';
import {IMidiSource} from '../../midi/sources/MidiSource';
import {IMidiSubscriber} from '../../midi/subscribers/MidiSubscriber';
import {MidiSynth} from '../../midi/subscribers/MidiSynth';
import {NoteGraphMidiPlayer} from '../../midi/subscribers/NoteGraphMidiController';
import {Keyboard} from '../../sprites/Keyboard';
import {defaultNoteGraphOptions, NoteGraph} from '../../sprites/NoteGraph/NoteGraph';
import {OuterSpace} from '../../sprites/OuterSpace';
import {Sprite} from '../../sprites/Sprite';
import {CablesOptionsSchema} from '../../types/schemas.generated';
import {Dimensions, WorldState} from '../../types/State';
import {Game, GameInfo, ResourceInitializers} from '../Game';
import {CablesOptions} from './CablesOptions.generated';
import {defaultCablesOptions} from './defaultCablesOptions';

const OPTIONS_KEY = 'o';

@autobind
export class CablesGame implements Game {
  private options: CablesOptions = defaultCablesOptions;

  // Sprites
  private readonly noteGraph: NoteGraph;
  private readonly keyboard: Keyboard;
  private readonly background: OuterSpace;

  // Midi
  private readonly midiNoteBus: MidiNoteBus;
  private midiSource: IMidiSource<any> | undefined;
  private readonly midiSynth: MidiSynth;
  private readonly midiListeners: IMidiSubscriber[];

  constructor(
    world: WorldState,
    initializers: ResourceInitializers,
    private readonly updateMenu: () => void
  ) {
    // Setup audio
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
    this.keyboard = new Keyboard(this.midiNoteBus.notes);
    this.midiListeners = [
      this.midiSynth,
      new NoteGraphMidiPlayer({
        noteGraph: this.noteGraph,
        subscribe: this.midiNoteBus.subscribe
      })
    ];

    // Initialize midi
    this.updateSettings(this.initialOptions(world.dimensions));
  }

  private initialOptions(dimensions: Dimensions): CablesOptions {
    const queryParams = new URLSearchParams(window.location.search);
    const optionsString = queryParams.get(OPTIONS_KEY);
    let partialOptions: Partial<CablesOptions> = {};
    if (optionsString) {
      try {
        partialOptions = unzip(optionsString);
      } catch (err) {
        console.warn('Invalid query params', optionsString);
      }
    }

    return merge(
      {
        ...defaultCablesOptions,
        noteGraph: defaultNoteGraphOptions(dimensions)
      },
      partialOptions
    );
  }

  public destroy() {
    this.midiListeners.forEach((listener: IMidiSubscriber) => listener.destroy());
  }

  public gameTick(world: WorldState) {}

  public sprites(): Sprite[] {
    return [this.background, this.noteGraph, this.keyboard];
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

      this.midiSource?.updateOptions(options.midiSource.options || {});
    }

    this.midiSynth.updateSynth(options.synth);
    Object.assign(this.noteGraph.options, options.noteGraph);

    this.options = options;
    this.updateMenu();

    const optionsString = zip(diff(options, defaultCablesOptions));
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set(OPTIONS_KEY, optionsString);
    window.history.replaceState(options, 'Options', `?${urlParams.toString()}`);
  }
}

class CablesPreview implements Game {
  private keyboard: Keyboard;

  constructor(world: WorldState) {
    this.keyboard = new Keyboard(new Set<Note>());
  }

  public sprites(): Sprite[] {
    return [this.keyboard];
  }
}

export const Cables: GameInfo = {
  title: 'Cables',
  url: '/cables',
  description: 'A visual MIDI synth',
  game: CablesGame,
  preview: CablesPreview
};
