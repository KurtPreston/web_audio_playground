import {autobind} from 'core-decorators';
import {isNumber} from 'lodash';
import MidiPlayer from 'midi-player-js';
import {Note} from '../../../audio/Note';
import {MidiNotePublish} from '../../MidiNoteBus';
import {IMidiSource, MidiSourceParams} from '../MidiSource';
import {MidiFileOptions} from './MidiFileSourceOptions.generated';

@autobind
export class MidiFileSource implements IMidiSource<MidiFileOptions> {
  public options: MidiFileOptions;

  private readonly activeNotes = new Set<Note>();
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

      if (name === 'Note off' || velocity === 0) {
        this.deleteNote(noteNumber);
      } else if (name === 'Note on' && noteNumber && isNumber(velocity)) {
        this.addNote(noteNumber, velocity);
      } else if (name === 'End of track') {
        this.destroy();
      }
    });
    this.loadMidiFile();
  }

  private addNote(note: Note, velocity: number) {
    this.activeNotes.add(note);
    this.publish({
      note,
      velocity
    });
  }

  private deleteNote(note: Note) {
    this.activeNotes.delete(note);
    this.publish({
      note,
      velocity: 0
    });
  }

  public updateOptions(options: MidiFileOptions) {
    const midiChanged = options.midiFileUri !== this.options.midiFileUri;
    const tempoChanged = options.bpm !== this.options.bpm;
    this.options = options;
    if (midiChanged) {
      this.destroy();
      this.loadMidiFile();
    } else if (tempoChanged) {
      this.midiPlayer.tempo = options.bpm;
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
    if (isFinite(this.midiPlayer.tempo)) {
      this.options.bpm = this.midiPlayer.tempo;
    }
    this.midiPlayer.play();
  }

  public destroy() {
    this.midiPlayer.stop();
    this.activeNotes.forEach(this.deleteNote);
  }

  public menu(): React.ReactNode {
    return this.midiPlayer.tempo;
  }
}
