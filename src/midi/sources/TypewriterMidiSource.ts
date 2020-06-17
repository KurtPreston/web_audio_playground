import {autobind} from 'core-decorators';
import {isNumber} from 'lodash';
import {Note, NoteValue} from '../../audio/Note';
import {MidiNotePublish} from '../MidiNoteBus';
import {IMidiSource} from './MidiSource';

type Key = string;

@autobind
export class TypewriteMidiSource implements IMidiSource {
  private keys = new Map<Key, Note>();

  private keyboardMap: {[key: string]: NoteValue} = {
    s: NoteValue.B,
    d: NoteValue.C,
    r: NoteValue.Csharp,
    f: NoteValue.D,
    t: NoteValue.Dsharp,
    g: NoteValue.E,
    h: NoteValue.F,
    u: NoteValue.Fsharp,
    j: NoteValue.G,
    i: NoteValue.Gsharp,
    k: NoteValue.A,
    o: NoteValue.Asharp,
    l: NoteValue.B
  };

  constructor(private readonly publish: MidiNotePublish) {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown(event: KeyboardEvent) {
    const {key} = event;
    const noteValue: NoteValue | undefined = this.keyboardMap[key];
    if (isNumber(noteValue) && !this.keys.has(key)) {
      const note: Note = noteValue + 48;
      this.keys.set(key, note);
      this.publish({
        note,
        velocity: 127
      });
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    const {key} = event;
    const note = this.keys.get(key);
    if (isNumber(note)) {
      this.keys.delete(key);
      this.publish({
        note,
        velocity: 0
      });
    }
  }

  public destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  public menu(): React.ReactNode {
    return 'Keyboard';
  }
}
