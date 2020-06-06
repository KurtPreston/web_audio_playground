import {difference, maxBy, pull, random, sample, sampleSize, times, without} from 'lodash';
import {Oscillator, PanVol, ToneAudioNode} from 'tone';
import {ToneOscillatorConstructorOptions} from 'tone/build/esm/source/oscillator/OscillatorInterface';
import {randomChord} from '../audio/chords';
import {midiNoteToFreq} from '../audio/midi';
import {getNoteInfo, Note, noteToNoteValue, NoteValue} from '../audio/Note';
import {randomSustainOscillatorOptions} from '../audio/oscillators';
import {nodeGroups} from '../math/graph/nodeGroups';
import {electricalForce} from '../math/physics/electricalForce';
import {springForce} from '../math/physics/springForce';
import {Dimensions, IPosition, IVector, WorldState} from '../types/State';
import {noteColor} from './renderHelpers/noteColor';
import {Sprite} from './Sprite';

export interface NoteGraphParams {
  dimensions: Dimensions;
  channel: ToneAudioNode;
  notes?: Set<NoteValue>;
  numNodes?: number;
}

export interface NoteNode {
  note: Note;
  position: IPosition;
  vector: IVector;
  size: number;
  synth: Oscillator;
  panVol: PanVol;
  flaggedForDelete?: boolean;
}

interface NoteEdge {
  node1: NoteNode;
  node2: NoteNode;
  springConstant: number;
  lineWidth: number;
  flaggedForDelete: boolean;
}

interface NodeOptions {
  oscillator: Partial<ToneOscillatorConstructorOptions>;
  midiNote: Note;
}

export interface NoteGraphPhysics {
  edgeLength: number;
  edgeStrength: number;
  repulsionStrength: number;
  repulsionExponent: number;
  momentumDamping: number;
  maxVelocity: number;
}

export class NoteGraph implements Sprite {
  public nodes = new Set<NoteNode>();
  private edges = new Set<NoteEdge>();

  private readonly channel: ToneAudioNode;
  private dimensions: Dimensions;
  public readonly notes: Set<NoteValue>;
  public physics: NoteGraphPhysics;

  constructor(params: NoteGraphParams) {
    this.notes = params.notes || randomChord().notes;
    this.channel = params.channel;
    this.dimensions = params.dimensions;
    this.physics = {
      edgeLength: 150,
      edgeStrength: 0.1,
      repulsionStrength: 5000,
      repulsionExponent: 1.5,
      momentumDamping: 0.8,
      maxVelocity: 1000
    };

    // Create nodes
    const numNodes = params.numNodes || random(8, 16);
    times(numNodes, () => this.createNode());
  }

  private randomNote(noteValue?: NoteValue): Note {
    noteValue = noteValue || (sample(Array.from(this.notes)) as NoteValue);
    return noteValue + random(2, 5) * 12;
  }

  public createNode(options: Partial<NodeOptions> = {}): void {
    const oscillator = options.oscillator || randomSustainOscillatorOptions();
    const note: Note = options.midiNote || this.randomNote();
    const {width, height} = this.dimensions;

    // Create the node
    const synth = new Oscillator({
      ...oscillator,
      detune: random(-1, 1, true),
      phase: random(0, Math.PI * 2, true),
      frequency: midiNoteToFreq(note)
    });
    synth.volume.value = -100;
    synth.start();
    synth.volume.rampTo(0, 1);
    const panVol = new PanVol();

    panVol.connect(this.channel);
    synth.connect(panVol);

    // Create the node
    const node: NoteNode = {
      note,
      vector: {
        xMomentum: 0,
        yMomentum: 0
      },
      position: {
        x: random(0, width),
        y: random(0, height)
      },
      size: 0,
      synth,
      panVol
    };

    // Connect the node to the graph
    const numNodesToConnectTo = random(0, 4);
    const nodesToConnectTo: NoteNode[] = sampleSize(Array.from(this.nodes), numNodesToConnectTo);
    nodesToConnectTo.forEach((node2: NoteNode) => {
      this.addEdge({
        node1: node,
        node2
      });
    });

    // Add node
    this.nodes.add(node);
  }

  // Returns a list of all connected node groups
  private nodeGroups(): NoteNode[][] {
    return nodeGroups({
      nodes: Array.from(this.nodes).filter((node) => !node.flaggedForDelete),
      edges: Array.from(this.edges).filter((edge) => !edge.flaggedForDelete)
    });
  }

  // Delete some set of edges to split node1 and node2 from each other
  public splitGraph() {
    const groups: NoteNode[][] = this.nodeGroups();
    const largestGroup = maxBy(groups, (group) => group.length);
    if (!largestGroup) {
      return;
    }

    const nodes: NoteNode[] = Array.from(largestGroup);
    const group1: Set<NoteNode> = new Set(sampleSize(nodes, Math.round(nodes.length / 2)));
    const group2: Set<NoteNode> = new Set(without(nodes, ...Array.from(group1)));

    this.edges.forEach((edge) => {
      const {node1, node2} = edge;
      if ((group1.has(node1) && group2.has(node2)) || (group2.has(node1) && group1.has(node2))) {
        edge.flaggedForDelete = true;
      }
    });
  }

