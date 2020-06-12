import {autobind} from 'core-decorators';
import {Note} from '../../audio/Note';
import {MidiNotePublish} from '../MidiNoteBus';
import {IMidiSource} from './MidiSource';

interface MidiInputSourceOptions {
  autoRelease: number;
}

@autobind
export class MidiInputSource implements IMidiSource {
  public options: MidiInputSourceOptions = {
    autoRelease: 0
  };

  private subscriptions: (() => void)[] = [];

  constructor(private readonly publish: MidiNotePublish) {
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

  private publishMidiEvent(event: WebMidi.MIDIMessageEvent) {
    const signal = event.data[0];
    const note: Note = event.data[1];
    const velocity = event.data[2];
    if (signal === 144) {
      this.publish({note, velocity});
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
