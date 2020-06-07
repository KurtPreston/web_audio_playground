import {difference, isNumber, pull, random, sample, times} from 'lodash';
import {randomChord} from '../audio/chords';
import {Note, noteToNoteValue, NoteValue} from '../audio/Note';
import {NoteGraph, NoteNode} from './NoteGraph';

export class NoteGraphAutoplayer {
  // Store which notes are currently being played
  public readonly notes = new Set<NoteValue>();

  constructor(private readonly noteGraph: NoteGraph) {
    // Create nodes
    const numNodes = random(8, 16);
    this.notes = randomChord().notes;
    times(numNodes, () => {
      const midiNote = this.randomNote();
      if (midiNote) {
        this.noteGraph.createNode({midiNote});
      }
    });
  }

  public setChord(chord: Set<NoteValue>) {
    const newNotes = difference(Array.from(chord), Array.from(this.notes));
    const yesterNotes = difference(Array.from(this.notes), Array.from(chord));

    // Rebuild any overlapping notes that have disappeared
    chord.forEach((noteValue: Note) => {
      const currentNodes: NoteNode[] = this.nodesWithNote(noteValue);
      if (this.notes.has(noteValue) && currentNodes.length === 0) {
        // All nodes with this note have been removed. Unacceptable!
        this.addNote(noteValue);
      }
    });

    // Convert current nodes to new nodes
    while (newNotes.length && yesterNotes.length) {
      const newNote = sample(newNotes) as NoteValue;
      const oldNote = sample(yesterNotes) as NoteValue;
      const oldNodes = this.nodesWithNote(oldNote);
      oldNodes.forEach((node: NoteNode) => {
        const note = this.randomNote(newNote);
        if (note) {
          node.note = note;
        }
      });
      pull(newNotes, newNote);
      pull(yesterNotes, oldNote);
      this.notes.delete(oldNote);
      this.notes.add(newNote);
    }

    // If any remaining old notes, scrap 'm
    yesterNotes.forEach((oldNote: NoteValue) => {
      const oldNodes = this.nodesWithNote(oldNote);
      oldNodes.forEach((oldNode) => this.noteGraph.deleteNode(oldNode));
      this.notes.delete(oldNote);
    });

    // If any remaining new notes, create new nodes
    newNotes.forEach((newNote: NoteValue) => {
      this.addNote(newNote);
      this.notes.add(newNote);
    });
  }

  public createNode() {
    const midiNote = this.randomNote();
    if (midiNote) {
      this.noteGraph.createNode({midiNote});
    }
  }

  public deleteNote(note: NoteValue) {
    this.notes.delete(note);
    this.noteGraph.nodes.forEach((node) => {
      if (noteToNoteValue(node.note) === note) {
        this.noteGraph.deleteNode(node);
      }
    });
  }

  public addNote(note: NoteValue, numNodes?: number) {
    this.notes.add(note);
    numNodes = isNumber(numNodes) ? numNodes : random(1, 5);
    times(numNodes);
    const midiNote = this.randomNote(note);
    if (midiNote) {
      times(numNodes, () => {
        this.noteGraph.createNode({midiNote});
      });
    }
  }

  private randomNote(noteValue?: NoteValue): Note | undefined {
    noteValue = noteValue || sample(Array.from(this.notes));
    if (noteValue) {
      return noteValue + random(2, 5) * 12;
    }
  }

  private nodesWithNote(note: NoteValue): NoteNode[] {
    return Array.from(this.noteGraph.nodes).filter((node) => {
      const nodeNote: NoteValue = noteToNoteValue(node.note);
      return nodeNote === note;
    });
  }
}
