import {autobind} from 'core-decorators';
import React from 'react';
import {Compressor, setContext} from 'tone';
import {JsonSchemaForm} from '../../forms/JsonSchemaForm';
import {MidiNoteBus} from '../../midi/MidiNoteBus';
import {AutoChordMidiSource} from '../../midi/sources/AutoChordMidiSource';
import {MidiFileSource} from '../../midi/sources/MidiFileSource';
import {MidiInputSource} from '../../midi/sources/MidiInputSource';
import {IMidiSource, MidiSourceClass} from '../../midi/sources/MidiSource';
import {PitchfinderMidiSource} from '../../midi/sources/PitchfinderMidiSource';
import {IMidiSubscriber} from '../../midi/subscribers/MidiSubscriber';
import {MidiSynth} from '../../midi/subscribers/MidiSynth';
import {NoteGraphMidiPlayer} from '../../midi/subscribers/NoteGraphMidiController';
import {NoteGraph} from '../../sprites/NoteGraph/NoteGraph';
import {OuterSpace} from '../../sprites/OuterSpace';
import {Sprite} from '../../sprites/Sprite';
import {CablesOptionsSchema} from '../../types/schemas.generated';
import {WorldState} from '../../types/State';
import {Game, GameInfo, ResourceInitializers} from '../Game';
import {MidiSource} from './CablesOptions.generated';

interface CableSettings {
  midiSourceType?: MidiSource;
}

const midiSourceMap: {[source in MidiSource]: MidiSourceClass} = {
  midiInstrument: MidiInputSource,
  midiFile: MidiFileSource,
  pitchfinder: PitchfinderMidiSource,
  autoChord: AutoChordMidiSource
};

@autobind
export class CablesGame implements Game {
  private options: CableSettings = {};

  private noteGraph: NoteGraph;
  private background: OuterSpace;
  private readonly midiNoteBus: MidiNoteBus;
  private midiSource: IMidiSource | undefined;
  private readonly midiListeners: IMidiSubscriber[];

  constructor(world: WorldState, initializers: ResourceInitializers) {
    setContext(initializers.audioContext);
    const channel = new Compressor({
      threshold: -10,
      ratio: 5
    });
    channel.toDestination();
    channel.connect(initializers.analyserNode);

    this.background = new OuterSpace(world.dimensions);
    this.midiNoteBus = new MidiNoteBus();
    this.noteGraph = new NoteGraph({
      dimensions: world.dimensions
    });
    this.midiListeners = [
      new MidiSynth(this.midiNoteBus.subscribe, channel),
      new NoteGraphMidiPlayer({
        noteGraph: this.noteGraph,
        subscribe: this.midiNoteBus.subscribe
      })
    ];
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

  private updateSettings(options: CableSettings) {
    const {midiSourceType} = options;
    if (midiSourceType !== this.options.midiSourceType) {
      this.midiNoteBus.reset();
      if (this.midiSource) {
        this.midiSource.destroy();
      }

      this.midiSource = midiSourceType
        ? new midiSourceMap[midiSourceType](this.midiNoteBus.publish)
        : undefined;
    }
    this.options = options;
  }

  public info = Cables;
}

export const Cables: GameInfo = {
  title: 'Cables',
  url: '/cables',
  description: 'The tadpoles come to the surface when called',
  game: CablesGame
};
