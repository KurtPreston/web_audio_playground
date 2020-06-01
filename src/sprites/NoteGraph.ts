import {random, sample, sampleSize, times} from 'lodash';
import {PanVol, Synth, SynthOptions, ToneAudioNode} from 'tone';
import {randomChord} from '../audio/chords';
import {getNoteInfo, Note} from '../audio/Note';
import {randomSustainSynth, SynthPreset} from '../audio/oscillators';
import {electricalForce} from '../math/physics/electricalForce';
import {springForce} from '../math/physics/springForce';
import {Dimensions, IPosition, IVector, WorldState} from '../types/State';
import {noteColor} from './renderHelpers/noteColor';
import {Sprite} from './Sprite';

export interface NoteGraphParams {
  dimensions: Dimensions;
  channel: ToneAudioNode;
  notes?: Note[];
  numNodes?: number;
}

export interface NoteNode {
  note: Note;
  position: IPosition;
  vector: IVector;
  synth: Synth;
  panVol: PanVol;
}

interface NoteEdge {
  node1: NoteNode;
  node2: NoteNode;
}

export class NoteGraph implements Sprite {
  public nodes = new Set<NoteNode>();
  private edges = new Set<NoteEdge>();

  private readonly channel: ToneAudioNode;
  private dimensions: Dimensions;
  public readonly notes: Note[];
  public synthPresets: SynthPreset[];

  constructor(params: NoteGraphParams) {
    this.notes = params.notes || randomChord();
    this.channel = params.channel;
    this.dimensions = params.dimensions;

    // Define the synths that will be used
    const numSynths = random(1, 5);
    this.synthPresets = times(numSynths, randomSustainSynth);

    // Create nodes
    const numNodes = params.numNodes || random(8, 16);
    times(numNodes, () => this.createNode());
  }

  public createNode(note: Note = sample(this.notes) as Note): void {
    const {width, height} = this.dimensions;

    // Create the node
    const synthOptions: SynthOptions = sample(this.synthPresets) as SynthOptions;
    const synth = new Synth(synthOptions);
    const panVol = new PanVol();
    synth.connect(panVol);
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
      synth,
      panVol
    };
    panVol.connect(this.channel);

    // Connect the node to the graph
    const numNodesToConnectTo = random(0, 4);
    const nodesToConnectTo: NoteNode[] = sampleSize(Array.from(this.nodes), numNodesToConnectTo);
    nodesToConnectTo.forEach((node2: NoteNode) => {
      this.edges.add({
        node1: node,
        node2
      });
    });

    // Add node
    this.nodes.add(node);
  }

  public deleteNode() {
    const node: NoteNode = sample(Array.from(this.nodes)) as NoteNode;
    node.panVol.dispose();
    node.synth.dispose();
    this.nodes.delete(node);
    this.edges.forEach((edge: NoteEdge) => {
      if (edge.node1 === node || edge.node2 === node) {
        this.edges.delete(edge);
      }
    });
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    // Draw edges
    canvas.strokeStyle = 'white';
    canvas.lineWidth = 3;
    this.edges.forEach((edge: NoteEdge) => {
      const {node1, node2} = edge;
      canvas.beginPath();
      canvas.moveTo(node1.position.x, node1.position.y);
      canvas.lineTo(node2.position.x, node2.position.y);
      canvas.stroke();
      canvas.closePath();
    });

    this.nodes.forEach((node: NoteNode) => {
      const {position, note} = node;
      const {x, y} = position;
      const {letter, accidental} = getNoteInfo(note);

      // Draw nodes
      const nodeSize = 25;
      const fontSize = 20;
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
    const {dimensions} = world;

    // Cache dimensions so new nodes can be added
    this.dimensions = dimensions;

    // Adjust momentum by applying spring force between connected nodes
    this.edges.forEach(({node1, node2}) => {
      const {xForce, yForce} = springForce({
        point1: node1.position,
        point2: node2.position,
        springConstant: 0.1,
        targetDistance: 200
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
          coefficient: -10000, // repel,
          exponent: 1.5
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
    const dampingCoefficient = 0.8;
    this.nodes.forEach(({vector}) => {
      // Apply damping
      vector.xMomentum *= dampingCoefficient;
      vector.yMomentum *= dampingCoefficient;
    });

    // Limit to max velocity
    // const maxVelocity = 20;
    // this.nodes.forEach(({vector}) => {
    //   // Apply damping
    //   vector.xMomentum *= dampingCoefficient;
    //   vector.yMomentum *= dampingCoefficient;

    //   // Apply max velocity
    //   const velocity = Math.sqrt(Math.pow(vector.xMomentum, 2) + Math.pow(vector.yMomentum, 2));
    //   const ratio = maxVelocity / velocity;
    //   if (ratio < 1) {
    //     vector.xMomentum *= ratio;
    //     vector.yMomentum *= ratio;
    //   }
    // });

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
      node.panVol.dispose();
      node.synth.dispose();
    });
  }
}
