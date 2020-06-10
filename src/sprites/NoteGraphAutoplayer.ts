import {autobind} from 'core-decorators';
import {difference, isNumber, pull, random, range, sample, times} from 'lodash';
import {Oscillator, PanVol, ToneAudioNode} from 'tone';
import {randomChord} from '../audio/chords';
import {generateRelatedChord} from '../audio/harmony';
import {midiNoteToFreq} from '../audio/midi';
import {Note, noteToNoteValue, NoteValue} from '../audio/Note';
import {randomSustainOscillatorOptions} from '../audio/oscillators';
import {doppler} from '../math/physics/doppler';
import {OverflowMode, scale} from '../math/scale';
import {angleBetween} from '../math/trig/angleBetween';
import {distanceBetween} from '../math/trig/distanceBetween';
import {WorldState} from '../types/State';
import {Microphone} from './Microphone';
import {NoteGraph, NoteNode} from './NoteGraph';
import {NoteGraphAction, NoteGraphController} from './NoteGraphController';

export interface NoteGraphAutoplayerParams {
  noteGraph: NoteGraph;
  onNotesUpdated: () => void;
  channel: ToneAudioNode;
  microphone: Microphone;
}

interface NodeSynth {
  synth: Oscillator;
  panVol: PanVol;
}

@autobind
export class NoteGraphAutoplayer implements NoteGraphController {
  // Store which notes are currently being played
  public readonly noteValues = new Set<NoteValue>();
  private readonly nodeSynths = new Map<NoteNode, NodeSynth>();

  // References
  private readonly noteGraph: NoteGraph;
  private readonly microphone: Microphone;

  public readonly actions: NoteGraphAction[][];
  private readonly randomActions = new Map<() => void, number>();
  private readonly channel: ToneAudioNode;
  private readonly onNotesUpdated: () => void;

  constructor(params: NoteGraphAutoplayerParams) {
    this.noteGraph = params.noteGraph;
    this.microphone = params.microphone;
    this.channel = params.channel;
    this.onNotesUpdated = params.onNotesUpdated;

    // Create nodes
    const numNodes = random(8, 16);
    this.noteValues = randomChord().notes;
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

    // Create random actions
    this.randomActions.set(this.createNode, 20);
    this.randomActions.set(this.deleteRandomNode, 20);
    this.randomActions.set(this.noteGraph.addEdge, 25);
    this.randomActions.set(this.noteGraph.deleteEdge, 40);
    this.randomActions.set(this.loadRelatedChord, 20);
    this.randomActions.set(this.noteGraph.splitGraph, 50);
    this.randomActions.set(this.noteGraph.mergeGraphs, 50);
    // this.randomActions.set(this.regenerateGraph, 500);
  }

  public tick(world: WorldState) {
    // Play the audio
    this.noteGraph.nodes.forEach((noteNode: NoteNode) => {
      const {note} = noteNode;
      const {audioSettings, traveler} = this.microphone;
      const {position} = traveler;
      const nodeSynth = this.nodeSynths.get(noteNode);
      if (!nodeSynth) {
        return;
      }
      const freq = midiNoteToFreq(note);
      const angleToNode = angleBetween(noteNode.position, position);
      const distanceToNode = distanceBetween(position, noteNode.position);

      let adjustedFreq = audioSettings
        ? doppler({
            source: {
              freq,
              position: noteNode.position,
              vector: noteNode.vector
            },
            target: traveler,
            settings: audioSettings
          })
        : freq;

      // Apply freq bounds
      if (adjustedFreq < 0) {
        adjustedFreq = 0;
      } else if (adjustedFreq > world.audio.sampleRate) {
        adjustedFreq = world.audio.sampleRate;
      }

      const volume = scale({
        input: distanceToNode,
        inputMin: 0,
        inputMax: audioSettings.maxAudibleDistance,
        outputMin: -4,
        outputMax: -75,
        logarithmic: audioSettings.distanceVolumeRolloff,
        overflowMode: OverflowMode.Constrain
      });

      const {synth, panVol} = nodeSynth;
      // Let quiet nodes be for performance
      if (panVol.volume.value < -30 && volume < -30) {
        return;
      }

      panVol.volume.rampTo(volume);
      panVol.pan.rampTo(Math.cos(angleToNode) * -1);
      synth.frequency.value = adjustedFreq;
    });

    // Perform random actions
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
      const node = this.noteGraph.createNode({
        midiNote
      });
      const synth = new Oscillator({
        ...randomSustainOscillatorOptions(),
        detune: random(-1, 1, true),
        frequency: midiNoteToFreq(midiNote)
      });
      const panVol = new PanVol();

      this.nodeSynths.set(node, {
        synth,
        panVol
      });
    }
  }

  public deleteRandomNode() {
    const node = sample(Array.from(this.noteGraph.nodes));
    if (node) {
      this.deleteNode(node);
    }
  }

  private deleteNode(node: NoteNode) {
    const fadeOutTime = 1000;
    this.noteGraph.deleteNode(node);
    const nodeSynth = this.nodeSynths.get(node);
    if (nodeSynth) {
      this.nodeSynths.delete(node);
      const {synth, panVol} = nodeSynth;
      synth.volume.rampTo(-200, fadeOutTime / 1000);
      setTimeout(() => {
        panVol.dispose();
        synth.dispose();
      }, fadeOutTime);
    }
  }

  public deleteRandomNote() {
    const note = sample(Array.from(this.noteValues));
    if (note) {
      this.deleteNote(note);
    }
  }

  private deleteNote(note: NoteValue) {
    this.noteValues.delete(note);
    this.noteGraph.nodes.forEach((node) => {
      if (noteToNoteValue(node.note) === note) {
        this.deleteNode(node);
      }
    });

    this.onNotesUpdated();
  }

  public addNote(noteValue?: NoteValue, numNodes?: number) {
    noteValue = noteValue || this.randomUnusedNote();
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
    this.noteGraph.destroy();
  }
}
