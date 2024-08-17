import {describe, it, expect} from 'vitest';
import {Chords} from '../chords';
import {Note, NoteValue} from '../Note';
import {Scales} from '../scales';
import {Chart} from './chart';
import {Melody} from './melody';
import {scaleMelodyGenerator} from './melodyGenerators';

describe('scaleMelodyGenerator', () => {
  it('generates modes in the key', () => {
    // 2-5-1 progression in
    const chart: Chart = new Chart({
      sections: [
        {
          key: NoteValue.C,
          beatsPerChord: 4,
          chords: [Chords.D.minor, Chords.G.major, Chords.C.major]
        }
      ]
    });

    const melody: Melody = scaleMelodyGenerator(chart);
    expect(melody).toEqual(
      [
        ...Scales.D.Dorian.notes.slice(0, 7),
        NoteValue.D + 12,
        ...Scales.G.Mixolydian.notes.slice(0, 7),
        NoteValue.G + 12,
        ...Scales.C.Major.notes.slice(0, 7),
        NoteValue.C + 12
      ].map((note: Note) => ({
        note,
        beats: 0.5
      }))
    );
  });

  it('aggregates consecutive scales', () => {
    const chart: Chart = new Chart({
      sections: [
        {
          key: NoteValue.C,
          beatsPerChord: 4,
          chords: [Chords.C.major, Chords.C.major]
        }
      ]
    });

    const melody: Melody = scaleMelodyGenerator(chart);
    expect(melody).toEqual(
      [
        NoteValue.C,
        NoteValue.D,
        NoteValue.E,
        NoteValue.F,
        NoteValue.G,
        NoteValue.A,
        NoteValue.B,
        NoteValue.C + 12
      ].map((note: Note) => ({
        note,
        beats: 1
      }))
    );
  });
});
