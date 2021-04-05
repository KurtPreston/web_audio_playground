import {NoteValue} from '../../midi/sources/MidiInputSource/MidiInputSourceOptions.generated';
import {Chord} from '../chords';
import {Note} from '../Note';
import {Scale, scaleForChord} from '../scales';
import {upDownArp} from './arpeggios';
import {Chart} from './chart';
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
  return arpeggioGenerator(chart, (chord: Chord, key: NoteValue): Note[] => {
    return chord.notes;
  });
};

export const pentatonicMelodyGenerator: MelodyGenerator = (chart: Chart) => {
  // TODO -- finish me
  return [];
};

export const scaleMelodyGenerator: MelodyGenerator = (chart: Chart) => {
  return arpeggioGenerator(chart, (chord: Chord, key: NoteValue): Note[] => {
    const scale: Scale = scaleForChord(key, chord);
    return [...scale.notes, scale.notes[0] + 12];
  });
};

function arpeggioGenerator(
  chart: Chart,
  chordToNotes: (chord: Chord, key: NoteValue) => Note[]
): Melody {
  let lastChord: Chord | undefined;
  const measures: {
    chord: Chord;
    key: NoteValue;
    numBeats: number;
  }[] = [];

  for (const section of chart.sections) {
    for (const chord of section.chords) {
      if (chord.name !== lastChord?.name) {
        lastChord = chord;
        measures.push({
          chord,
          key: section.key,
          numBeats: section.beatsPerChord
        });
      } else {
        measures[measures.length - 1].numBeats += section.beatsPerChord;
      }
    }
  }

  return measures
    .map(({chord, key, numBeats}) => {
      const notes = chordToNotes(chord, key);
      return upDownArp({
        notes,
        totalBeats: numBeats,
        beatsPerNote: notes.length > numBeats ? 0.5 : 1
      });
    })
    .flat();
}

export const MelodyGenerators: {[key in SequencerMelody]: MelodyGenerator} = {
  roots: rootNoteMelodyGenerator,
  fifths: rootFifthMelodyGenerator,
  chord: chordMelodyGenerator,
  pentatonic: pentatonicMelodyGenerator,
  scale: scaleMelodyGenerator
};
