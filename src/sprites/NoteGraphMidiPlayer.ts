import {compact, omit, random, times} from 'lodash';
import {Note, noteToNoteValue, NoteValue} from '../audio/Note';
import {JsonSchemaForm} from '../forms/JsonSchemaForm';
import NoteGraphMidiPlayerOptionsSchema from '../schemas/NoteGraphMidiPlayerOptions.json';
import {JsonSchema} from '../types/JsonSchema';
import {NoteGraphMidiPlayerOptions} from '../types/NoteGraphMidiPlayerOptions.d';
import {WorldState} from '../types/State';
import {NoteGraph, NoteNode} from './NoteGraph';
import {NoteGraphAction, NoteGraphController} from './NoteGraphController';

export class NoteGraphMidiPlayer implements NoteGraphController {
  private notes = new Map<Note, Set<NoteNode>>();

  private options: NoteGraphMidiPlayerOptions = {
    autoRelease: 0
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

  public controls() {
    return JsonSchemaForm({
      value: this.options,
      onChange: (options) => {
        this.options = options;
        this.clearNotes();
        this.onNotesUpdated(); // Update menu
      },
      schema: omit(NoteGraphMidiPlayerOptionsSchema as JsonSchema, 'title')
    });
  }

  public get noteValues(): Set<NoteValue> {
    const noteValues = new Set<NoteValue>();
    this.notes.forEach((nodes, note) => {
      noteValues.add(noteToNoteValue(note));
    });

    return noteValues;
  }

  private playNote(midiNote: Note) {
    const nodeSet: Set<NoteNode> = this.notes.get(midiNote) || new Set<NoteNode>();
    const newNodes = compact(
      times(random(2, 5), () => {
        return this.noteGraph.createNode({midiNote});
      })
    );

    newNodes.forEach((node) => {
      nodeSet.add(node);
    });

    if (this.options.autoRelease) {
      setTimeout(() => {
        newNodes.forEach((node) => {
          this.noteGraph.deleteNode(node);
          nodeSet.delete(node);
        });
        if (nodeSet.size === 0) {
          this.notes.delete(midiNote);
        }
        this.onNotesUpdated();
      }, this.options.autoRelease);
    }

    this.notes.set(midiNote, nodeSet);
    this.onNotesUpdated();
  }

  private releaseNote(note: Note) {
    this.notes.get(note)?.forEach((node) => {
      this.noteGraph.deleteNode(node);
    });
    this.notes.delete(note);
    this.onNotesUpdated();
  }

  private clearNotes() {
    this.notes.forEach((nodes: Set<NoteNode>) => {
      nodes.forEach((node: NoteNode) => {
        this.noteGraph.deleteNode(node);
      });
    });
    this.notes.clear();
  }

  public destroy() {
    this.clearNotes();
  }
}
