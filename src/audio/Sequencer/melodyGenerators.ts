import {Chord} from '../chords';
import {Scale, scaleForChord} from '../scales';
import {upDownArp} from './arpeggios';
import {Chart} from './chart';
import {Melody} from './melody';

// MelodyGenerators take a Chart and produce a practice melody
// For example, scales and arpeggios over the chord progression
export type MelodyGenerator = (chart: Chart) => Melody;

export const rootNoteMelodyGenerator: MelodyGenerator = (chart: Chart): Melody => {
  return chart.chords.map((chord: Chord) => ({
    note: chord.notes[0],
    beats: 4
  }));
};

export const rootFifthMelodyGenerator: MelodyGenerator = (chart: Chart): Melody => {
  return chart.chords
    .map((chord: Chord) => [
      {
        note: chord.root,
        beats: 2
      },
      {
        note: chord.fifth,
        beats: 2
      }
    ])
    .flat();
};

export const chordMelodyGenerator: MelodyGenerator = (chart: Chart): Melody => {
  return chart.chords.map((chord: Chord) => upDownArp(chord.notes, chart.beatsPerChord)).flat();
};

export const pentatonicMelodyGenerator: MelodyGenerator = (chart: Chart) => {
  // TODO -- finish me
  return [];
};

export const scaleMelodyGenerator: MelodyGenerator = (chart: Chart) => {
  return chart.chords
    .map((chord: Chord) => {
      const scale: Scale = scaleForChord(chart.key, chord);
      return upDownArp(scale.notes, chart.beatsPerChord);
    })
    .flat();
};
