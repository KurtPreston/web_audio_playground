import {autobind} from 'core-decorators';
import {difference, isNumber, pull, random, range, sample, times} from 'lodash';
import {Oscillator} from 'tone';
import {Chord, normalizeChord, randomChord} from '../../audio/chords';
import {generateRelatedChord} from '../../audio/harmony';
import {freqToMidiNote, midiNoteToFreq} from '../../audio/midi';
import {Note, noteToNoteValue, NoteValue} from '../../audio/Note';
import {randomSustainOscillatorOptions} from '../../audio/oscillators';
import {Sequencer} from '../../audio/Sequencer/Sequencer';
import {WorldState} from '../../types/State';
import {Microphone} from '../Microphone/Microphone';
import {MicrophoneAudioSettings} from '../Microphone/MicrophoneAudioSettings.generated';
import {MicrophoneConnection} from '../Microphone/MicrophoneConnection';
import {NoteGraph, NoteNode} from './NoteGraph';
import {NoteGraphAction, NoteGraphController} from './NoteGraphController';

export interface NoteGraphAutoplayerParams {
  noteGraph: NoteGraph;
  onNotesUpdated: () => void;
  mic: Microphone;
  sequencer: Sequencer;
}

interface NodeSynth {
  synth: Oscillator;
  connection: MicrophoneConnection;
}

@autobind
export class NoteGraphAutoplayer implements NoteGraphController {
  // Store which notes are currently being played
  public chord: Chord;
  private readonly nodeSynths = new Map<NoteNode, NodeSynth>();

  // References
  private readonly noteGraph: NoteGraph;
  private readonly mic: Microphone;

  public readonly actions: NoteGraphAction[][];
  private readonly randomActions = new Map<() => void, number>();
  private readonly onNotesUpdated: () => void;
  private readonly unsubscribeFromSequencer: () => void;

  constructor(params: NoteGraphAutoplayerParams) {
    this.noteGraph = params.noteGraph;
    this.mic = params.mic;
    this.onNotesUpdated = params.onNotesUpdated;

    // Create nodes
    const numNodes = random(8, 16);
    this.chord = randomChord();
    times(numNodes, this.createNode);

    // Set publicly accessible actions
    this.actions = [
      [
        {
          name: 'Related chord',
          action: this.loadRelatedChord
        }
      ],
      [
        {
          name: 'Add Note',
          action: () => this.addNote()
        },
        {
          name: 'Delete Note',
          action: () => this.deleteRandomNote()
        }
      ],
      [
        {
          name: 'Add Node',
          action: this.createNode
        },
        {
          name: 'Delete Node',
          action: this.deleteRandomNode
        }
      ]
    ];

    // Follow sequencer
    this.unsubscribeFromSequencer = params.sequencer.subscribe((chord: Chord) => {
      this.setChord(chord.noteValues);
    });

    // Create random actions
    this.randomActions.set(this.createNode, 20);
    this.randomActions.set(this.deleteRandomNode, 20);
    this.randomActions.set(this.noteGraph.addEdge, 25);
    this.randomActions.set(this.noteGraph.deleteEdge, 40);
    // this.randomActions.set(this.loadRelatedChord, 20);
    this.randomActions.set(this.noteGraph.splitGraph, 50);
    this.randomActions.set(this.noteGraph.mergeGraphs, 50);
    this.randomActions.set(this.cullNodes, 50);
    // this.randomActions.set(this.regenerateGraph, 500);
  }

  public get noteValues(): Set<NoteValue> {
    return this.chord.noteValues;
  }

  public tick(world: WorldState) {
    // Play the audio
    this.noteGraph.nodes.forEach((node) => {
      if (!this.nodeSynths.has(node)) {
        this.createSynthForNode(node);
      }
    });

    this.nodeSynths.forEach((nodeSynth, noteNode: NoteNode) => {
      nodeSynth.connection.tick();

      if (!this.noteGraph.hasNode(noteNode)) {
        this.deleteNode(noteNode);
      }
    });

    // Perform random actions
    this.randomActions.forEach((interval, action) => {
      const oddsOfHappeningThisFrame = 1 / 25 / interval;
      if (Math.random() < oddsOfHappeningThisFrame) {
        action();
      }
    });
  }

  public get audioSettings(): MicrophoneAudioSettings {
    return this.mic.audioSettings;
  }