  public addEdge(params?: {node1: NoteNode; node2: NoteNode}) {
    const {node1, node2} = params || {
      node1: sample(Array.from(this.nodes)),
      node2: sample(Array.from(this.nodes))
    };
    if (!node1 || !node2) {
      return;
    }
    for (const edge of Array.from(this.edges)) {
      if (
        (edge.node1 === node1 && edge.node2 === node2) ||
        (edge.node1 === node2 && edge.node2 === node1)
      ) {
        // Edge already exists
        return;
      }
    }
    this.edges.add({
      node1,
      node2,
      springConstant: 0,
      lineWidth: 0,
      flaggedForDelete: false
    });
  }

  public mergeGraphs() {
    const groups: NoteNode[][] = this.nodeGroups();
    if (groups.length <= 1) {
      return;
    }
    for (let i = 0; i < groups.length - 1; i++) {
      const group1 = groups[i];
      const group2 = groups[i + 1];
      times(random(1, 5), () => {
        const node1 = sample(group1);
        const node2 = sample(group2);
        if (node1 && node2) {
          this.addEdge({
            node1,
            node2
          });
        }
      });
    }
  }

  public deleteNote(note: NoteValue) {
    this.notes.delete(note);
    this.nodes.forEach((node) => {
      if (noteToNoteValue(node.note) === note) {
        this.deleteNode(node);
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
        node.note = this.randomNote(newNote);
      });
      pull(newNotes, newNote);
      pull(yesterNotes, oldNote);
      this.notes.delete(oldNote);
      this.notes.add(newNote);
    }

    // If any remaining old notes, scrap 'm
    yesterNotes.forEach((oldNote: NoteValue) => {
      const oldNodes = this.nodesWithNote(oldNote);
      oldNodes.forEach((oldNode) => this.deleteNode(oldNode));
      this.notes.delete(oldNote);
    });

    // If any remaining new notes, create new nodes
    newNotes.forEach((newNote: NoteValue) => {
      this.addNote(newNote);
      this.notes.add(newNote);
    });
  }

  public addNote(note: NoteValue, numNodes?: number) {
    this.notes.add(note);
    numNodes = numNodes || random(1, 5);
    const midiNote = this.randomNote(note);
    times(numNodes, () => {
      this.createNode({midiNote});
    });
  }

  public deleteNode(node?: NoteNode) {
    node = node || sample(Array.from(this.nodes));
    if (node) {
      node.flaggedForDelete = true;
      node.synth.volume.rampTo(-200, 1);
      this.edges.forEach((edge: NoteEdge) => {
        if (edge.node1 === node || edge.node2 === node) {
          edge.flaggedForDelete = true;
        }
      });
      setTimeout(() => {
        if (node) {
          node.panVol.disconnect();
          node.synth.disconnect();
          node.panVol.dispose();
          node.synth.dispose();
          this.nodes.delete(node);
          this.edges.forEach((edge: NoteEdge) => {
            if (edge.node1 === node || edge.node2 === node) {
              this.edges.delete(edge);
            }
          });
        }
      }, 1000);
    }
  }

  public deleteEdge(edge?: NoteEdge) {
    edge = edge || sample(Array.from(this.edges.values()));
    if (edge) {
      edge.flaggedForDelete = true;
      setTimeout(() => {
        this.edges.delete(edge as NoteEdge);
      }, 1000);
    }
  }

  private nodesWithNote(note: NoteValue): NoteNode[] {
    return Array.from(this.nodes).filter((node) => {
      const nodeNote: NoteValue = noteToNoteValue(node.note);
      return nodeNote === note;
    });
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    // Draw edges
    canvas.strokeStyle = 'white';
    this.edges.forEach((edge: NoteEdge) => {
      const {node1, node2, lineWidth} = edge;
      canvas.lineWidth = lineWidth;
      canvas.beginPath();
      canvas.moveTo(node1.position.x, node1.position.y);
      canvas.lineTo(node2.position.x, node2.position.y);
      canvas.stroke();
      canvas.closePath();
    });

    this.nodes.forEach((node: NoteNode) => {
      const {position, note, size} = node;
      const {x, y} = position;
      const {letter, accidental} = getNoteInfo(note);

      // Draw nodes
      const nodeSize = size;
      const fontSize = 0.8 * size;
      const noteIsSelected = false;
      canvas.beginPath();
      canvas.arc(x, y, nodeSize, 0, 2 * Math.PI);
      canvas.fillStyle = noteColor(note, 0.5);
      canvas.fill();
      canvas.closePath();

      // Draw letters
      canvas.font = noteIsSelected
        ? `bold ${fontSize * 1.25}px sans-serif`
        : `${fontSize}px sans-serif`;
      canvas.fillStyle = 'white';
      canvas.textAlign = 'center';
      canvas.textBaseline = 'middle';
      canvas.fillText(`${letter}${accidental ? '♯' : ''}`, x, y);
    });
  }

