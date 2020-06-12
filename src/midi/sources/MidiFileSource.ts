import {isNumber} from 'lodash';
import MidiPlayer from 'midi-player-js';
import {MidiNotePublish} from '../MidiNoteBus';
import {IMidiSource, MidiSourceClass} from './MidiSource';

interface MidiFileSourceOptions {
  bpm: number;
}

export const MidiFileSource: MidiSourceClass = class implements IMidiSource {
  public options: MidiFileSourceOptions = {
    bpm: 120
  };

  private midiPlayer: MidiPlayer.Player;

  constructor(private readonly publish: MidiNotePublish) {
    this.midiPlayer = new MidiPlayer.Player();
    this.initialize();
  }

  public async initialize() {
    const response = await fetch('/moonlight_sonata.mid');
    const blob = await response.blob();
    const buffer = await (blob as any).arrayBuffer();
    this.midiPlayer.loadArrayBuffer(buffer);
    this.options.bpm = this.midiPlayer.tempo;
    this.midiPlayer.on('midiEvent', (event: MidiPlayer.Event) => {
      const {name, noteNumber, velocity} = event;
      if (!noteNumber) {
        return;
      }
      if ((name === 'Note on' || name === 'Note off') && noteNumber && isNumber(velocity)) {
        this.publish({
          note: noteNumber,
          velocity
        });
      }
    });
    this.midiPlayer.play();
  }

  public destroy() {
    this.midiPlayer.stop();
  }

  public menu(): React.ReactNode {
    return this.midiPlayer.tempo;
  }
};
