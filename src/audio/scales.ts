import {Chord} from './chords';
import {getNoteName, Note, NoteAccidental, noteToNoteValue, NoteValue} from './Note';

export const accidentalForKey: {[note in NoteValue]: NoteAccidental} = {
  [NoteValue.C]: 'b',
  [NoteValue.G]: '#',
  [NoteValue.D]: '#',
  [NoteValue.A]: '#',
  [NoteValue.E]: '#',
  [NoteValue.B]: '#',
  [NoteValue.Fsharp]: '#',
  [NoteValue.Dflat]: 'b',
  [NoteValue.Aflat]: 'b',
  [NoteValue.Eflat]: 'b',
  [NoteValue.Bflat]: 'b',
  [NoteValue.F]: 'b'
};

export enum Mode {
  Ionion = 1,
  Dorian = 2,
  Phrygian = 3,
  Lydian = 4,
  Mixolydian = 5,
  Aeolian = 6,
  Locrian = 7,

  Major = 1,
  Minor = 6
}

export type ScaleNames =
  | 'Ionion'
  | 'Dorian'
  | 'Phrygian'
  | 'Lydian'
  | 'Mixolydian'
  | 'Aeolian'
  | 'Locrian'
  | 'Major'
  | 'Minor';

export class Scale {
  public readonly key: NoteValue;
  public readonly mode: Mode;
  public readonly accidental: NoteAccidental;
  public readonly notes: Note[];

  constructor(params: {key: NoteValue; mode: Mode; accidental: NoteAccidental}) {
    this.key = noteToNoteValue(params.key);
    this.mode = params.mode;
    this.accidental = params.accidental;
    this.notes = majorScaleNotes(this.key, this.mode);
  }
}

/**************** Major ****************/
export const majorScaleOffsets = Object.freeze([0, 2, 4, 5, 7, 9, 11]);

export function majorScaleNotes(key: NoteValue, mode: Mode = Mode.Ionion): Note[] {
  const modeOffset = mode - 1;
  const offsets = [
    ...majorScaleOffsets.slice(modeOffset),
    ...majorScaleOffsets.slice(0, modeOffset).map((n) => n + 12)
  ];

  if (key + offsets[0] > 12) {
    offsets.forEach((offset, i) => (offsets[i] = offset - 12));
  }

  return offsets.map((offset) => key + offset);
}

// export function majorPentatonicScale(params: {
//   key: NoteValue;
//   accidental: NoteAccidental;
//   offset: number
// }): Note[] {
//   const {key, accidental, offset} = params;
//   const scale = majorScale(key, accidental);
//   return [
//     scale.notes[offset],
//     scale.notes[offset + 2],
//     scale.notes[offset + 3],
// }

export type ScaleSet = {[mode in ScaleNames]: Scale};

function scaleSetFor(key: NoteValue, accidental: NoteAccidental): ScaleSet {
  const major = new Scale({key, mode: Mode.Ionion, accidental});
  const minor = new Scale({key: key - 9, mode: Mode.Aeolian, accidental});

  return {
    // C Ionion: first mode of C
    Ionion: major,
    Major: major,

    // C Dorion: second mode of Bb
    Dorian: new Scale({key: key - 2, mode: Mode.Dorian, accidental}),

    // C Phrygian: third mode of Ab
    Phrygian: new Scale({key: key - 4, mode: Mode.Phrygian, accidental}),

    // C Lydian: fourth mode of G
    Lydian: new Scale({key: key - 5, mode: Mode.Lydian, accidental}),

    // C Mixolydian: fifth mode of F
    Mixolydian: new Scale({key: key - 7, mode: Mode.Mixolydian, accidental}),

    // C Aeolian: sixth mode of E
    Aeolian: minor,
    Minor: minor,

    // C Locrian: seventh mode of D,
    Locrian: new Scale({key: key - 11, mode: Mode.Locrian, accidental})
  };
}

export function scaleForChord(key: NoteValue, chord: Chord): Scale {
  const noteValuesInScale = new Set<NoteValue>(majorScaleNotes(key).map(noteToNoteValue));
  for (const note of chord.notes) {
    if (!noteValuesInScale.has(noteToNoteValue(note))) {
      const noteName = getNoteName(note, {
        accidental: chord.accidental,
        octave: false
      });
      throw new Error(`Note ${noteName} not found in scale`);
    }
  }

  const rootIdx = majorScaleNotes(key).findIndex((k) => k === chord.root);
  const mode: Mode = (rootIdx + 1) as Mode;
  return new Scale({
    key,
    accidental: chord.accidental,
    mode
  });
}

export const Scales = {
  A: scaleSetFor(NoteValue.A, '#'),
  Asharp: scaleSetFor(NoteValue.Asharp, '#'),
  Bflat: scaleSetFor(NoteValue.Bflat, 'b'),
  B: scaleSetFor(NoteValue.B, '#'),
  C: scaleSetFor(NoteValue.C, 'b'),
  Csharp: scaleSetFor(NoteValue.Csharp, '#'),
  Dflat: scaleSetFor(NoteValue.Dflat, 'b'),
  D: scaleSetFor(NoteValue.D, '#'),
  Dsharp: scaleSetFor(NoteValue.Dsharp, '#'),
  Eflat: scaleSetFor(NoteValue.Eflat, 'b'),
  F: scaleSetFor(NoteValue.F, 'b'),
  Fsharp: scaleSetFor(NoteValue.Fsharp, '#'),
  Gflat: scaleSetFor(NoteValue.Gflat, 'b'),
  G: scaleSetFor(NoteValue.G, '#'),
  Gsharp: scaleSetFor(NoteValue.Gsharp, '#')
};
