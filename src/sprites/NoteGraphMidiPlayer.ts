import {random, times} from 'lodash';
import {Note, noteToNoteValue, NoteValue} from '../audio/Note';
import {WorldState} from '../types/State';
import {NoteGraph} from './NoteGraph';

export class NoteGraphMidiPlayer {
  private notes = new Set<Note>();

  constructor(private readonly noteGraph: NoteGraph) {}

  public tick(world: WorldState) {
    const {midiKeysPressed} = world;
    if (midiKeysPressed) {
      // Update the list of note values for random nodes
      const noteValues = new Map<NoteValue, Note[]>();
      midiKeysPressed.forEach((note: Note) => {
        const noteValue = noteToNoteValue(note);
        const notes = noteValues.get(noteValue);
        if (notes) {
          notes.push(note);
        } else {
          noteValues.set(noteValue, [note]);
        }
      });

      noteValues.forEach((notes: Note[], noteValue: NoteValue) => {
        // Play the specific notes
        notes.forEach((midiNote) => {
          times(random(2, 5), () => {
            this.noteGraph.createNode({
              midiNote
            });
          });
        });
      });

      // Also add the specific keys played
      midiKeysPressed.forEach(() => {});
    }
  }
}
