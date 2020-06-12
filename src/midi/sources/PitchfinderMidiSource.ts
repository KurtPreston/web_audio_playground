import {NoteValue} from '../../audio/Note';
import {MidiNotePublish} from '../MidiNoteBus';
import {IMidiSource, MidiSourceClass} from './MidiSource';

export const PitchfinderMidiSource: MidiSourceClass = class implements IMidiSource {
  constructor(publish: MidiNotePublish) {
    publish({
      note: NoteValue.C + 36,
      velocity: 1
    });
  }

  public destroy() {}

  public menu(): React.ReactNode {
    return 'Pitchfinder';
  }
};
