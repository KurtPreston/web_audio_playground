import {MidiNotePublish} from '../MidiNoteBus';
import {AutoChordMidiSource} from './AutoChordMidiSource/AutoChordMidiSource';
import {MidiFileSource} from './MidiFileSource/MidiFileSource';
import {MidiInputSource} from './MidiInputSource/MidiInputSource';
import {IMidiSource} from './MidiSource';
import {
  ChordGeneratorOptions,
  ComputerKeyboardOptions,
  MicPitchDetectionOptions,
  MidiFileOptions,
  MidiInputSourceOptions,
  MidiSourceConfig
} from './MidiSourceConfig.generated';
import {PitchfinderMidiSource} from './PitchfinderMidiSource/PitchfinderMidiSource';
import {TypewriteMidiSource} from './TypewriterMidiSource/TypewriterMidiSource';

interface BuildMidiSourceParams {
  config: MidiSourceConfig;
  publish: MidiNotePublish;
}

export function buildMidiSource(params: BuildMidiSourceParams): IMidiSource<any> {
  const {config, publish} = params;
  const {options, source} = config;
  switch (source) {
    case 'midiInput':
      return new MidiInputSource({
        publish,
        options: options as MidiInputSourceOptions
      });
    case 'midiFile':
      return new MidiFileSource({
        publish,
        options: options as MidiFileOptions
      });
    case 'autoChord':
      return new AutoChordMidiSource({
        publish,
        options: options as ChordGeneratorOptions
      });
    case 'pitchfinder':
      return new PitchfinderMidiSource({
        publish,
        options: options as MicPitchDetectionOptions
      });
    case 'computerKeyboard':
      return new TypewriteMidiSource({
        publish,
        options: options as ComputerKeyboardOptions
      });
    default:
      throw new Error('Unexpected midi source type');
  }
}
