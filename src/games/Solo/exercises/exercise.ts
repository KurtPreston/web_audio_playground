// Each exercise will do variations on a chart
import {majorProgression} from '../../../audio/chordProgression';
import {NoteValue} from '../../../audio/Note';
import {Chart} from '../../../audio/Sequencer/chart';
import {
  chordMelodyGenerator,
  MelodyGenerator,
  pentatonicMelodyGenerator,
  rootFifthMelodyGenerator,
  rootNoteMelodyGenerator,
  scaleMelodyGenerator
} from '../../../audio/Sequencer/melodyGenerators';

export interface Playthrough {
  exercise: Exercise;
  numPlayers: number;
}

export interface Exercise {
  chart: Chart;
  rounds: Round[];
}

export type Round = {
  name: string;
  melodyGenerator: MelodyGenerator;
};

export const cMajMin: Exercise = {
  chart: {
    key: NoteValue.C,
    beatsPerChord: 4,
    chords: majorProgression([1, 1, 6, 6])(NoteValue.C)
  },
  rounds: [
    {
      name: 'Roots',
      melodyGenerator: rootNoteMelodyGenerator
    },
    {
      name: 'Fifths',
      melodyGenerator: rootFifthMelodyGenerator
    },
    {
      name: 'Chord',
      melodyGenerator: chordMelodyGenerator
    },
    {
      name: 'Pentatonic',
      melodyGenerator: pentatonicMelodyGenerator
    },
    {
      name: 'Scale',
      melodyGenerator: scaleMelodyGenerator
    }
  ]
};
