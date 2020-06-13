import {NoteValue} from '../../audio/Note';
import {WorldState} from '../../types/State';

export interface NoteGraphController {
  tick: (world: WorldState) => void;
  destroy: () => void;
  actions: NoteGraphAction[][];
  controls?: () => React.ReactNode;
  noteValues: Set<NoteValue>;
}

export interface NoteGraphAction {
  name: string;
  action: () => void;
}
