import {ChordNum, circleOfFifths, majorProgression, minorProgression} from '../chordProgression';
import {Chord, randomChord} from '../chords';
import {generateRelatedChord} from '../harmony';
import {NoteValue} from '../Note';
import {SequencerChart} from './SequencerOptions.generated';

// A chart is the underlying data structure that the sequencer uses
// It's a like a fakebook entry -- a key, time signature, and list of chords
export class Chart {
  public readonly sections: ChartSection[];

  constructor(params: {sections: ChartSection[]}) {
    this.sections = params.sections;
  }
}

// A section marks any set of chords in a chart with a common key and time signature
export interface ChartSection {
  key: NoteValue;
  beatsPerChord: number;
  chords: Chord[];
  // melody?: Melody; // Eventually a chart can include the song as well
}

// Returns a chart with a major progression in the key
export function majorProgressionChartSection(key: NoteValue, chordNums: ChordNum[]): ChartSection {
  return {
    key,
    beatsPerChord: 4,
    chords: majorProgression(chordNums)(key)
  };
}

export function minorProgressionChartSection(key: NoteValue, chordNums: ChordNum[]): ChartSection {
  return {
    key,
    beatsPerChord: 4,
    chords: minorProgression(chordNums)(key)
  };
}

export function randomProgressionChart(): Chart {
  let chord: Chord = randomChord();
  const chords: Chord[] = [chord];
  for (let i = 0; i < 63; i++) {
    if (Math.random() < 0.25) {
      chord = generateRelatedChord(chord);
    }
    chords.push(chord);
  }

  return new Chart({
    sections: [
      {
        key: NoteValue.C,
        beatsPerChord: 4,
        chords
      }
    ]
  });
}

export const Charts: {[key in SequencerChart]: () => Chart} = {
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
