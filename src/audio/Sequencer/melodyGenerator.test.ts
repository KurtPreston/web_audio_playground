import {Chords} from '../chords';
import {Note, NoteValue} from '../Note';
import {Scales} from '../scales';
import {Chart} from './chart';
import {Melody} from './melody';
import {scaleMelodyGenerator} from './melodyGenerators';

fdescribe('scaleMelodyGenerator', () => {
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
        ...Scales.D.Dorian.notes.slice(0, 4),
        ...Scales.G.Mixolydian.notes.slice(0, 4),
        ...Scales.C.Major.notes.slice(0, 4)
      ].map((note: Note) => ({
        note,
        beats: 1
      }))
    );
  });
});
