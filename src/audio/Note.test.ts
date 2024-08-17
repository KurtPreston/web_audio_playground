import {describe, it, expect} from 'vitest';
import {getNoteInfo, NoteValue} from './Note';

describe('getNoteInfo', () => {
  it('can get C', () => {
    expect(getNoteInfo(NoteValue.C + 48)).toEqual({
      letter: 'C',
      accidental: null,
      octave: 3,
      midi: 48
    });
  });

  it('can get D#', () => {
    expect(getNoteInfo(NoteValue.Dsharp + 48)).toEqual({
      letter: 'D',
      accidental: '#',
      octave: 3,
      midi: 51
    });
  });

  it('can get Eb', () => {
    expect(getNoteInfo(NoteValue.Eflat + 48, 'b')).toEqual({
      letter: 'E',
      accidental: 'b',
      octave: 3,
      midi: 51
    });
  });

  it('can get G#', () => {
    expect(getNoteInfo(NoteValue.Gsharp + 48, '#')).toEqual({
      letter: 'G',
      accidental: '#',
      octave: 3,
      midi: 56
    });
  });

  it('can get Ab', () => {
    expect(getNoteInfo(NoteValue.Aflat + 48, 'b')).toEqual({
      letter: 'A',
      accidental: 'b',
      octave: 3,
      midi: 56
    });
  });
});
