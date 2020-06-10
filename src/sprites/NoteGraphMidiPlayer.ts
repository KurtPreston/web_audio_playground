import {compact, omit, random, times} from 'lodash';
import {ToneAudioNode} from 'tone';
import {Note, noteToNoteValue, NoteValue} from '../audio/Note';
import {randomSustainOscillatorOptions} from '../audio/oscillators';
import {JsonSchemaForm} from '../forms/JsonSchemaForm';
import {scale} from '../math/scale';
import NoteGraphMidiPlayerOptionsSchema from '../schemas/NoteGraphMidiPlayerOptions.json';
import {JsonSchema} from '../types/JsonSchema';
import {NoteGraphMidiPlayerOptions} from '../types/NoteGraphMidiPlayerOptions.d';
import {WorldState} from '../types/State';
import {NoteGraph, NoteNode} from './NoteGraph';
import {NoteGraphAction, NoteGraphController} from './NoteGraphController';

export interface NoteGraphParams {
  noteGraph: NoteGraph;
  onNotesUpdated: () => void;
  channel: ToneAudioNode;
}

export class NoteGraphMidiPlayer implements NoteGraphController {
  private readonly notes = new Map<Note, Set<NoteNode>>();
  private readonly noteGraph: NoteGraph;
  private readonly onNotesUpdated: () => void;
  private readonly channel: ToneAudioNode;

  private options: NoteGraphMidiPlayerOptions = {
    autoRelease: 0
  };

  public readonly actions: NoteGraphAction[][] = [];

  constructor(params: NoteGraphParams) {
    this.noteGraph = params.noteGraph;
    this.onNotesUpdated = params.onNotesUpdated;
    this.channel = params.channel;
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
            this.playNote(midiNote, value);
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

  private playNote(midiNote: Note, velocity: number) {
    const nodeSet: Set<NoteNode> = this.notes.get(midiNote) || new Set<NoteNode>();
    const newNodes = compact(
      times(random(2, 5), () => {
        console.log(velocity);
        return this.noteGraph.createNode({
          oscillator: {
            ...randomSustainOscillatorOptions(),
            volume: scale({
              input: velocity,
              inputMin: 0,
              inputMax: 127,
              outputMin: -25,
              outputMax: 0,
              logarithmic: 3
            })
          },
          midiNote,
          channel: this.channel
        });
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
