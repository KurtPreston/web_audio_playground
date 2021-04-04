import {Note} from '../Note';

export type MelodyNote = {
  note: Note;
  beats: number;
};

export type Melody = MelodyNote[];
