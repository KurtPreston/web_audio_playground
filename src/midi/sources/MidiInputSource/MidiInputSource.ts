import {autobind} from 'core-decorators';
import {minBy} from 'lodash';
import {Note, noteToNoteValue, NoteValue} from '../../../audio/Note';
import {MidiNotePublish} from '../../MidiNoteBus';
import {IMidiSource, MidiSourceParams} from '../MidiSource';
import {MidiInputSourceOptions} from './MidiInputSourceOptions.generated';

@autobind
export class MidiInputSource implements IMidiSource<MidiInputSourceOptions> {
  public options: MidiInputSourceOptions = {
    autoRelease: 0
  };

  private subscriptions: (() => void)[] = [];
  private readonly publish: MidiNotePublish;

  constructor(params: MidiSourceParams<MidiInputSourceOptions>) {
    this.publish = params.publish;
    this.initialize();
  }

  private async initialize() {
    const midiAccess = await navigator.requestMIDIAccess();
    const inputs = midiAccess.inputs;

    inputs.forEach((input) => {
      input.addEventListener('midimessage', this.publishMidiEvent);
      this.subscriptions.push(() => {
        input.removeEventListener('midimessage', this.publishMidiEvent as any);
      });
    });
  }

  public updateOptions(options: MidiInputSourceOptions) {
    this.options = options;
  }

  private publishMidiEvent(event: WebMidi.MIDIMessageEvent) {
    const signal = event.data[0];
    const note: Note = event.data[1];
    const velocity = event.data[2];
    if (signal === 144) {
      const nearestNote = this.options.filterNotes
        ? nearestFilteredNote(note, this.options.filterNotes)
        : note;

      this.publish({note: nearestNote, velocity});
    }
  }

  public destroy() {
    this.subscriptions.forEach((sub) => sub());
  }

  public menu(): React.ReactNode {
    if (this.subscriptions.length) {
      return 'Connected';
    } else {
      return 'Not Connected';
    }
  }
}

function nearestFilteredNote(note: Note, allowedNotes: NoteValue[]): Note {
  const noteValue = noteToNoteValue(note);
  if (allowedNotes.includes(noteValue)) {
    return note;
  }

  let minDistance = Number.POSITIVE_INFINITY;
  allowedNotes.forEach((allowedNote: NoteValue) => {
    const diff = minBy(
      [noteValue - allowedNote, noteValue - (allowedNote + 12)],
      Math.abs
    ) as number;
    if (Math.abs(diff) < Math.abs(minDistance)) {
      minDistance = diff;
    }
  });

  return note - minDistance;
}