  public tick(world: WorldState) {
    const {dimensions, midiKeysPressed} = world;

    if (midiKeysPressed) {
      const noteValues = new Set<NoteValue>(Array.from(midiKeysPressed).map(noteToNoteValue));
      this.notes.forEach((noteValue: NoteValue) => {
        if (!noteValues.has(noteValue)) {
          this.deleteNote(noteValue);
        }
      });
      noteValues.forEach((noteValue: NoteValue) => {
        if (!this.notes.has(noteValue)) {
          this.addNote(noteValue);
        }
      });
    }

    // Cache dimensions so new nodes can be added
    this.dimensions = dimensions;

    // Grow new nodes to target size
    this.nodes.forEach((node) => {
      if (node.flaggedForDelete) {
        if (node.size > 0) {
          node.size--;
        }
      } else {
        if (node.size < 25) {
          node.size++;
        }
      }
    });

    // Grow edges to target strength
    this.edges.forEach((edge) => {
      if (edge.flaggedForDelete) {
        if (edge.springConstant > 0) {
          edge.springConstant -= 0.05;
        }

        if (edge.lineWidth > 0) {
          edge.lineWidth -= 0.1;
        }

        if (edge.lineWidth <= 0 || edge.springConstant <= 0) {
          this.edges.delete(edge);
        }
      } else {
        if (edge.springConstant < 0.1) {
          edge.springConstant += 0.01;
        }

        if (edge.lineWidth < 3) {
          edge.lineWidth += 0.03;
        }
      }
    });

    // Adjust momentum by applying spring force between connected nodes
    this.edges.forEach(({node1, node2, springConstant}) => {
      const {xForce, yForce} = springForce({
        point1: node1.position,
        point2: node2.position,
        springConstant: this.physics.edgeStrength,
        targetDistance: this.physics.edgeLength
      });

      node1.vector.xMomentum += xForce;
      node1.vector.yMomentum += yForce;
      node2.vector.xMomentum -= xForce;
      node2.vector.yMomentum -= yForce;
    });

    // Apply electrical repulsion between all nodes
    this.nodes.forEach((node1) => {
      this.nodes.forEach((node2) => {
        if (node1 === node2) {
          return;
        }

        const {xForce, yForce} = electricalForce({
          point1: node1.position,
          point2: node2.position,
          coefficient: -this.physics.repulsionStrength, // repel,
          exponent: this.physics.repulsionExponent
        });

        node1.vector.xMomentum += xForce;
        node1.vector.yMomentum += yForce;
        node2.vector.yMomentum -= xForce;
        node2.vector.yMomentum -= yForce;
      });
    });

    // Gravitate towards center
    const center = {
      x: dimensions.width / 2,
      y: dimensions.height / 2
    };
    this.nodes.forEach((node1) => {
      const {xForce, yForce} = electricalForce({
        point1: node1.position,
        point2: center,
        coefficient: 1,
        exponent: -0.3
      });

      node1.vector.xMomentum += xForce;
      node1.vector.yMomentum += yForce;
    });

    // Apply damping
    const dampingCoefficient = this.physics.momentumDamping;
    this.nodes.forEach(({vector}) => {
      // Apply damping
      vector.xMomentum *= dampingCoefficient;
      vector.yMomentum *= dampingCoefficient;
    });

    // Limit to max velocity
    // const maxVelocity = 20;
    this.nodes.forEach(({vector}) => {
      // Apply max velocity
      const velocity = Math.sqrt(Math.pow(vector.xMomentum, 2) + Math.pow(vector.yMomentum, 2));
      const ratio = this.physics.maxVelocity / velocity;
      if (ratio < 1) {
        vector.xMomentum *= ratio;
        vector.yMomentum *= ratio;
      }
    });

    // Adjust positions
    this.nodes.forEach(({position, vector}: NoteNode) => {
      position.x += vector.xMomentum;
      position.y += vector.yMomentum;
    });

    // Enforce boundaries
    // this.nodes.forEach(({position, vector}: NoteNode) => {
    //   if (position.x < 0) {
    //     position.x = 0;
    //   }
    //   if (position.x > world.dimensions.width) {
    //     position.x = world.dimensions.width;
    //   }
    //   if (position.y < 0) {
    //     position.y = 0;
    //   }
    //   if (position.y > world.dimensions.height) {
    //     position.y = world.dimensions.height;
    //   }
    // });
  }

  public destroy() {
    this.nodes.forEach((node) => {
      node.panVol.disconnect();
      node.synth.disconnect();
      node.panVol.dispose();
      node.synth.dispose();
    });
    this.nodes.clear();
    this.edges.clear();
  }
}
