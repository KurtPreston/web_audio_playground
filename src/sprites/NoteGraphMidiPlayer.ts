import {compact, random, times} from 'lodash';
import {Note, noteToNoteValue, NoteValue} from '../audio/Note';
import {WorldState} from '../types/State';
import {NoteGraph, NoteNode} from './NoteGraph';
import {NoteGraphAction, NoteGraphController} from './NoteGraphController';

export class NoteGraphMidiPlayer implements NoteGraphController {
  private notes = new Map<Note, NoteNode[]>();

  public readonly actions: NoteGraphAction[][] = [];

  constructor(private readonly noteGraph: NoteGraph, private readonly onNotesUpdated: () => void) {}

  public tick(world: WorldState) {
    const {midiKeysPressed} = world;
    if (midiKeysPressed) {
      // Add new notes
      midiKeysPressed.forEach((note: Note) => {
        if (!this.notes.has(note)) {
          this.playNote(note);
        }
      });

      // Release old notes
      this.notes.forEach((nodes: NoteNode[], note: Note) => {
        if (!midiKeysPressed.has(note)) {
          this.releaseNote(note);
        }
      });
    }
  }

  public get noteValues(): Set<NoteValue> {
    const noteValues = new Set<NoteValue>();
    this.notes.forEach((nodes, note) => {
      noteValues.add(noteToNoteValue(note));
    });

    return noteValues;
  }

  private playNote(midiNote: Note) {
    if (this.notes.has(midiNote)) {
      throw new Error(`Note ${midiNote} is already triggered`);
    }

    const nodes: NoteNode[] = compact(
      times(random(2, 5), () => {
        return this.noteGraph.createNode({
          midiNote
        });
      })
    );
    this.notes.set(midiNote, nodes);
    this.onNotesUpdated();
  }

  private releaseNote(note: Note) {
    this.notes.get(note)?.forEach((node) => {
      this.noteGraph.deleteNode(node);
    });
    this.notes.delete(note);
    this.onNotesUpdated();
  }

  public destroy() {
    this.notes.forEach((nodes: NoteNode[]) => {
      nodes.forEach((node: NoteNode) => {
        this.noteGraph.deleteNode(node);
      });
    });
  }
}
