import {compact, isNumber, omit, random, times} from 'lodash';
import MidiPlayer from 'midi-player-js';
import {Oscillator, ToneAudioNode} from 'tone';
import {midiNoteToFreq} from '../../audio/midi';
import {Note, noteToNoteValue, NoteValue} from '../../audio/Note';
import {randomSustainOscillatorOptions} from '../../audio/oscillators';
import {JsonSchemaForm} from '../../forms/JsonSchemaForm';
import {scale} from '../../math/scale';
import {NoteGraphMidiPlayerOptionsSchema} from '../../types/schemas.generated';
import {WorldState} from '../../types/State';
import {NoteGraph, NoteNode} from './NoteGraph';
import {NoteGraphAction, NoteGraphController} from './NoteGraphController';
import {NoteGraphMidiPlayerOptions} from './NoteGraphMidiPlayerOptions.generated';

export interface NoteGraphParams {
  noteGraph: NoteGraph;
  onNotesUpdated: () => void;
  channel: ToneAudioNode;
}

export class NoteGraphMidiPlayer implements NoteGraphController {
  private readonly notes = new Map<Note, Map<NoteNode, Oscillator>>();
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

    this.playMidiTrack();
  }

  private async playMidiTrack() {
    const Player = new MidiPlayer.Player();
    const response = await fetch('/moonlight_sonata.mid');
    const blob = await response.blob();
    const buffer = await (blob as any).arrayBuffer();
    Player.loadArrayBuffer(buffer);
    Player.on('midiEvent', (event: MidiPlayer.Event) => {
      const {name, noteNumber, velocity} = event;
      if (!noteNumber) {
        return;
      }
      if (name === 'Note on' && noteNumber && isNumber(velocity)) {
        this.playNote(noteNumber, velocity);
      } else if (name === 'Note off' && noteNumber) {
        this.releaseNote(noteNumber);
      }
    });
    Player.play();
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
      schema: omit(NoteGraphMidiPlayerOptionsSchema, 'title')
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
    const nodeMap: Map<NoteNode, Oscillator> =
      this.notes.get(midiNote) || new Map<NoteNode, Oscillator>();
    const newNodes = compact(
      times(random(2, 5), () => {
        const synth = new Oscillator({
          ...randomSustainOscillatorOptions(),
          frequency: midiNoteToFreq(midiNote),
          detune: random(-1, 1, true),
          volume: Number.NEGATIVE_INFINITY
        });
        const volume = scale({
          input: velocity,
          inputMin: 0,
          inputMax: 127,
          outputMin: -30,
          outputMax: 0,
          logarithmic: 3
        });
        synth.start();
        synth.volume.exponentialRampTo(volume, 0.007);
        const node = this.noteGraph.createNode({
          midiNote
        });
        synth.connect(this.channel);
        return {
          synth,
          node
        };
      })
    );

    newNodes.forEach(({node, synth}) => {
      nodeMap.set(node, synth);
    });

    if (this.options.autoRelease) {
      setTimeout(() => {
        newNodes.forEach(({node}) => {
          this.deleteNode(node);
        });
        this.onNotesUpdated();
      }, this.options.autoRelease);
    }

    this.notes.set(midiNote, nodeMap);
    this.onNotesUpdated();
  }

  private deleteNode(node: NoteNode) {
    const releaseTime = 3000;
    this.noteGraph.deleteNode(node);
    const nodeMap = this.notes.get(node.note);
    if (nodeMap) {
      const synth = nodeMap.get(node);
      if (synth) {
        synth.volume.exponentialRampTo(-200, releaseTime / 1000);
        setTimeout(() => {
          synth.disconnect();
          synth.dispose();
        }, releaseTime);
      }

      nodeMap.delete(node);

      if (nodeMap.size === 0) {
        this.notes.delete(node.note);
      }
    }
  }

  private releaseNote(note: Note) {
    this.notes.get(note)?.forEach((synth, node) => {
      this.deleteNode(node);
    });
    this.notes.delete(note);
    this.onNotesUpdated();
  }

  private clearNotes() {
    this.notes.forEach((nodeMap) => {
      nodeMap.forEach((synth, node) => {
        this.deleteNode(node);
      });
    });
    this.notes.clear();
  }

  public destroy() {
    this.clearNotes();
  }
}
