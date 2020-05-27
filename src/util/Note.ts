import {midiNoteToFreq} from './midi';

export type Note = number;
export type NoteLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type NoteAccidental = 'b' | '#' | null;

export interface NoteInfo {
  letter: string;
  accidental: 'b' | '#' | null;
  octave: number;
  midi: Note;
}

const noteAscii = [
  65, // A
  65.5, // A#/Bb
  66, // B
  67, // C
  67.5, // C#/Db
  68, // D
  68.5, // D#/Eb
  69, // E
  70, // F
  70.5, // F#/Gb
  71, // G
  71.5 // G#/Ab
];

// Value 21 127
export function getNoteName(note: Note): string {
  const {letter, octave, accidental} = getNoteInfo(note);
  return `${letter}${accidental || ''}${octave}`;
}

export function getNoteNames(note: Note): string[] {
  const {letter, octave, accidental} = getNoteInfo(note, '#');
  if (accidental) {
    const flat = getNoteInfo(note, 'b');
    return [`${letter}♯${octave}`, `${flat.letter}♭${flat.octave}`];
  } else {
    return [`${letter}${octave}`];
  }
}

export function getNoteInfo(note: Note, accidental: NoteAccidental = '#'): NoteInfo {
  return {
    letter: noteLetter(note, accidental),
    octave: getOctave(note),
    accidental: noteAccidental(note, accidental),
    midi: note
  };
}

export function noteLetter(note: Note, accidental: NoteAccidental = '#'): string {
  const fractionalAsciiValue = noteAscii[(note + 3) % 12];
  const asciiCode =
    accidental === '#'
      ? Math.floor(fractionalAsciiValue)
      : fractionalAsciiValue === 71.5
      ? 65
      : Math.ceil(fractionalAsciiValue);
  return String.fromCharCode(asciiCode);
}

export function noteAccidental(note: Note, accidental: NoteAccidental = '#'): NoteAccidental {
  const fractionalAsciiValue = noteAscii[(note + 3) % 12];
  return fractionalAsciiValue % 1 === 0 ? null : accidental;
}

export function getOctave(note: Note): number {
  return Math.floor(note / 12) - 1;
}

export function getNoteFrequencyRange(note: Note): [number, number] {
  return [midiNoteToFreq(note - 0.5), midiNoteToFreq(note + 0.5)];
}
