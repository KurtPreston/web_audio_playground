import {Transport} from 'tone';
import {Chord} from '../chords';
import {Chart, Charts} from './chart';
import {Melody} from './melody';
import {MelodyGenerators} from './melodyGenerators';
import {SequencerMelody, SequencerOptions} from './SequencerOptions.generated';

type SequencerCallback = (chord: Chord, melody: Melody) => void;

export class Sequencer {
  private readonly subscribers = new Set<SequencerCallback>();
  public chart: Chart;
  public chords: Chord[]; // derived from charts
  public melodyPerMeasure: {[measure: number]: Melody}; // derived from charts
  private measure: number = 0;
  private loop: [number, number] | null = null;

  private readonly scheduledRepeat: number;

  constructor(private sequencerOptions: SequencerOptions) {
    // Fix typing complaints
    this.chart = Charts[sequencerOptions.chart]();
    this.chords = this.chart.sections.map(({chords}) => chords).flat();
    this.melodyPerMeasure = this.buildMelodyPerMeasure(sequencerOptions.melody);

    this.setOptions(sequencerOptions);
    Transport.position = '0:0:0';
    this.scheduledRepeat = Transport.scheduleRepeat((time) => {
      this.nextMeasure();
    }, '1m');

    Transport.bpm.value = sequencerOptions.bpm;
    Transport.setLoopPoints(0, '4m');
    Transport.start();
  }

  public setOptions(options: SequencerOptions) {
    if (
      this.sequencerOptions.chart !== options.chart ||
      this.sequencerOptions.melody !== options.melody
    ) {
      this.measure = -1;
      this.chart = Charts[options.chart]();
      this.chords = this.chart.sections.map(({chords}) => chords).flat();
      this.melodyPerMeasure = this.buildMelodyPerMeasure(options.melody);
      this.nextMeasure();
    }
    this.sequencerOptions = options;

    Transport.bpm.rampTo(options.bpm);
  }

  public get isLooping(): boolean {
    return Boolean(this.loop);
  }

  public setLoop(startIdx: number, endIdx: number) {
    this.loop = [startIdx, endIdx];
    if (this.measure < startIdx || this.measure > endIdx) {
      this.measure = endIdx;
    }
  }

  public clearLoop() {
    this.loop = null;
  }

  private buildMelodyPerMeasure(melodyType: SequencerMelody): {[measure: number]: Melody} {
    const melody = MelodyGenerators[melodyType](this.chart);
    const melodyPerMeasure: {[measureIdx: number]: Melody} = {};
    let beats = 0;
    let measureIdx = 0;
    for (const melodyNote of melody) {
      if (!melodyPerMeasure[measureIdx]) {
        melodyPerMeasure[measureIdx] = [melodyNote];
      } else {
        melodyPerMeasure[measureIdx].push(melodyNote);
      }

      beats += melodyNote.beats;
      if (beats >= 4) {
        measureIdx++;
      }
      beats = beats % 4;
    }

    return melodyPerMeasure;
  }

  public setChordIdx(idx: number) {
    this.measure = idx;

    const chord: Chord = this.chords[this.measure];
    const melody: Melody = this.melodyPerMeasure[this.measure];
    this.subscribers.forEach((sub: SequencerCallback) => {
      sub(chord, melody);
    });
  }

  public get chord(): Chord {
    return this.chords[this.measure];
  }

  public get measureMelody(): Melody {
    return this.melodyPerMeasure[this.measure].map(({note, beats}) => ({
      // TODO: octave adjustment. Move somewhere else
      note: note + 5 * 12,
      beats
    }));
  }

  public get idx(): number {
    return this.measure;
  }

  public subscribe(callback: SequencerCallback): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private nextMeasure() {
    let chordIdx = (this.measure + 1) % this.chords.length;
    if (this.loop && chordIdx > this.loop[1]) {
      chordIdx = this.loop[0];
    }
    this.setChordIdx(chordIdx);
  }

  public destroy() {
    Transport.clear(this.scheduledRepeat);
  }
}
