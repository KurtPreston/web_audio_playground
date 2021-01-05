import {Transport} from 'tone';
import {circleOfFifths, majorProgression, minorProgression} from './chordProgression';
import {Chord} from './chords';

type SequencerCallback = (chord: Chord) => void;

export class Sequencer {
  private readonly subscribers = new Set<SequencerCallback>();
  public readonly chordProgression: Chord[];
  private chordIdx: number = 0;

  private readonly scheduledRepeat: number;

  constructor() {
    this.chordProgression = [
      ...circleOfFifths(majorProgression([1, 1, 6, 6, 1, 1, 6, 6])),
      ...circleOfFifths(minorProgression([2, 5, 1, 1])),
      ...circleOfFifths(majorProgression([2, 5, 1, 1]))
    ];
    this.scheduledRepeat = Transport.scheduleRepeat((time) => {
      this.nextMeasure();
    }, '1m');
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
    this.chordIdx = (this.chordIdx + 1) % this.chordProgression.length;
    const chord: Chord = this.chordProgression[this.chordIdx];
    this.subscribers.forEach((sub: SequencerCallback) => {
      sub(chord);
    });
  }

  public destroy() {
    Transport.clear(this.scheduledRepeat);
  }
}
