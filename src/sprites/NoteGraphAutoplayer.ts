import {autobind} from 'core-decorators';
import {difference, isNumber, pull, random, range, sample, times} from 'lodash';
import {randomChord} from '../audio/chords';
import {generateRelatedChord} from '../audio/harmony';
import {Note, noteToNoteValue, NoteValue} from '../audio/Note';
import {NoteGraph, NoteNode} from './NoteGraph';
import {NoteGraphAction, NoteGraphController} from './NoteGraphController';

@autobind
export class NoteGraphAutoplayer implements NoteGraphController {
  // Store which notes are currently being played
  public readonly noteValues = new Set<NoteValue>();

  public readonly actions: NoteGraphAction[];
  private randomActions = new Map<() => void, number>();

  constructor(private readonly noteGraph: NoteGraph, private readonly onNotesUpdated: () => void) {
    // Create nodes
    const numNodes = random(8, 16);
    this.noteValues = randomChord().notes;
    times(numNodes, () => {
      const midiNote = this.randomNote();
      if (midiNote) {
        this.noteGraph.createNode({midiNote});
      }
    });

    // Set publicly accessible actions
    this.actions = [
      {
        name: 'Related chord',
        action: this.loadRelatedChord
      },
      {
        name: 'Add Note',
        action: this.addNote
      },
      {
        name: 'Delete Note',
        action: this.deleteNote
      },
      {
        name: 'Add Node',
        action: this.createNode
      },
      {
        name: 'Delete Node',
        action: this.noteGraph.deleteNode
      }
    ];

    // Create random actions
    this.randomActions.set(this.createNode, 20);
    this.randomActions.set(this.noteGraph.deleteNode, 20);
    this.randomActions.set(this.noteGraph.addEdge, 25);
    this.randomActions.set(this.noteGraph.deleteEdge, 40);
    this.randomActions.set(this.loadRelatedChord, 20);
    this.randomActions.set(this.noteGraph.splitGraph, 50);
    this.randomActions.set(this.noteGraph.mergeGraphs, 50);
    // this.randomActions.set(this.regenerateGraph, 500);
  }

  public tick() {
    this.randomActions.forEach((interval, action) => {
      const oddsOfHappeningThisFrame = 1 / 25 / interval;
      if (Math.random() < oddsOfHappeningThisFrame) {
        action();
      }
    });
  }

  public setChord(chord: Set<NoteValue>) {
    const newNotes = difference(Array.from(chord), Array.from(this.noteValues));
    const yesterNotes = difference(Array.from(this.noteValues), Array.from(chord));

    // Rebuild any overlapping notes that have disappeared
    chord.forEach((noteValue: Note) => {
      const currentNodes: NoteNode[] = this.nodesWithNote(noteValue);
      if (this.noteValues.has(noteValue) && currentNodes.length === 0) {
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
      this.noteValues.delete(oldNote);
      this.noteValues.add(newNote);
    }

    // If any remaining old notes, scrap 'm
    yesterNotes.forEach((oldNote: NoteValue) => {
      const oldNodes = this.nodesWithNote(oldNote);
      oldNodes.forEach((oldNode) => this.noteGraph.deleteNode(oldNode));
      this.noteValues.delete(oldNote);
    });

    // If any remaining new notes, create new nodes
    newNotes.forEach((newNote: NoteValue) => {
      this.addNote(newNote);
      this.noteValues.add(newNote);
    });

    this.onNotesUpdated();
  }

  public createNode() {
    const midiNote = this.randomNote();
    if (midiNote) {
      this.noteGraph.createNode({midiNote});
    }
  }

  public deleteNote(note?: NoteValue) {
    note = note || sample(Array.from(this.noteValues));
    if (note) {
      this.noteValues.delete(note);
      this.noteGraph.nodes.forEach((node) => {
        if (noteToNoteValue(node.note) === note) {
          this.noteGraph.deleteNode(node);
        }
      });
    }

    this.onNotesUpdated();
  }

  public addNote(noteValue?: NoteValue, numNodes?: number) {
    noteValue = noteValue || this.randomUnusedNote();
    if (noteValue) {
      this.noteValues.add(noteValue);
      numNodes = isNumber(numNodes) ? numNodes : random(1, 5);
      times(numNodes);
      const midiNote = this.randomNote(noteValue);
      if (midiNote) {
        times(numNodes, () => {
          this.noteGraph.createNode({midiNote});
        });
      }
    }

    this.onNotesUpdated();
  }

  private randomUnusedNote(): Note | undefined {
    const unusedNotes = range(0, 12).filter((noteValue: NoteValue) =>
      this.noteValues.has(noteValue)
    );
    return sample(unusedNotes);
  }

  public loadRelatedChord() {
    const relatedChord = generateRelatedChord(this.noteValues);
    this.setChord(relatedChord.notes);
  }

  private randomNote(noteValue?: NoteValue): Note | undefined {
    noteValue = noteValue || sample(Array.from(this.noteValues));
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

  public destroy() {
    this.noteValues.forEach(this.deleteNote);
  }
}
