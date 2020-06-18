import {autobind} from 'core-decorators';
import {isNumber} from 'lodash';
import MidiPlayer from 'midi-player-js';
import {MidiNotePublish} from '../MidiNoteBus';
import {MidiFileOptions} from './MidiFileSourceOptions.generated';
import {IMidiSource, MidiSourceParams} from './MidiSource';

@autobind
export class MidiFileSource implements IMidiSource<MidiFileOptions> {
  public options: MidiFileOptions;

  private midiPlayer: MidiPlayer.Player;
  private readonly publish: MidiNotePublish;

  constructor(params: MidiSourceParams<MidiFileOptions>) {
    this.publish = params.publish;
    this.options = params.options || {};
    this.midiPlayer = new MidiPlayer.Player();
    this.midiPlayer.on('midiEvent', (event: MidiPlayer.Event) => {
      const {name, noteNumber, velocity} = event;
      if (!noteNumber) {
        return;
      }
      console.log(event);
      if ((name === 'Note on' || name === 'Note off') && noteNumber && isNumber(velocity)) {
        this.publish({
          note: noteNumber,
          velocity: name === 'Note off' ? 0 : velocity
        });
      }
    });
    this.loadMidiFile();
  }

  public updateOptions(options: MidiFileOptions) {
    const midiChanged = options.midiFileUri !== this.options.midiFileUri;
    this.options = options;
    if (midiChanged) {
      this.midiPlayer.stop();
      this.loadMidiFile();
    }
  }

  public async loadMidiFile() {
    const {midiFileUri} = this.options;
    if (!midiFileUri) {
      return;
    }
    const response = await fetch(midiFileUri);
    const blob = await response.blob();
    const buffer = await (blob as any).arrayBuffer();
    this.midiPlayer.loadArrayBuffer(buffer);
    this.options.bpm = this.midiPlayer.tempo;
    this.midiPlayer.play();
  }

  public destroy() {
    this.midiPlayer.stop();
  }

  public menu(): React.ReactNode {
    return this.midiPlayer.tempo;
  }
}
