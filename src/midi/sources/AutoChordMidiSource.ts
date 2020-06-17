import {autobind} from 'core-decorators';
import {random, sampleSize} from 'lodash';
import {circleOfFifths, twoFiveOne} from '../../audio/chordProgression';
import {Chord} from '../../audio/chords';
import {generateRelatedChord} from '../../audio/harmony';
import {Note, NoteValue} from '../../audio/Note';
import {MidiNotePublish} from '../MidiNoteBus';
import {IMidiSource} from './MidiSource';
interface AutoChordMidiSourceOptions {}

@autobind
export class AutoChordMidiSource implements IMidiSource {
  public options: AutoChordMidiSourceOptions = {};
  private chord = new Map<NoteValue, Note[]>();
  private chordChangeInterval: NodeJS.Timeout;
  private progressionIdx: number = 0;
  private progression: Chord[] = circleOfFifths(twoFiveOne, NoteValue.C);

  constructor(private readonly publish: MidiNotePublish) {
    this.setChord(this.progression[0].notes);
    this.chordChangeInterval = setInterval(this.nextChord, 750);
  }

  private nextChord() {
    this.progressionIdx = (this.progressionIdx + 1) % this.progression.length;
    this.setChord(this.progression[this.progressionIdx].notes);
  }

  private setChord(newChord: Set<NoteValue>) {
    // Add new notes
    newChord.forEach((noteValue: NoteValue) => {
      if (!this.chord.has(noteValue)) {
        const notes: Note[] = sampleSize(
          [noteValue + 24, noteValue + 36, noteValue + 48, noteValue + 60],
          random(1, 4)
        );
        this.chord.set(noteValue, notes);
        notes.forEach((note: Note) => {
          this.publish({
            note,
            velocity: 127
          });
        });
      }
    });

    // Delete old notes
    this.chord.forEach((notes: Note[], noteValue: NoteValue) => {
      if (!newChord.has(noteValue)) {
        this.chord.delete(noteValue);
        notes.forEach((note: Note) => {
          this.publish({
            note,
            velocity: 0
          });
        });
      }
    });
  }

  private loadRelatedChord() {
    const currentChord = new Set<NoteValue>(this.chord.keys());
    this.setChord(generateRelatedChord(currentChord).notes);
  }

  public destroy() {
    clearInterval(this.chordChangeInterval);
  }

  public menu(): React.ReactNode {
    return 'Auto Chord!';
  }
}
