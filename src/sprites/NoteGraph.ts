import {random, sample, times} from 'lodash';
import {Synth} from 'tone';
import {electricalForce} from '../math/physics/electricalForce';
import {springForce} from '../math/physics/springForce';
import {Dimensions, IPosition, IVector, WorldState} from '../types';
import {getNoteInfo, Note} from '../util/Note';
import {noteColor} from './renderHelpers/noteColor';
import {Sprite} from './Sprite';

export interface NoteGraphParams {
  dimensions: Dimensions;
  notes?: Note[];
  numNodes?: number;
}

export interface NoteNode {
  note: Note;
  position: IPosition;
  vector: IVector;
  synth: Synth;
  connectedNodes: Set<NoteNode>;
}

interface NoteEdge {
  node1: NoteNode;
  node2: NoteNode;
}

export class NoteGraph extends Sprite {
  public nodes = new Set<NoteNode>();
  private edges = new Set<NoteEdge>();

  constructor(params: NoteGraphParams) {
    super();
    const notes: Note[] = params.notes || [
      48, // C
      52, // E
      55 // G
    ];

    // Create nodes
    const numNodes = params.numNodes || 20;
    times(numNodes, (idx: number) => {
      const note: Note = sample(notes) as Note;
      const synth = new Synth();
      synth.toMaster();
      const node: NoteNode = {
        note,
        vector: {
          xMomentum: 0,
          yMomentum: 0
        },
        position: {
          x: random(0, params.dimensions.width),
          y: random(0, params.dimensions.height)
        },
        connectedNodes: new Set<NoteNode>(),
        synth
      };
      this.nodes.add(node);
    });

    // Create edges
    const connectedNodes = new Set<NoteNode>();
    const unconnectedNodes = new Set<NoteNode>(this.nodes);
    const allNodes: NoteNode[] = Array.from(this.nodes);
    while (unconnectedNodes.size > 0) {
      const node1Bucket = connectedNodes.size ? Array.from(connectedNodes) : allNodes;
      const node1: NoteNode = sample(node1Bucket) as NoteNode;
      const node2: NoteNode = sample(allNodes) as NoteNode;
      if (
        node1.connectedNodes.has(node2) ||
        node1.connectedNodes.size > 4 ||
        node2.connectedNodes.size > 4
      ) {
        continue;
      }
      this.edges.add({
        node1,
        node2
      });
      node1.connectedNodes.add(node2);
      node2.connectedNodes.add(node1);
      connectedNodes.add(node1);
      connectedNodes.add(node2);
      unconnectedNodes.delete(node1);
      unconnectedNodes.delete(node2);
    }
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
      canvas.fillStyle = noteColor(note);
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
}
