import {NoteValue} from '../../audio/Note';
import {MidiNotePublish} from '../MidiNoteBus';
import {IMidiSource, MidiSourceClass} from './MidiSource';
interface AutoChordMidiSourceOptions {}

export const AutoChordMidiSource: MidiSourceClass = class implements IMidiSource {
  public options: AutoChordMidiSourceOptions = {};

  constructor(publish: MidiNotePublish) {
    publish({
      note: NoteValue.C + 36,
      velocity: 1
    });
  }

  public destroy() {}

  public menu(): React.ReactNode {
    return 'Auto Chord!';
  }
};
