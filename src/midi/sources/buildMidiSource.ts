import {MidiSourceConfig} from '../../games/Cables/CablesOptions.generated';
import {MidiNotePublish} from '../MidiNoteBus';
import {AutoChordMidiSource} from './AutoChordMidiSource';
import {MidiFileSource} from './MidiFileSource';
import {MidiInputSource} from './MidiInputSource';
import {IMidiSource} from './MidiSource';
import {PitchfinderMidiSource} from './PitchfinderMidiSource';
import {TypewriteMidiSource} from './TypewriterMidiSource';

interface BuildMidiSourceParams {
  config: MidiSourceConfig;
  publish: MidiNotePublish;
}

export function buildMidiSource(params: BuildMidiSourceParams): IMidiSource {
  const {config, publish} = params;
  switch (config.source) {
    case 'midiInput':
      return new MidiInputSource(publish);
    case 'midiFile':
      return new MidiFileSource(publish);
    case 'autoChord':
      return new AutoChordMidiSource(publish);
    case 'pitchfinder':
      return new PitchfinderMidiSource(publish);
    case 'computerKeyboard':
      return new TypewriteMidiSource(publish);
    default:
      throw new Error('Unexpected midi source type');
  }
}