  public setChord(chord: Set<NoteValue>) {
    const chordNotes: NoteValue[] = normalizeChord(Array.from(chord));
    const newNotes = difference(chordNotes, Array.from(this.chord.noteValues));
    const yesterNotes = difference(Array.from(this.chord.noteValues), chordNotes);

    // Rebuild any overlapping notes that have disappeared
    chord.forEach((noteValue: Note) => {
      const currentNodes: NoteNode[] = this.nodesWithNote(noteValue);
      if (this.chord.noteValues.has(noteValue) && currentNodes.length === 0) {
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

          const nodeSynth = this.nodeSynths.get(node);
          if (nodeSynth) {
            const freq = midiNoteToFreq(note);
            nodeSynth.synth.frequency.value = freq;
          }
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
      oldNodes.forEach((oldNode) => this.deleteNode(oldNode));
      this.noteValues.delete(oldNote);
    });

    // If any remaining new notes, create new nodes
    newNotes.forEach((newNote: NoteValue) => {
      this.addNote(newNote);
      this.noteValues.add(newNote);
    });

    this.onNotesUpdated();
  }

  private numNodesPerNoteValue() {
    const nodeStatus: {[note: string]: number} = {};
    this.nodeSynths.forEach((synth, node) => {
      if (node.flaggedForDelete) {
        return;
      }
      const freq = synth.synth.frequency.value as number;
      const midiNote = freqToMidiNote(freq);
      const noteValue = noteToNoteValue(midiNote);
      // const name = getNoteName(midiNote);
      if (!nodeStatus[noteValue]) {
        nodeStatus[noteValue] = 0;
      }
      nodeStatus[noteValue]++;
    });

    return nodeStatus;
  }

  public createNode() {
    const midiNote = this.randomNote();
    if (midiNote) {
      const node = this.noteGraph.createNode({
        midiNote
      });

      this.createSynthForNode(node);
    }
  }

  private createSynthForNode(node: NoteNode) {
    const synth = new Oscillator({
      ...randomSustainOscillatorOptions(),
      volume: Number.NEGATIVE_INFINITY,
      detune: random(-1, 1, true),
      frequency: midiNoteToFreq(node.note)
    });

    const connection: MicrophoneConnection = this.mic.connect({
      sourceAudio: synth,
      sourcePosition: () => ({
        position: node.position,
        vector: node.vector
      }),
      pitchBend: (ratio: number) => {
        const frequency = midiNoteToFreq(node.note);
        synth.frequency.value = frequency * ratio;
      }
    });

    synth.start();
    synth.volume.exponentialRampTo(0, 1);

    this.nodeSynths.set(node, {
      synth,
      connection
    });
  }

  public deleteRandomNode() {
    const node = sample(this.activeNodes());
    if (node) {
      this.deleteNode(node);
    }
  }

  private activeNodes(): NoteNode[] {
    const nodes = Array.from(this.noteGraph.nodes);
    return nodes.filter((node) => !node.flaggedForDelete);
  }

  private cullNodes() {
    const maxNumNodes = random(3, 25);
    while (this.activeNodes().length > maxNumNodes) {
      this.deleteRandomNode();
    }
  }

  private deleteNode(node: NoteNode) {
    this.noteGraph.deleteNode(node);
    const nodeSynth = this.nodeSynths.get(node);
    if (nodeSynth) {
      this.nodeSynths.delete(node);
      const {synth, connection} = nodeSynth;

      connection.destroy().then(() => {
        synth.dispose();
      });
    }
  }

  public deleteRandomNote() {
    const note = sample(Array.from(this.noteValues));
    if (note) {
      this.deleteNote(note);
    }
  }

  private deleteNote(noteValue: NoteValue) {
    this.noteValues.delete(noteValue);
    this.noteGraph.nodes.forEach((node) => {
      if (noteToNoteValue(node.note) === noteValue) {
        this.deleteNode(node);
      }
    });

    this.onNotesUpdated();
  }

  public addNote(noteValue?: NoteValue, numNodes?: number) {
    noteValue = noteValue ?? this.randomUnusedNote();
    if (isNumber(noteValue)) {
      this.noteValues.add(noteValue);
      numNodes = isNumber(numNodes) ? numNodes : random(1, 5);
      times(numNodes, () => {
        const midiNote = this.randomNote(noteValue);
        if (isNumber(midiNote)) {
          this.noteGraph.createNode({midiNote});
        }
      });
    }

    this.onNotesUpdated();
  }

  private randomUnusedNote(): Note | undefined {
    const unusedNotes = range(0, 12).filter(
      (noteValue: NoteValue) => !this.noteValues.has(noteValue)
    );
    return sample(unusedNotes);
  }

  public loadRelatedChord() {
    const relatedChord = generateRelatedChord(this.chord);
    this.setChord(relatedChord.noteValues);
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
    this.unsubscribeFromSequencer();
    this.nodeSynths.forEach(({synth, connection}) => {
      synth.stop();
      connection.dispose();
      synth.dispose();
    });
    this.nodeSynths.clear();
    this.noteGraph.destroy();
  }
}
