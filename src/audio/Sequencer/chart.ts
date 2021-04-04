import {Chord} from '../chords';
import {NoteValue} from '../Note';

// A chart is the underlying data structure that the sequencer uses
// It's a like a fakebook entry -- a key, time signature, and list of chords
export interface Chart {
  key: NoteValue;
  beatsPerChord: number;
  chords: Chord[];
  // melody?: Melody; // Eventually a chart can include the song as well
}
