import {random, sample, times} from 'lodash';
import {Dimensions, IPosition, WorldState} from '../types';
import {getNoteInfo, Note} from '../util/Note';
import {noteColor} from './renderHelpers/noteColor';
import {Sprite} from './Sprite';

export interface NoteGraphParams {
  dimensions: Dimensions;
  notes?: Note[];
  numNodes?: number;
}

interface NoteNode {
  note: Note;
  position: IPosition;
  connectedNodes: Set<NoteNode>;
}

export class NoteGraph extends Sprite {
  private nodes = new Set<NoteNode>();

  constructor(params: NoteGraphParams) {
    super();
    const notes: Note[] = params.notes || [
      0, // C
      4, // E
      7 // G
    ];

    // Create nodes
    const numNodes = params.numNodes || 25;
    times(numNodes, () => {
      const node: NoteNode = {
        note: sample(notes) as Note,
        position: {
          x: random(0, params.dimensions.width),
          y: random(0, params.dimensions.height)
        },
        connectedNodes: new Set<NoteNode>()
      };
      this.nodes.add(node);
    });

    // Create edges
    const unconnectedNodes = new Set<NoteNode>(this.nodes);
    while (unconnectedNodes.size > 0) {
      const unconnectedNodesArray = Array.from(unconnectedNodes.values());
      const node1: NoteNode = sample(unconnectedNodesArray) as NoteNode;
      const node2: NoteNode = sample(unconnectedNodesArray) as NoteNode;
      node1.connectedNodes.add(node2);
      node2.connectedNodes.add(node1);
      unconnectedNodes.delete(node1);
      unconnectedNodes.delete(node2);
    }
  }

  public render(canvas: CanvasRenderingContext2D, world: WorldState): void {
    this.nodes.forEach((node: NoteNode) => {
      const {position, note} = node;
      const {x, y} = position;
      const {letter, accidental} = getNoteInfo(note);
      const nodeSize = 25;
      const fontSize = 20;
      const noteIsSelected = false;
      canvas.beginPath();
      canvas.arc(x, y, nodeSize, 0, 2 * Math.PI);
      canvas.fillStyle = noteColor(note);
      canvas.fill();
      canvas.font = noteIsSelected
        ? `bold ${fontSize * 1.25}px sans-serif`
        : `${fontSize}px sans-serif`;
      canvas.fillStyle = 'white';
      canvas.textAlign = 'center';
      canvas.textBaseline = 'middle';
      canvas.fillText(`${letter}${accidental ? '♯' : ''}`, x, y);
      canvas.closePath();
    });
  }

  public tick(world: WorldState) {}
}
