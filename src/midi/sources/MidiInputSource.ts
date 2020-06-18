import {autobind} from 'core-decorators';
import {Note} from '../../audio/Note';
import {MidiNotePublish} from '../MidiNoteBus';
import {MidiInputSourceOptions} from './MidiInputSourceOptions.generated';
import {IMidiSource, MidiSourceParams} from './MidiSource';

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
