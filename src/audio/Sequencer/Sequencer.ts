import {Transport} from 'tone';
import {
  circleOfFifths,
  majorProgression,
  majorScaleProgression,
  minorProgression,
  minorScaleProgression
} from '../chordProgression';
import {Chord, randomChord} from '../chords';
import {generateRelatedChord} from '../harmony';
import {NoteValue} from '../Note';
import {Sequence, SequencerOptions} from './SequencerOptions.generated';

type SequencerCallback = (chord: Chord) => void;

const chordProgressions: {[key in Sequence]: () => Chord[]} = {
  majMin: () => circleOfFifths(majorProgression([1, 1, 6, 6, 1, 1, 6, 6])),
  maj251: () => circleOfFifths(majorProgression([2, 5, 1, 1])),
  min251: () => circleOfFifths(minorProgression([2, 5, 1, 1])),
  majBlues: () => circleOfFifths(majorProgression([1, 1, 1, 1, 4, 4, 1, 1, 5, 4, 1, 1])),
  minBlues: () => circleOfFifths(minorProgression([1, 1, 1, 1, 4, 4, 1, 1, 5, 4, 1, 1])),
  majorScale: () => circleOfFifths(majorScaleProgression),
  minorScale: () => circleOfFifths(minorScaleProgression, NoteValue.A),
  random: () => {
    let chord: Chord = randomChord();
    const chords: Chord[] = [chord];
    for (let i = 0; i < 63; i++) {
      if (Math.random() < 0.25) {
        chord = generateRelatedChord(chord);
      }
      chords.push(chord);
    }

    return chords;
  }
};

export class Sequencer {
  private readonly subscribers = new Set<SequencerCallback>();
  public chordProgression: Chord[];
  private chordIdx: number = 0;

  private readonly scheduledRepeat: number;

  constructor(private sequencerOptions: SequencerOptions) {
    this.chordProgression = [];
    this.chordProgression = chordProgressions[sequencerOptions.sequence]();
    Transport.position = '0:0:0';
    this.scheduledRepeat = Transport.scheduleRepeat((time) => {
      this.nextMeasure();
    }, '1m');

    Transport.bpm.value = sequencerOptions.bpm;
    Transport.setLoopPoints(0, '4m');
    Transport.start();
  }

  public setOptions(options: SequencerOptions) {
    if (this.sequencerOptions.sequence !== options.sequence) {
      this.chordIdx = -1;
      this.chordProgression = chordProgressions[options.sequence]();
      this.nextMeasure();
    }
    this.sequencerOptions = options;

    Transport.bpm.rampTo(options.bpm);
  }

  public setChordIdx(idx: number) {
    this.chordIdx = idx;
    const chord: Chord = this.chordProgression[this.chordIdx];
    this.subscribers.forEach((sub: SequencerCallback) => {
      sub(chord);
    });
  }

  public get chord(): Chord {
    return this.chordProgression[this.chordIdx];
  }

  public get idx(): number {
    return this.chordIdx;
  }

  public subscribe(callback: SequencerCallback): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private nextMeasure() {
    const chordIdx = (this.chordIdx + 1) % this.chordProgression.length;
    this.setChordIdx(chordIdx);
  }

  public destroy() {
    Transport.clear(this.scheduledRepeat);
  }
}
