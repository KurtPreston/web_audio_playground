import {NoteAccidental, NoteValue} from './Note';

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
