import {compact, random, times} from 'lodash';
import {Note, noteToNoteValue, NoteValue} from '../audio/Note';
import {WorldState} from '../types/State';
import {NoteGraph, NoteNode} from './NoteGraph';
import {NoteGraphAction, NoteGraphController} from './NoteGraphController';

interface NoteGraphMidiPlayerOptions {
  autoRelease?: number;
}

export class NoteGraphMidiPlayer implements NoteGraphController {
  private notes = new Map<Note, NoteNode[]>();

  private options: NoteGraphMidiPlayerOptions = {
    autoRelease: 150
  };

  public readonly actions: NoteGraphAction[][] = [];

  constructor(private readonly noteGraph: NoteGraph, private readonly onNotesUpdated: () => void) {
    this.initializeMidi();
  }

  private async initializeMidi() {
    const midiAccess = await navigator.requestMIDIAccess();
    const inputs = midiAccess.inputs;

    inputs.forEach((input) => {
      input.addEventListener('midimessage', (event) => {
        const signal = event.data[0];
        const cc = event.data[1];
        const value = event.data[2];
        if (signal === 144) {
          // Keyboard!
          const midiNote: Note = cc;
          if (value === 0) {
            this.releaseNote(midiNote);
          } else {
            this.playNote(midiNote);
          }
        }
      });
    });
  }

  public tick(world: WorldState) {}

  public get noteValues(): Set<NoteValue> {
    const noteValues = new Set<NoteValue>();
    this.notes.forEach((nodes, note) => {
      noteValues.add(noteToNoteValue(note));
    });

    return noteValues;
  }

  private playNote(midiNote: Note) {
    const prevNodes: NoteNode[] = this.notes.get(midiNote) || [];
    const newNodes: NoteNode[] = compact(
      times(random(2, 5), () => {
        return this.noteGraph.createNode({
          midiNote
        });
      })
    );

    const nodes: NoteNode[] = [...prevNodes, ...newNodes];

    if (this.options.autoRelease) {
      setTimeout(() => {
        newNodes.forEach((node) => {
          this.noteGraph.deleteNode(node);
        });
        this.onNotesUpdated();
      }, this.options.autoRelease);
    }

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
