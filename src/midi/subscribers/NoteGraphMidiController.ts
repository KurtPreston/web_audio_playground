import {autobind} from 'core-decorators';
import {random, times} from 'lodash';
import {Note} from '../../audio/Note';
import {NoteGraph, NoteNode} from '../../sprites/NoteGraph';
import {NoteGraphAction} from '../../sprites/NoteGraphController';
import {MidiNoteEvent, MidiNoteSubscribe} from '../MidiNoteBus';
import {IMidiSubscriber} from './MidiSubscriber';

export interface NoteGraphMidiPlayerParams {
  noteGraph: NoteGraph;
  subscribe: MidiNoteSubscribe;
}

@autobind
export class NoteGraphMidiPlayer implements IMidiSubscriber {
  private readonly noteGraph: NoteGraph;
  private readonly noteNodes = new Map<Note, NoteNode[]>();

  public readonly actions: NoteGraphAction[][] = [];

  constructor(params: NoteGraphMidiPlayerParams) {
    this.noteGraph = params.noteGraph;
    params.subscribe(this.onMidiEvent);
  }

  private onMidiEvent(event: MidiNoteEvent) {
    const {note, velocity} = event;
    if (velocity) {
      const nodes = times(random(1, 5), () =>
        this.noteGraph.createNode({
          midiNote: note
        })
      );

      const currentNodes = this.noteNodes.get(note);
      if (currentNodes) {
        currentNodes.push(...nodes);
      } else {
        this.noteNodes.set(note, nodes);
      }
    } else {
      const nodes = this.noteNodes.get(note);
      if (nodes) {
        nodes.forEach(this.noteGraph.deleteNode);
        this.noteNodes.delete(note);
      }
    }
  }

  public destroy() {
    this.noteNodes.forEach((nodes: NoteNode[]) => {
      nodes.forEach((node: NoteNode) => {
        this.noteGraph.deleteNode(node);
      });
    });
  }
}
