import {Transport} from 'tone';
import {NoteValue} from '../../midi/sources/MidiInputSource/MidiInputSourceOptions.generated';
import {circleOfFifths} from '../chordProgression';
import {Chord} from '../chords';
import {
  Chart,
  majorProgressionChartSection,
  minorProgressionChartSection,
  randomProgressionChart
} from './chart';
import {ChartPreset, SequencerOptions} from './SequencerOptions.generated';

type SequencerCallback = (chord: Chord) => void;

const Charts: {[key in ChartPreset]: () => Chart} = {
  majMin: () =>
    new Chart({
      sections: circleOfFifths.map((key: NoteValue) =>
        majorProgressionChartSection(key, [1, 1, 6, 6])
      )
    }),
  maj251: () =>
    new Chart({
      sections: circleOfFifths.map((key: NoteValue) =>
        majorProgressionChartSection(key, [2, 5, 1, 1])
      )
    }),
  min251: () =>
    new Chart({
      sections: circleOfFifths.map((key: NoteValue) =>
        minorProgressionChartSection(key, [2, 5, 1, 1])
      )
    }),
  majBlues: () =>
    new Chart({
      sections: circleOfFifths.map((key: NoteValue) =>
        majorProgressionChartSection(key, [1, 1, 1, 1, 4, 4, 1, 1, 5, 4, 1, 1])
      )
    }),
  minBlues: () =>
    new Chart({
      sections: circleOfFifths.map((key: NoteValue) =>
        minorProgressionChartSection(key, [1, 1, 1, 1, 4, 4, 1, 1, 5, 4, 1, 1])
      )
    }),
  random: randomProgressionChart
};

export class Sequencer {
  private readonly subscribers = new Set<SequencerCallback>();
  public chart: Chart;
  public chords: Chord[]; // derived from chart
  private chordIdx: number = 0;

  private readonly scheduledRepeat: number;

  constructor(private sequencerOptions: SequencerOptions) {
    // Fix typing complaings
    this.chart = Charts[sequencerOptions.chart]();
    this.chords = this.chart.sections.map(({chords}) => chords).flat();

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
    if (this.sequencerOptions.chart !== options.chart) {
      this.chordIdx = -1;
      this.chart = Charts[options.chart]();
      this.chords = this.chart.sections.map(({chords}) => chords).flat();
      this.nextMeasure();
    }
    this.sequencerOptions = options;

    Transport.bpm.rampTo(options.bpm);
  }

  public setChordIdx(idx: number) {
    this.chordIdx = idx;
    const chord: Chord = this.chords[this.chordIdx];
    if (!chord) {
      debugger;
    }
    this.subscribers.forEach((sub: SequencerCallback) => {
      sub(chord);
    });
  }

  public get chord(): Chord {
    return this.chords[this.chordIdx];
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
    const chordIdx = (this.chordIdx + 1) % this.chords.length;
    this.setChordIdx(chordIdx);
  }

  public destroy() {
    Transport.clear(this.scheduledRepeat);
  }
}
