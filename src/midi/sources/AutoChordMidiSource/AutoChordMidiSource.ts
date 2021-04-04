import {autobind} from 'core-decorators';
import {random, sampleSize} from 'lodash';
import {circleOfFifths, minorProgression} from '../../../audio/chordProgression';
import {Chord} from '../../../audio/chords';
import {generateRelatedChord} from '../../../audio/harmony';
import {Note, NoteValue} from '../../../audio/Note';
import {MidiNotePublish} from '../../MidiNoteBus';
import {IMidiSource, MidiSourceParams} from '../MidiSource';
import {ChordGeneratorOptions} from './AutoChordMidiSourceOptions.generated';

@autobind
export class AutoChordMidiSource implements IMidiSource<ChordGeneratorOptions> {
  public options: ChordGeneratorOptions;
  private chord: Chord;
  private notes = new Map<NoteValue, Note[]>();
  private chordChangeInterval: NodeJS.Timeout;
  private progressionIdx: number = 0;
  private progression: Chord[] = circleOfFifths
    .map((key: NoteValue) => minorProgression([1, 6, 4, 5])(key), NoteValue.C)
    .flat();
  private readonly publish: MidiNotePublish;

  constructor(params: MidiSourceParams<ChordGeneratorOptions>) {
    this.options = params.options;
    this.publish = params.publish;
    this.chord = this.progression[0];
    this.setChord(this.chord);
    this.chordChangeInterval = setInterval(this.nextChord, 750);
  }

  public updateOptions(options: ChordGeneratorOptions) {
    this.options = options;
  }

  private nextChord() {
    this.progressionIdx = (this.progressionIdx + 1) % this.progression.length;
    this.setChord(this.progression[this.progressionIdx]);
  }

  private setChord(newChord: Chord) {
    // Add new notes
    newChord.noteValues.forEach((noteValue: NoteValue) => {
      if (!this.notes.has(noteValue)) {
        const notes: Note[] = sampleSize(
          [noteValue + 24, noteValue + 36, noteValue + 48, noteValue + 60],
          random(1, 4)
        );
        this.notes.set(noteValue, notes);
        notes.forEach((note: Note) => {
          this.publish({
            note,
            velocity: 127
          });
        });
      }
    });

    // Delete old notes
    this.notes.forEach((notes: Note[], noteValue: NoteValue) => {
      if (!newChord.noteValues.has(noteValue)) {
        this.notes.delete(noteValue);
        notes.forEach((note: Note) => {
          this.publish({
            note,
            velocity: 0
          });
        });
      }
    });

    this.chord = newChord;
  }

  private loadRelatedChord() {
    this.setChord(generateRelatedChord(this.chord));
  }

  public destroy() {
    clearInterval(this.chordChangeInterval);
  }

  public menu(): React.ReactNode {
    return 'Auto Chord!';
  }
}
