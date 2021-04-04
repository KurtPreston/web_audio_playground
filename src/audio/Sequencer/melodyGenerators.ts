import {Chord} from '../chords';
import {Scale, scaleForChord} from '../scales';
import {upDownArp} from './arpeggios';
import {Chart, ChartSection} from './chart';
import {Melody} from './melody';
import {SequencerMelody} from './SequencerOptions.generated';

// MelodyGenerators take a Chart and produce a practice melody
// For example, scales and arpeggios over the chord progression
export type MelodyGenerator = (chart: Chart) => Melody;

export const rootNoteMelodyGenerator: MelodyGenerator = (chart: Chart): Melody => {
  return chart.sections
    .map(({chords, beatsPerChord}) =>
      chords.map((chord: Chord) => ({
        note: chord.notes[0],
        beats: beatsPerChord
      }))
    )
    .flat();
};

export const rootFifthMelodyGenerator: MelodyGenerator = (chart: Chart): Melody => {
  return chart.sections
    .map(({chords, beatsPerChord}) =>
      chords.map((chord: Chord) => [
        {
          note: chord.root,
          beats: beatsPerChord / 2
        },
        {
          note: chord.fifth,
          beats: beatsPerChord / 2
        }
      ])
    )
    .flat(2);
};

export const chordMelodyGenerator: MelodyGenerator = (chart: Chart): Melody => {
  return chart.sections
    .map((section: ChartSection) =>
      section.chords.map((chord: Chord) => upDownArp(chord.notes, section.beatsPerChord))
    )
    .flat(2);
};

export const pentatonicMelodyGenerator: MelodyGenerator = (chart: Chart) => {
  // TODO -- finish me
  return [];
};

export const scaleMelodyGenerator: MelodyGenerator = (chart: Chart) => {
  return chart.sections
    .map(({beatsPerChord, chords, key}) =>
      chords.map((chord: Chord) => {
        const scale: Scale = scaleForChord(key, chord);
        return upDownArp(scale.notes, beatsPerChord);
      })
    )
    .flat(2);
};

export const MelodyGenerators: {[key in SequencerMelody]: MelodyGenerator} = {
  roots: rootNoteMelodyGenerator,
  fifths: rootFifthMelodyGenerator,
  chord: chordMelodyGenerator,
  pentatonic: pentatonicMelodyGenerator,
  scale: scaleMelodyGenerator
};
